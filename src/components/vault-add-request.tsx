import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vaultAddRequestMailto } from "@/lib/contact";
import { cn } from "@/lib/utils";

const HEADLINE = "Don't see a figure you own?";
const ACTION = "Request to add it to the Vault.";

export function VaultAddRequestCard({
  className,
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <a
      href={vaultAddRequestMailto()}
      id={id}
      className={cn(
        "block rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6 transition-colors hover:border-primary/60 hover:bg-primary/[0.04]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary/15 text-primary">
          <Mail className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="text-base font-semibold tracking-tight">{HEADLINE}</p>
          <p className="text-sm text-muted leading-relaxed">
            {ACTION} Tell us the name, line, year, and SKU if you have them.
            Your mail app opens with a short note ready to send.
          </p>
          <span className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-primary">
            Request an addition
            <Mail className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

export function VaultAddRequestLink({ className }: { className?: string }) {
  return (
    <a
      href={vaultAddRequestMailto()}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-fg",
        className,
      )}
    >
      <Mail className="h-4 w-4" />
      Request a figure
    </a>
  );
}

export function VaultAddRequestTab({ className }: { className?: string }) {
  return (
    <a
      href={vaultAddRequestMailto()}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-sm font-medium text-fg hover:border-primary/60 hover:bg-primary/[0.06] sm:w-auto sm:max-w-xl sm:justify-start",
        className,
      )}
    >
      <Mail className="h-4 w-4 shrink-0 text-primary" />
      <span className="text-pretty text-left">
        {HEADLINE} {ACTION}
      </span>
    </a>
  );
}

export function VaultAddRequestButton({
  className,
  size = "sm",
  variant = "ghost",
}: {
  className?: string;
  size?: "sm" | "lg";
  variant?: "ghost" | "outline";
}) {
  return (
    <Button asChild size={size} variant={variant} className={className}>
      <a href={vaultAddRequestMailto()}>
        <Mail className="h-4 w-4" />
        Request a figure
      </a>
    </Button>
  );
}
