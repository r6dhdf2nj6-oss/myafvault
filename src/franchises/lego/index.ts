import type { CatalogProduct } from "@/types";
import { normalizeCatalogProduct } from "@/franchises/normalize";
import raw from "../../../data/lego/catalog.json";
import { LEGO_CATEGORIES } from "./categories";

export { LEGO_CATEGORIES } from "./categories";
export type { LegoCategory } from "./categories";

export function loadLegoCatalog(): CatalogProduct[] {
  return (raw as CatalogProduct[]).map((row) =>
    normalizeCatalogProduct({ ...row, franchise: "lego" }),
  );
}

export function isLegoCategory(value: string): boolean {
  return (LEGO_CATEGORIES as readonly string[]).includes(value);
}
