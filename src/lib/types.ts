export type {
  CatalogProduct,
  Condition,
  FranchiseId,
  LegacyProductCategory,
  ProductCategory,
} from "@/types";

import type { FranchiseId, ProductCategory } from "@/types";
import { DC_CATEGORIES } from "@/franchises/dc/categories";
import { STAR_WARS_CATEGORIES } from "@/franchises/star-wars/categories";
import { GI_JOE_CATEGORIES } from "@/franchises/gi-joe/categories";

const FRANCHISE_CATEGORY_MAP: Record<FranchiseId, readonly string[]> = {
  dc: DC_CATEGORIES,
  "star-wars": STAR_WARS_CATEGORIES,
  "gi-joe": GI_JOE_CATEGORIES,
};

export type FigureCondition =
  | "mint"
  | "near-mint"
  | "excellent"
  | "good"
  | "fair"
  | "opened"
  | "loose";

/** User-owned / tracked entry for a catalog product (or custom figure). */
export interface UserEntry {
  productId: string;
  owned: boolean;
  wishlist: boolean;
  condition: FigureCondition | null;
  purchasePrice: number | null;
  estimatedValue: number | null;
  purchaseDate: string | null;
  notes: string;
  /** User-uploaded photos as data URLs */
  personalPhotos: string[];
  /**
   * Prefer a personal photo as THIS user's card cover.
   * Does not affect other users or the system default cover.
   */
  usePersonalPhoto: boolean;
  /**
   * Which personal photo is the cover for this user only.
   * Defaults to 0 when usePersonalPhoto is true.
   */
  personalCoverIndex?: number;
  /** True if this is a user-created product not in master catalog */
  isCustom?: boolean;
  customProduct?: Partial<import("@/types").CatalogProduct> & {
    name: string;
    character: string;
    category: ProductCategory;
    franchise?: FranchiseId;
  };
  updatedAt: string;
  createdAt: string;
}

/**
 * User-built display / group — e.g. Justice League shelf, Dark Knight,
 * Teen Titans row. Multiple photos of the group; optional links to catalog IDs.
 */
export interface UserCollection {
  id: string;
  name: string;
  description: string;
  /** Free-text theme: team, movie, continuity, shelf, etc. */
  theme: string;
  /** Group photos (data URLs), max managed in store */
  photos: string[];
  /** Catalog / custom product ids staged in this group */
  productIds: string[];
  coverPhotoIndex: number;
  createdAt: string;
  updatedAt: string;
}

export const CONDITIONS: { value: FigureCondition; label: string }[] = [
  { value: "mint", label: "Mint (MISB)" },
  { value: "near-mint", label: "Near Mint" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "opened", label: "Opened / Complete" },
  { value: "loose", label: "Loose" },
];

export const DC_LINES = [
  "DC Multiverse",
  "Gold Label",
  "Platinum Edition",
  "Page Punchers",
  "Collectors Club",
  "Super Powers",
  "Super Friends",
  "Custom",
];

/** @deprecated Use franchise-specific lines; kept as DC default. */
export const LINES = DC_LINES;

export function categoriesForFranchise(
  franchise: FranchiseId = "dc",
): { value: ProductCategory | "all"; label: string }[] {
  return [
    { value: "all", label: "All" },
    ...FRANCHISE_CATEGORY_MAP[franchise].map((c) => ({
      value: c,
      label: c,
    })),
  ];
}

/** Default chip list (DC vault) so existing imports keep compiling. */
export const CATEGORIES: { value: ProductCategory | "all"; label: string }[] =
  categoriesForFranchise("dc");

export const LINES_BY_FRANCHISE: Record<FranchiseId, string[]> = {
  dc: DC_LINES,
  "star-wars": [
    "Kenner",
    "Power of the Force",
    "Power of the Force 2",
    "The Vintage Collection",
    "The Black Series",
    "Modern 3.75-inch",
    "Custom",
  ],
  "gi-joe": [
    "Classified Series",
    "Retro Cardback",
    "A Real American Hero",
    "HasLab",
    "Custom",
  ],
};

/** Suggested themes when creating a user collection / display. */
export const COLLECTION_THEME_SUGGESTIONS = [
  "Justice League",
  "Teen Titans",
  "Bat-Family",
  "The Dark Knight",
  "The Batman",
  "Superman movies",
  "Suicide Squad",
  "Crisis on Infinite Earths",
  "Villains",
  "Gold Label shelf",
  "Custom shelf",
] as const;
