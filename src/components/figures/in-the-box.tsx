import { Check, Package } from "lucide-react";
import { toast } from "sonner";
import type { CatalogProduct, UserEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  catalogAccessoriesFor,
  figureCompleteness,
} from "@/lib/collection-status";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<string, string> = {
  head: "Head",
  hand: "Hand",
  weapon: "Weapon",
  effect: "Effect",
  stand: "Stand",
  card: "Card",
  vehicle_part: "Vehicle",
  other: "Other",
  baf: "BAF",
};

interface InTheBoxProps {
  product: CatalogProduct;
  entry: UserEntry | null;
  onToggle: (accessoryId: string, present: boolean) => void;
  onMarkAllPresent: (accessoryIds: string[]) => void;
}

export function InTheBox({
  product,
  entry,
  onToggle,
  onMarkAllPresent,
}: InTheBoxProps) {
  const accessories = catalogAccessoriesFor(product);
  const completeness = figureCompleteness(product, entry);
  const checks = entry?.accessoryChecks ?? {};

  if (completeness.unknown) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2/60 p-3.5">
        <h4 className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-subtle">
          <Package className="h-3.5 w-3.5" />
          In the box
        </h4>
        <p className="text-sm text-muted">
          Pack-accurate parts are not listed for this SKU yet. We will not invent
          accessories.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2/60 p-3.5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-subtle">
          <Package className="h-3.5 w-3.5" />
          In the box
          <span className="rounded-full bg-surface px-2 py-0.5 font-semibold tabular-nums text-fg">
            {completeness.label}
          </span>
        </h4>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => {
            onMarkAllPresent(accessories.map((a) => a.id));
            toast.success(`Marked ${accessories.length} accessories present`);
          }}
        >
          Mark all present
        </Button>
      </div>
      <ul className="space-y-1.5">
        {accessories.map((accessory) => {
          const present = !!checks[accessory.id]?.present;
          return (
            <li key={accessory.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-sm)] border px-2.5 py-2 text-sm leading-snug",
                  present
                    ? "border-success/30 bg-success/10 text-fg"
                    : "border-border bg-surface text-muted",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-border"
                  checked={present}
                  onChange={(e) => onToggle(accessory.id, e.target.checked)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-fg">{accessory.name}</span>
                  <span className="text-[11px] uppercase tracking-wide text-subtle">
                    {KIND_LABEL[accessory.kind] ?? accessory.kind}
                    {accessory.is_baf_part ? " · BAF part" : ""}
                  </span>
                </span>
                {present && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                )}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
