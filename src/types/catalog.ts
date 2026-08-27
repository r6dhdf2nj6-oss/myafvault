export type FranchiseId = "dc" | "star-wars" | "gi-joe" | "lego";

export type Condition =
  | "mint"
  | "near-mint"
  | "excellent"
  | "good"
  | "fair"
  | "poor";

/**
 * Shared master-catalog row.
 *
 * Ownership / wishlist / condition / personal photos stay on UserEntry.
 * Master rows default owned/wishlist to false.
 *
 * Extra optional fields after the shared surface keep the existing DC UI
 * (SKU, gallery, accessories, McFarlane metadata) working.
 */
export interface CatalogProduct {
  id: string;
  franchise: FranchiseId;
  name: string;
  category: string;
  subcategory?: string;
  year?: number;
  scale?: string;
  manufacturer?: string;
  series?: string;
  character?: string;
  vehicleOrPlayset?: boolean;
  imageUrl?: string | null;
  notes?: string;
  owned: boolean;
  quantity?: number;
  condition?: Condition;
  purchasePrice?: number;
  purchaseDate?: string;
  location?: string;
  wishlist: boolean;
  createdAt: string;
  updatedAt: string;

  /** Existing UI / McFarlane listing fields (optional extras). */
  sku?: string;
  accessories?: string[];
  gallery?: string[];
  productUrl?: string;
  source?: string;
  features?: string[];
  description?: string;
  brand?: string;
  line?: string;
  productType?: string;
  genre?: string;
  releaseYear?: number | null;
  releaseMonth?: number | null;
}

/** Legacy DC category keys stored on older custom listings. */
export type LegacyProductCategory =
  | "7-inch"
  | "megafig"
  | "multipack"
  | "vehicle"
  | "statue";

/** Category is a franchise-specific string; keep the old name for imports. */
export type ProductCategory = string;
