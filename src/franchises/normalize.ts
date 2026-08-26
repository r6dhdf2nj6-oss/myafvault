import type { CatalogProduct, FranchiseId } from "@/types";

const MASTER_STAMP = "2024-01-01T00:00:00.000Z";

export function normalizeCatalogProduct(
  raw: Partial<CatalogProduct> &
    Pick<CatalogProduct, "id" | "name" | "franchise" | "category">,
): CatalogProduct {
  const releaseYear =
    typeof raw.releaseYear === "number" && raw.releaseYear > 0
      ? raw.releaseYear
      : null;
  const year =
    typeof raw.year === "number" && raw.year > 0
      ? raw.year
      : (releaseYear ?? undefined);
  const category = raw.category;
  const vehicleOrPlayset =
    raw.vehicleOrPlayset ??
    (/vehicle|playset/i.test(category) ||
      /vehicle|playset/i.test(raw.productType ?? ""));

  return {
    id: raw.id,
    franchise: raw.franchise,
    name: raw.name,
    category,
    subcategory: raw.subcategory,
    year,
    scale: raw.scale ?? "",
    manufacturer: raw.manufacturer,
    series: raw.series ?? "",
    character: raw.character ?? "",
    vehicleOrPlayset,
    imageUrl: raw.imageUrl ?? null,
    notes: raw.notes,
    owned: false,
    quantity: raw.quantity,
    condition: raw.condition,
    purchasePrice: raw.purchasePrice,
    purchaseDate: raw.purchaseDate,
    location: raw.location,
    wishlist: false,
    createdAt: raw.createdAt ?? MASTER_STAMP,
    updatedAt: raw.updatedAt ?? MASTER_STAMP,
    sku: raw.sku ?? "",
    accessories: raw.accessories ?? [],
    gallery: raw.gallery ?? [],
    productUrl: raw.productUrl ?? "",
    source: raw.source ?? "",
    features: raw.features ?? [],
    description: raw.description ?? "",
    brand: raw.brand ?? "",
    line: raw.line ?? "",
    productType: raw.productType ?? "",
    genre: raw.genre ?? "",
    releaseYear: releaseYear ?? year ?? null,
    releaseMonth: raw.releaseMonth ?? null,
  };
}

export function isFranchiseId(value: string): value is FranchiseId {
  return value === "dc" || value === "star-wars" || value === "gi-joe";
}
