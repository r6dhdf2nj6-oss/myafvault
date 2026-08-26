import { CATALOG } from "./catalog";

export type CatalogLiteItem = {
  id: string;
  name: string;
  character: string;
  line: string;
  imageUrl: string | null;
};

export const CATALOG_LITE: CatalogLiteItem[] = CATALOG.map((p) => ({
  id: p.id,
  name: p.name,
  character: p.character ?? "",
  line: p.line ?? "",
  imageUrl: p.imageUrl ?? null,
}));

export const CATALOG_LITE_BY_ID: Record<string, CatalogLiteItem> =
  Object.fromEntries(CATALOG_LITE.map((p) => [p.id, p]));
