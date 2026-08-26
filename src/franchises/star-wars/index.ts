import type { CatalogProduct } from "@/types";
import { normalizeCatalogProduct } from "@/franchises/normalize";
import raw from "../../../data/star-wars/catalog.json";
import { STAR_WARS_CATEGORIES } from "./categories";

export { STAR_WARS_CATEGORIES } from "./categories";
export type { StarWarsCategory } from "./categories";

export function loadStarWarsCatalog(): CatalogProduct[] {
  return (raw as CatalogProduct[]).map((row) =>
    normalizeCatalogProduct({ ...row, franchise: "star-wars" }),
  );
}

export function isStarWarsCategory(value: string): boolean {
  return (STAR_WARS_CATEGORIES as readonly string[]).includes(value);
}
