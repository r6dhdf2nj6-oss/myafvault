import type { FranchiseId } from "@/types";
import { DC_CATEGORIES } from "./dc";
import { STAR_WARS_CATEGORIES } from "./star-wars";
import { GI_JOE_CATEGORIES } from "./gi-joe";
import { LEGO_CATEGORIES } from "./lego";

export type { FranchiseId } from "@/types";

export { DC_CATEGORIES } from "./dc";
export { STAR_WARS_CATEGORIES } from "./star-wars";
export { GI_JOE_CATEGORIES } from "./gi-joe";
export { LEGO_CATEGORIES } from "./lego";
export { loadDcCatalog } from "./dc";
export { loadStarWarsCatalog } from "./star-wars";
export { loadGiJoeCatalog } from "./gi-joe";
export { loadLegoCatalog } from "./lego";

export interface FranchiseDef {
  id: FranchiseId;
  name: string;
  categories: readonly string[];
}

export const FRANCHISES: Record<FranchiseId, FranchiseDef> = {
  dc: {
    id: "dc",
    name: "DC",
    categories: DC_CATEGORIES,
  },
  "star-wars": {
    id: "star-wars",
    name: "Star Wars",
    categories: STAR_WARS_CATEGORIES,
  },
  "gi-joe": {
    id: "gi-joe",
    name: "GI Joe",
    categories: GI_JOE_CATEGORIES,
  },
  lego: {
    id: "lego",
    name: "LEGO",
    categories: LEGO_CATEGORIES,
  },
};

export function franchiseCategories(id: FranchiseId): readonly string[] {
  return FRANCHISES[id].categories;
}
