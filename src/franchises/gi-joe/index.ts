import type { CatalogProduct } from "@/types";
import { normalizeCatalogProduct } from "@/franchises/normalize";
import raw from "../../../data/gi-joe/catalog.json";
import { GI_JOE_CATEGORIES } from "./categories";

export { GI_JOE_CATEGORIES } from "./categories";
export type { GiJoeCategory } from "./categories";

export function loadGiJoeCatalog(): CatalogProduct[] {
  return (raw as CatalogProduct[]).map((row) =>
    normalizeCatalogProduct({ ...row, franchise: "gi-joe" }),
  );
}

export function isGiJoeCategory(value: string): boolean {
  return (GI_JOE_CATEGORIES as readonly string[]).includes(value);
}
