import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Package } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { FRANCHISES, rememberSessionVault } from "@/lib/franchises";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeedbackButton } from "@/components/feedback-button";
import { SiteCredit } from "@/components/site-credit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vaults")({
  component: VaultPickerPage,
  head: () => ({
    meta: [
      { title: "Choose a vault · MyAFVault" },
      {
        name: "description",
        content:
          "Open your DC McFarlane, Star Wars, or GI Joe collection vault. More franchises coming soon.",
      },
    ],
  }),
});

function VaultPickerPage() {
  const { user, isPending } = useCurrentUserState();
  const signedIn = !isPending && !!user && !user.isDevFallback;

  if (authEnabled && isPending) {
    return (
      <div className="min-h-dvh grid place-items-center bg-bg text-muted">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading your vaults…
        </div>
      </div>
    );
  }

  if (authEnabled && !signedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="h-1 w-full bg-primary" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-primary-fg">
              <Package className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                MyAFVault
              </span>
              <span className="block truncate text-sm font-semibold tracking-tight">
                Choose a vault
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary mb-2">
            Your collection
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Which vault do you want to open?
          </h1>
          <p className="text-muted mt-2 text-sm sm:text-base leading-relaxed">
            DC McFarlane, Star Wars 3.75-inch Kenner/Hasbro, and GI Joe are live.
            Marvel, Fallout, and more lines are on the way.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FRANCHISES.map((f) => {
            const live = f.status === "live" && !!f.path;
            const CardInner = (
              <>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                      {live ? "Available now" : "Planned vault"}
                    </p>
                    <h2 className="text-lg font-semibold tracking-tight mt-0.5">
                      {f.name}
                    </h2>
                  </div>
                  <Badge variant={live ? "default" : "secondary"}>
                    {live ? "Live" : "Coming soon"}
                  </Badge>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {f.tagline}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {f.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] text-muted"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                  <span className="text-xs text-subtle">{f.scopeNote}</span>
                  {live ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Open vault
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-subtle">
                      Coming soon
                    </span>
                  )}
                </div>
              </>
            );

            if (live && f.path) {
              const path = f.path;
              return (
                <Link
                  key={f.id}
                  to={path}
                  onClick={() => rememberSessionVault(path)}
                  className={cn(
                    "block rounded-[var(--radius-xl)] border p-5 sm:p-6 transition-colors",
                    "border-primary/40 bg-primary/[0.06] hover:border-primary hover:bg-primary/10",
                  )}
                >
                  {CardInner}
                </Link>
              );
            }

            return (
              <div
                key={f.id}
                className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6 opacity-70"
              >
                {CardInner}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <FeedbackButton />
          <SiteCredit />
        </div>
      </footer>
    </div>
  );
}
