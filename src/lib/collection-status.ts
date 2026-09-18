import type {
  AccessoryCheck,
  CollectionStatus,
  IncomingDetails,
  ShipState,
  UserEntry,
} from "@/lib/types";
import type { CatalogAccessory, CatalogProduct } from "@/types";
import { accessoryNames, normalizeAccessories } from "@/lib/accessories";

export const COLLECTION_STATUSES: readonly CollectionStatus[] = [
  "none",
  "owned",
  "wishlist",
  "incoming",
] as const;

export const SHIP_STATES: readonly { value: ShipState; label: string }[] = [
  { value: "ordered", label: "Ordered" },
  { value: "shipped", label: "Shipped" },
  { value: "arrived", label: "Arrived" },
  { value: "cancelled", label: "Cancelled" },
];

export function emptyIncoming(): IncomingDetails {
  return {
    retailer: "",
    orderNumber: "",
    orderedAt: null,
    eta: null,
    shipState: "ordered",
    trackingUrl: "",
  };
}

export function collectionStatus(
  entry?: UserEntry | null,
): CollectionStatus {
  if (!entry) return "none";
  if (entry.status === "incoming") return "incoming";
  if (entry.status === "owned" || entry.owned) return "owned";
  if (entry.status === "wishlist" || entry.wishlist) return "wishlist";
  if (entry.status === "none") return "none";
  return "none";
}

export function statusFlags(
  status: CollectionStatus,
): Pick<UserEntry, "status" | "owned" | "wishlist"> {
  return {
    status,
    owned: status === "owned",
    wishlist: status === "wishlist",
  };
}

export function isSealedCondition(entry?: UserEntry | null): boolean {
  const condition = entry?.condition;
  return condition === "mint";
}

export function catalogAccessoriesFor(
  product: Pick<CatalogProduct, "id" | "sku" | "accessories">,
): CatalogAccessory[] {
  return normalizeAccessories(product.accessories, {
    id: product.id,
    sku: product.sku,
  });
}

export function accessoryCheckMap(
  entry?: UserEntry | null,
): Record<string, AccessoryCheck> {
  return entry?.accessoryChecks ?? {};
}

export function isAccessoryPresent(
  checks: Record<string, AccessoryCheck> | undefined,
  accessoryId: string,
): boolean {
  return !!checks?.[accessoryId]?.present;
}

export type Completeness = {
  present: number;
  total: number;
  unknown: boolean;
  complete: boolean;
  label: string;
};

export function figureCompleteness(
  product: Pick<
    CatalogProduct,
    "id" | "sku" | "accessories" | "accessoriesUnknown"
  >,
  entry?: UserEntry | null,
): Completeness {
  const accessories = catalogAccessoriesFor(product);
  const unknown = !!product.accessoriesUnknown || accessories.length === 0;
  if (unknown) {
    return {
      present: 0,
      total: 0,
      unknown: true,
      complete: false,
      label: "Parts unknown",
    };
  }
  const checks = accessoryCheckMap(entry);
  const present = accessories.filter((a) => checks[a.id]?.present).length;
  return {
    present,
    total: accessories.length,
    unknown: false,
    complete: present === accessories.length,
    label: `${present}/${accessories.length}`,
  };
}

export function allPresentChecks(
  accessories: CatalogAccessory[],
): Record<string, AccessoryCheck> {
  const next: Record<string, AccessoryCheck> = {};
  for (const accessory of accessories) {
    next[accessory.id] = {
      accessoryId: accessory.id,
      present: true,
      quantity: 1,
    };
  }
  return next;
}

export function searchAccessoryHaystack(
  product: Pick<CatalogProduct, "accessories">,
): string {
  return accessoryNames(product.accessories).join(" ");
}
