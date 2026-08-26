import type { CatalogProduct } from "@/types";
import { normalizeCatalogProduct } from "@/franchises/normalize";
import raw from "../../../data/dc/catalog.json";
import { DC_CATEGORIES } from "./categories";

export { DC_CATEGORIES } from "./categories";
export type { DcCategory } from "./categories";

export function loadDcCatalog(): CatalogProduct[] {
  return (raw as CatalogProduct[]).map((row) =>
    normalizeCatalogProduct({ ...row, franchise: "dc" }),
  );
}

export function isDcCategory(value: string): boolean {
  return (DC_CATEGORIES as readonly string[]).includes(value);
}
