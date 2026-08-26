import type { CatalogProduct, FranchiseId } from "@/types";
import {
  loadDcCatalog,
  loadGiJoeCatalog,
  loadStarWarsCatalog,
} from "@/franchises";

function releaseKey(product: CatalogProduct): number {
  const year = product.releaseYear ?? product.year;
  if (typeof year !== "number" || !Number.isFinite(year) || year <= 0) return -1;
  const month =
    typeof product.releaseMonth === "number" &&
    product.releaseMonth >= 1 &&
    product.releaseMonth <= 12
      ? product.releaseMonth
      : 0;
  return year * 12 + month;
}

function sortCatalog(list: CatalogProduct[]): CatalogProduct[] {
  return [...list].sort((a, b) => releaseKey(b) - releaseKey(a));
}

export const DC_CATALOG: CatalogProduct[] = sortCatalog(loadDcCatalog());
export const STAR_WARS_CATALOG: CatalogProduct[] = sortCatalog(
  loadStarWarsCatalog(),
);
export const GI_JOE_CATALOG: CatalogProduct[] = sortCatalog(loadGiJoeCatalog());

/** Combined master list — filter with catalogForFranchise() in vault routes. */
export const CATALOG: CatalogProduct[] = sortCatalog([
  ...DC_CATALOG,
  ...STAR_WARS_CATALOG,
  ...GI_JOE_CATALOG,
]);

export const CATALOG_BY_ID: Record<string, CatalogProduct> = Object.fromEntries(
  CATALOG.map((p) => [p.id, p]),
);

export function catalogForFranchise(id: FranchiseId): CatalogProduct[] {
  switch (id) {
    case "dc":
      return DC_CATALOG;
    case "star-wars":
      return STAR_WARS_CATALOG;
    case "gi-joe":
      return GI_JOE_CATALOG;
  }
}

export function catalogYear(
  product: Pick<CatalogProduct, "releaseYear" | "year">,
): number {
  const year = product.releaseYear ?? product.year;
  return typeof year === "number" && year > 0 ? year : -1;
}

export function catalogStats(franchise?: FranchiseId) {
  const list = franchise ? catalogForFranchise(franchise) : CATALOG;
  const byCategory: Record<string, number> = {};
  for (const p of list) {
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
  }
  return {
    total: list.length,
    byCategory,
  };
}
