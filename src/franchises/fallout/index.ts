import type { CatalogProduct } from "@/types";
import {
  normalizeCatalogProduct,
  type RawCatalogProduct,
} from "@/franchises/normalize";
import raw from "../../../data/fallout/catalog.json";
import { FALLOUT_CATEGORIES } from "./categories";

export { FALLOUT_CATEGORIES } from "./categories";
export type { FalloutCategory } from "./categories";

export function loadFalloutCatalog(): CatalogProduct[] {
  return (raw as RawCatalogProduct[]).map((row) =>
    normalizeCatalogProduct({ ...row, franchise: "fallout" }),
  );
}

export function isFalloutCategory(value: string): boolean {
  return (FALLOUT_CATEGORIES as readonly string[]).includes(value);
}
