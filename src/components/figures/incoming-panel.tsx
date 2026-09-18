import { Check, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import type { CatalogProduct, IncomingDetails, UserEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { emptyIncoming, SHIP_STATES } from "@/lib/collection-status";
import { displayImageFor } from "@/lib/product";
import { ProductImage } from "@/components/figures/product-image";
import { formatDate } from "@/lib/utils";

interface IncomingPanelProps {
  items: Array<{
    product: CatalogProduct;
    entry: UserEntry;
    systemCover?: string | null;
  }>;
  onOpen: (productId: string) => void;
  onUpdateIncoming: (productId: string, details: IncomingDetails) => void;
  onMarkArrived: (productId: string) => void;
}

export function IncomingPanel({
  items,
  onOpen,
  onUpdateIncoming,
  onMarkArrived,
}: IncomingPanelProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-border bg-surface px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-incoming">
          <Truck className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">
          Nothing incoming
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Mark a figure Incoming from its dossier to track retailer, order
          number, ETA, and a paste-only tracking link.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ product, entry, systemCover }) => {
        const incoming = entry.incoming ?? emptyIncoming();
        return (
          <article
            key={product.id}
            className="rounded-[var(--radius-xl)] border border-incoming/40 bg-incoming/[0.06] p-3 sm:p-4"
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpen(product.id)}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] ring-2 ring-incoming ring-offset-1 ring-offset-bg sm:h-24 sm:w-24"
              >
                <ProductImage
                  src={displayImageFor(product, entry, systemCover)}
                  alt={product.name}
                  className="h-full w-full"
                  imgClassName="p-0.5"
                  sizes="96px"
                  fallbacks={product.gallery}
                />
              </button>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpen(product.id)}
                    className="min-w-0 text-left"
                  >
                    <h3 className="font-semibold leading-snug text-fg">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {product.character}
                      {incoming.retailer ? ` · ${incoming.retailer}` : ""}
                    </p>
                  </button>
                  <span className="incoming-badge inline-flex items-center rounded-full bg-incoming px-2 py-0.5 text-[10px] font-semibold text-incoming-fg">
                    Incoming
                  </span>
                </div>
                <IncomingFields
                  value={incoming}
                  onChange={(details) => onUpdateIncoming(product.id, details)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onMarkArrived(product.id);
                      toast.success("Moved to In My Vault");
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Arrived — add to vault
                  </Button>
                  <p className="text-[11px] text-subtle">
                    Ordered {formatDate(incoming.orderedAt)}
                    {incoming.eta ? ` · ETA ${formatDate(incoming.eta)}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function IncomingFields({
  value,
  onChange,
}: {
  value: IncomingDetails;
  onChange: (next: IncomingDetails) => void;
}) {
  const current = value ?? emptyIncoming();

  function patch(partial: Partial<IncomingDetails>) {
    onChange({ ...current, ...partial });
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="grid gap-1 min-w-0">
        <Label className="text-[11px]">Retailer</Label>
        <Input
          className="h-9 bg-surface"
          value={current.retailer}
          onChange={(e) => patch({ retailer: e.target.value })}
          placeholder="McFarlane, Target…"
        />
      </div>
      <div className="grid gap-1 min-w-0">
        <Label className="text-[11px]">Order #</Label>
        <Input
          className="h-9 bg-surface"
          value={current.orderNumber}
          onChange={(e) => patch({ orderNumber: e.target.value })}
        />
      </div>
      <div className="grid gap-1 min-w-0">
        <Label className="text-[11px]">Ordered</Label>
        <Input
          type="date"
          className="h-9 bg-surface"
          value={current.orderedAt ?? ""}
          onChange={(e) => patch({ orderedAt: e.target.value || null })}
        />
      </div>
      <div className="grid gap-1 min-w-0">
        <Label className="text-[11px]">ETA</Label>
        <Input
          type="date"
          className="h-9 bg-surface"
          value={current.eta ?? ""}
          onChange={(e) => patch({ eta: e.target.value || null })}
        />
      </div>
      <div className="grid gap-1 min-w-0">
        <Label className="text-[11px]">Ship state</Label>
        <Select
          value={current.shipState}
          onValueChange={(v) =>
            patch({ shipState: v as IncomingDetails["shipState"] })
          }
        >
          <SelectTrigger className="h-9 w-full bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHIP_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1 min-w-0">
        <Label className="text-[11px]">Tracking URL</Label>
        <Input
          type="url"
          className="h-9 bg-surface"
          value={current.trackingUrl}
          onChange={(e) => patch({ trackingUrl: e.target.value })}
          placeholder="Paste tracking link"
        />
      </div>
    </div>
  );
}

export function IncomingEmptyHint() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-subtle">
      <Package className="h-3.5 w-3.5" />
      Paste a carrier URL only — no live tracking.
    </p>
  );
}
