import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { isAdminEmail } from "@/lib/admin";
import { VAULT_ACCESS } from "@/lib/franchises";

function env(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function stripeConfigured(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY"));
}

function getStripe(): Stripe {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key);
}

export function publicAppOrigin(): string {
  return (
    env("BETTER_AUTH_URL") ||
    env("APP_URL") ||
    "https://www.myafvault.com"
  ).replace(/\/+$/, "");
}

export type AccessStatus = {
  paid: boolean;
  source: string | null;
  stripeReady: boolean;
};

async function rowForUser(userId: string) {
  const sql = await getSql();
  const rows = await sql.query<{
    user_id: string;
    status: string;
    source: string;
  }>(
    `select user_id, status, source from vault_access
     where user_id = $1 and status = 'active' limit 1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function grantVaultAccess(input: {
  userId: string;
  source: "stripe" | "admin" | "grandfathered" | "code";
  stripeSessionId?: string | null;
  stripeCustomerId?: string | null;
  stripePaymentIntent?: string | null;
}): Promise<void> {
  const sql = await getSql();
  await sql.query(
    `insert into vault_access (
       user_id, status, source, stripe_session_id, stripe_customer_id,
       stripe_payment_intent, paid_at
     ) values ($1, 'active', $2, $3, $4, $5, now())
     on conflict (user_id) do update set
       status = 'active',
       source = excluded.source,
       stripe_session_id = coalesce(excluded.stripe_session_id, vault_access.stripe_session_id),
       stripe_customer_id = coalesce(excluded.stripe_customer_id, vault_access.stripe_customer_id),
       stripe_payment_intent = coalesce(excluded.stripe_payment_intent, vault_access.stripe_payment_intent),
       paid_at = coalesce(vault_access.paid_at, now())`,
    [
      input.userId,
      input.source,
      input.stripeSessionId ?? null,
      input.stripeCustomerId ?? null,
      input.stripePaymentIntent ?? null,
    ],
  );
}

export async function userHasVaultAccess(
  userId: string,
  email?: string | null,
): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  if (!stripeConfigured()) return true;
  const row = await rowForUser(userId);
  return Boolean(row);
}

export const getAccessStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AccessStatus> => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const user = await getSessionUser(context.bearerToken);
    const paid = await userHasVaultAccess(context.userId, user?.email);
    const row = paid ? await rowForUser(context.userId) : null;
    return {
      paid,
      source: row?.source ?? (isAdminEmail(user?.email) ? "admin" : null),
      stripeReady: stripeConfigured(),
    };
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ url: string }> => {
    if (!stripeConfigured()) {
      throw new Error("Stripe is not connected yet.");
    }
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const user = await getSessionUser(context.bearerToken);
    if (await userHasVaultAccess(context.userId, user?.email)) {
      throw new Error("Access is already unlocked.");
    }

    const origin = publicAppOrigin();
    const stripe = getStripe();
    const priceId = env("STRIPE_PRICE_ID");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user?.email ?? undefined,
      client_reference_id: context.userId,
      metadata: {
        userId: context.userId,
        email: user?.email ?? "",
      },
      payment_intent_data: {
        statement_descriptor: "MYAFVAULT",
        description: VAULT_ACCESS.productName,
      },
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: Math.round(VAULT_ACCESS.priceUsd * 100),
                product_data: {
                  name: VAULT_ACCESS.productName,
                  description: VAULT_ACCESS.description,
                },
              },
            },
          ],
      success_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pay?canceled=1`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  });

export const confirmCheckoutSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { sessionId?: string }) => ({
    sessionId: typeof data?.sessionId === "string" ? data.sessionId.trim() : "",
  }))
  .handler(async ({ context, data }): Promise<AccessStatus> => {
    if (!data.sessionId) throw new Error("Missing checkout session.");
    if (!stripeConfigured()) {
      return { paid: true, source: null, stripeReady: false };
    }
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const sessionUser =
      session.client_reference_id || session.metadata?.userId || "";
    if (sessionUser && sessionUser !== context.userId) {
      throw new Error("This payment belongs to a different account.");
    }
    if (session.payment_status !== "paid" && session.status !== "complete") {
      throw new Error("Payment is not complete yet.");
    }
    const intent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
    const customer =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;
    await grantVaultAccess({
      userId: context.userId,
      source: "stripe",
      stripeSessionId: session.id,
      stripeCustomerId: customer,
      stripePaymentIntent: intent,
    });
    return { paid: true, source: "stripe", stripeReady: true };
  });

export const REDEEM_ERROR_STORAGE_KEY = "myafvault:redeem-error";

const INVALID_ACCESS_CODE = "That code is not valid or was already used.";

function normalizeAccessCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export const redeemAccessCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code?: string }) => ({
    code: normalizeAccessCode(typeof data?.code === "string" ? data.code : ""),
  }))
  .handler(async ({ context, data }): Promise<AccessStatus> => {
    if (!data.code) throw new Error("Enter an access code.");

    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const user = await getSessionUser(context.bearerToken);

    if (await userHasVaultAccess(context.userId, user?.email)) {
      const row = await rowForUser(context.userId);
      return {
        paid: true,
        source: row?.source ?? (isAdminEmail(user?.email) ? "admin" : null),
        stripeReady: stripeConfigured(),
      };
    }

    const { createHash } = await import("node:crypto");
    const codeHash = createHash("sha256").update(data.code, "utf8").digest("hex");
    const sql = await getSql();

    const alreadyRedeemed = await sql.query<{ code_hash: string }>(
      `select code_hash from access_codes
       where redeemed_by = $1
       limit 1`,
      [context.userId],
    );
    if (alreadyRedeemed[0]) {
      await grantVaultAccess({ userId: context.userId, source: "code" });
      return { paid: true, source: "code", stripeReady: stripeConfigured() };
    }

    const claimed = await sql.query<{ code_hash: string }>(
      `update access_codes
       set redeemed_by = $1, redeemed_at = now()
       where code_hash = $2
         and redeemed_at is null
         and not exists (
           select 1 from access_codes where redeemed_by = $1
         )
       returning code_hash`,
      [context.userId, codeHash],
    );
    if (!claimed[0]) {
      throw new Error(INVALID_ACCESS_CODE);
    }

    await grantVaultAccess({ userId: context.userId, source: "code" });
    return { paid: true, source: "code", stripeReady: stripeConfigured() };
  });
