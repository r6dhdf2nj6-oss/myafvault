import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Cloud,
  Eye,

  EyeOff,
  Heart,
  Layers,
  Loader2,
  Lock,
  Mail,
  Package,
  Smartphone,
  Ticket,
  User,
} from "lucide-react";

import { toast } from "sonner";
import { authEnabled, setSessionBearer } from "@/lib/auth/client";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth/email-auth";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { oauthErrorMessage } from "@/lib/auth-errors";
import { REDEEM_ERROR_STORAGE_KEY, redeemAccessCode } from "@/lib/billing";
import { VAULT_ACCESS, VAULT_PICKER_PATH } from "@/lib/franchises";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "signin" | "signup";

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "signin";
    const m = new URLSearchParams(window.location.search).get("mode");
    return m === "signup" ? "signup" : "signin";
  });
  const [emailBusy, setEmailBusy] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return oauthErrorMessage(
      new URLSearchParams(window.location.search).get("error"),
    );
  });
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [holdRedirect, setHoldRedirect] = useState(false);

  if (!isPending && user && !user.isDevFallback && !holdRedirect) {
    return <Navigate to={VAULT_PICKER_PATH} />;
  }


  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Email and password are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (mode === "signup" && name.trim().length < 1) {
      setError("Please enter a display name");
      return;
    }

    if (mode === "signup") setHoldRedirect(true);
    setEmailBusy(true);
    try {
      const result =
        mode === "signup"
          ? await signUpWithEmail({
              data: {
                email: trimmedEmail,
                password,
                name: name.trim(),
              },
            })
          : await signInWithEmail({
              data: { email: trimmedEmail, password },
            });

      if (!result.ok) {
        setHoldRedirect(false);
        setError(result.message);
        return;
      }

      if (result.token) {
        setSessionBearer(result.token);
      }

      if (mode === "signup") {
        const enteredCode = accessCode.trim();
        if (enteredCode) {
          try {
            await redeemAccessCode({ data: { code: enteredCode } });
            toast.success("Account created — access unlocked");
            window.location.href = VAULT_PICKER_PATH;
            return;
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : "That code is not valid or was already used.";
            setError(message);
            try {
              sessionStorage.setItem(REDEEM_ERROR_STORAGE_KEY, message);
            } catch {
              /* ignore */
            }
            toast.error(message);
            window.location.href = "/pay";
            return;
          }
        }
        toast.success("Account created — welcome to your vault");
        window.location.href = "/pay";
        return;
      }

      toast.success("Signed in — syncing your collection");

      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      window.location.href =
        next && next.startsWith("/") ? next : VAULT_PICKER_PATH;

    } catch (err) {
      setHoldRedirect(false);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setEmailBusy(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <div className="h-1 w-full bg-primary" aria-hidden />

      <header className="border-b border-border/80">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
              MyAFVault
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Package className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {mode === "signin"
                  ? "Welcome back to your vaults"
                  : "Create Your Personalized Vault Collection"}
              </h1>
              <p className="text-sm text-muted leading-relaxed max-w-sm mx-auto">
                {mode === "signin"
                  ? "Sign in to sync In My Vault, wishlist, photos, and collections across DC McFarlane, Star Wars, GI Joe, and LEGO."
                  : `Create an account, then unlock DC McFarlane, Star Wars, GI Joe, LEGO, plus Marvel, Fallout, Disney, Pixar, and more coming soon — ${VAULT_ACCESS.priceLabel} one-time, or skip payment with an access code.`}
              </p>
            </div>
          </div>

          <ul className="grid gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 text-sm">
            {[
              {
                Icon: Package,
                text: "Live vaults for DC McFarlane, Star Wars, GI Joe, and LEGO",
              },
              {
                Icon: Heart,
                text: "In My Vault and Wishlist stay separate — share either",
              },
              {
                Icon: Layers,
                text: "Collections, your photos, and custom listings",
              },
              {
                Icon: Smartphone,
                text: "Install as an app on phone or computer",
              },
              {
                Icon: Cloud,
                text: `${VAULT_ACCESS.priceLabel} one-time — cloud sync, no subscription. An access code skips payment.`,
              },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-muted">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{text}</span>
              </li>
            ))}
          </ul>


          {!authEnabled ? (
            <p className="text-sm text-muted text-center">
              Sign-in is disabled in this environment.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 rounded-[var(--radius-sm)] border border-border bg-surface p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className={cn(
                    "rounded-[var(--radius-xs)] py-2 text-sm font-medium transition-colors",
                    mode === "signin"
                      ? "bg-primary text-primary-fg shadow"
                      : "text-muted hover:text-fg",
                  )}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className={cn(
                    "rounded-[var(--radius-xs)] py-2 text-sm font-medium transition-colors",
                    mode === "signup"
                      ? "bg-primary text-primary-fg shadow"
                      : "text-muted hover:text-fg",
                  )}
                >
                  Create account
                </button>
              </div>

              <form onSubmit={onEmailSubmit} className="space-y-3.5">
                {error && (
                  <p
                    className="rounded-[var(--radius-sm)] border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                {mode === "signup" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Display name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                      <Input
                        id="name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Collector name"
                        className="pl-9"
                        disabled={emailBusy}
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-9"
                      disabled={emailBusy}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "signup"
                          ? "At least 8 characters"
                          : "Your password"
                      }
                      className="pl-9 pr-10"
                      disabled={emailBusy}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-subtle hover:text-fg"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="access-code">Access code (optional)</Label>
                    <div className="relative">
                      <Ticket className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                      <Input
                        id="access-code"
                        autoComplete="off"
                        spellCheck={false}
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="MYAF-XXXX-XXXX"
                        className="pl-9 uppercase"
                        disabled={emailBusy}
                      />
                    </div>
                    <p className="text-xs text-subtle">
                      Have a code? It unlocks lifetime access and skips the{" "}
                      {VAULT_ACCESS.priceLabel} payment.
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={emailBusy}>
                  {emailBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === "signup" ? "Creating account…" : "Signing in…"}
                    </>
                  ) : mode === "signup" ? (
                    accessCode.trim()
                      ? "Create account"
                      : "Create account — then unlock"
                  ) : (
                    "Sign in to your vaults"
                  )}
                </Button>
              </form>

              <p className="text-xs text-subtle text-center leading-relaxed flex items-start justify-center gap-1.5">
                <Cloud className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <span>
                  After sign-in, pay {VAULT_ACCESS.priceLabel} once if you have
                  not already, or redeem an access code to skip payment.
                  Optional 2FA lives under Security on your profile.
                </span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
