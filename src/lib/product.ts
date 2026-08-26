import type {
  CatalogProduct,
  FranchiseId,
  ProductCategory,
  UserEntry,
} from "@/lib/types";
import { CATALOG_BY_ID } from "@/data/catalog";
import { figurePlaceholder } from "@/lib/image";

const LEGACY_DC_CATEGORY: Record<string, string> = {
  "7-inch": "McFarlane 7-inch",
  megafig: "McFarlane 7-inch",
  vehicle: "McFarlane Vehicles",
  statue: "McFarlane 12-inch",
  multipack: "Other DC",
};

export function mapLegacyCategory(
  category: string,
  franchise: FranchiseId = "dc",
): string {
  if (franchise === "dc" && LEGACY_DC_CATEGORY[category]) {
    return LEGACY_DC_CATEGORY[category];
  }
  return category;
}

export interface DisplayProduct extends CatalogProduct {
  entry: UserEntry | null;
  displayImage: string;
  hasPersonalPhoto: boolean;
}

export function resolveProduct(
  productId: string,
  entry?: UserEntry | null,
): CatalogProduct | null {
  if (entry?.isCustom && entry.customProduct) {
    const c = entry.customProduct;
    const franchise = c.franchise ?? "dc";
    const releaseYear = c.releaseYear ?? c.year ?? null;
    return {
      id: productId,
      franchise,
      name: c.name,
      category: mapLegacyCategory(c.category, franchise),
      year: typeof releaseYear === "number" ? releaseYear : undefined,
      character: c.character,
      brand: c.brand ?? "Custom",
      line: c.line ?? "Custom",
      scale: c.scale ?? '7"',
      productType: c.productType ?? "Action Figure",
      genre: c.genre ?? "Comics",
      series: c.series ?? "",
      releaseYear,
      releaseMonth: c.releaseMonth ?? null,
      sku: c.sku ?? "",
      description: c.description ?? "",
      features: c.features ?? [],
      accessories: c.accessories ?? [],
      imageUrl: c.imageUrl ?? null,
      gallery: c.gallery ?? [],
      productUrl: c.productUrl ?? "",
      source: "user",
      owned: entry.owned,
      wishlist: entry.wishlist,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
  return CATALOG_BY_ID[productId] ?? null;
}

/**
 * Resolve the cover shown on cards / list rows.
 *
 * Priority:
 * 1. This user's personal cover (account-only — never affects others)
 * 2. Admin system cover (shared default for all users)
 * 3. Catalog pack shot
 * 4. Placeholder
 */
export function displayImageFor(
  product: CatalogProduct,
  entry?: UserEntry | null,
  systemCover?: string | null,
): string {
  if (entry?.usePersonalPhoto && entry.personalPhotos.length > 0) {
    const idx = clampIndex(
      entry.personalCoverIndex ?? 0,
      entry.personalPhotos.length,
    );
    return entry.personalPhotos[idx]!;
  }
  if (systemCover) {
    return systemCover;
  }
  if (entry?.personalPhotos.length && !product.imageUrl) {
    return entry.personalPhotos[0]!;
  }
  return product.imageUrl ?? figurePlaceholder(product.name);
}

/** Official + system default gallery for detail view (system cover first when set). */
export function officialImagesFor(
  product: CatalogProduct,
  systemCover?: string | null,
): string[] {
  const gallery = product.gallery ?? [];
  const base =
    gallery.length > 0
      ? [...gallery]
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  if (!systemCover) return base;
  if (base.includes(systemCover)) {
    return [systemCover, ...base.filter((u) => u !== systemCover)];
  }
  return [systemCover, ...base];
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  if (!Number.isFinite(index) || index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

export function formatAccessories(product: CatalogProduct): string[] {
  if (product.accessories?.length) return product.accessories;
  return (product.features ?? []).filter((f) => {
    const low = f.toLowerCase();
    return (
      low.includes("include") ||
      low.includes("comes with") ||
      low.includes("hand") ||
      low.includes("weapon") ||
      low.includes("card") ||
      low.includes("base")
    );
  });
}

export function categoryLabel(c: ProductCategory): string {
  switch (c) {
    case "7-inch":
      return '7" Figure';
    case "megafig":
      return "Megafig";
    case "multipack":
      return "Multipack";
    case "vehicle":
      return "Vehicle";
    case "statue":
      return "Statue";
    default:
      return c;
  }
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatRelease(
  product: Pick<CatalogProduct, "releaseYear" | "releaseMonth" | "year">,
): string {
  const year = product.releaseYear ?? product.year;
  if (!year) return "";
  const month = product.releaseMonth;
  if (typeof month === "number" && month >= 1 && month <= 12) {
    return `${MONTHS[month - 1]} ${year}`;
  }
  return String(year);
}

/** Higher = newer. Year * 12 + month; missing month sorts before January. */
export function releaseSortValue(
  product: Pick<CatalogProduct, "releaseYear" | "releaseMonth" | "year">,
  newestFirst = true,
): number {
  const year = product.releaseYear ?? product.year;
  if (typeof year !== "number" || !Number.isFinite(year) || year <= 0) {
    return newestFirst ? -1 : 9999 * 12;
  }
  const month =
    typeof product.releaseMonth === "number" &&
    product.releaseMonth >= 1 &&
    product.releaseMonth <= 12
      ? product.releaseMonth
      : 0;
  return year * 12 + month;
}

export type PlatinumKind = "platinum" | "red";

/** Silver Platinum vs Red Platinum chase, or null if not a platinum listing. */
export function platinumKind(product: {
  id?: string;
  name?: string;
  character?: string;
  line?: string;
}): PlatinumKind | null {
  const hay =
    `${product.name ?? ""} ${product.id ?? ""} ${product.character ?? ""} ${product.line ?? ""}`.toLowerCase();
  if (hay.includes("red platinum")) return "red";
  if (hay.includes("platinum")) return "platinum";
  return null;
}
