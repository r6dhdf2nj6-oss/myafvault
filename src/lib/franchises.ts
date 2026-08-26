/**
 * Multi-franchise vault registry.
 * DC, Star Wars, and GI Joe are live. Marvel / Fallout stay coming-soon
 * (no invented Marvel catalog).
 */

import type { FranchiseId } from "@/types";

export type FranchiseStatus = "live" | "coming-soon";

export type FranchiseVaultPath =
  | "/vault/dc-mcfarlane"
  | "/vault/star-wars"
  | "/vault/gi-joe";

export type FranchiseVault = {
  id: string;
  /** Shared CatalogProduct franchise when this vault has a catalog. */
  catalogId?: FranchiseId;
  name: string;
  shortLabel: string;
  tagline: string;
  status: FranchiseStatus;
  path?: FranchiseVaultPath;
  highlights: string[];
  scopeNote: string;
};

/** Primary live vault for this product surface. */
export const PRIMARY_VAULT_ID = "dc-mcfarlane" as const;
export const PRIMARY_VAULT_PATH = "/vault/dc-mcfarlane" as const;

export const FRANCHISES: FranchiseVault[] = [
  {
    id: "dc-mcfarlane",
    catalogId: "dc",
    name: "DC McFarlane Multiverse",
    shortLabel: "DC McFarlane",
    tagline:
      "The living DC McFarlane catalogue — 7\" figures, Megafigs, statues, vehicles, Gold Label, Page Punchers, and chase Platinum editions.",
    status: "live",
    path: PRIMARY_VAULT_PATH,
    highlights: [
      "McFarlane 7-inch",
      "Gold Label",
      "Platinum Edition",
      "Vehicles",
      "Page Punchers",
    ],
    scopeNote: "1,000+ catalog entries",
  },
  {
    id: "star-wars",
    catalogId: "star-wars",
    name: "Star Wars",
    shortLabel: "Star Wars",
    tagline:
      "Kenner 3.75-inch from 1977 on, vehicles and playsets, modern 3.75-inch, and The Vintage Collection — tracked the same way as your DC vault.",
    status: "live",
    path: "/vault/star-wars",
    highlights: [
      "Kenner 3.75-inch",
      "Kenner Vehicles",
      "Kenner Playsets",
      "Vintage Collection",
      "Modern 3.75-inch",
    ],
    scopeNote: "Kenner / Hasbro 3.75-inch first seed",
  },
  {
    id: "gi-joe",
    catalogId: "gi-joe",
    name: "G.I. Joe",
    shortLabel: "GI Joe",
    tagline:
      "Classified Series and Retro Cardbacks first, then vintage 3.75-inch, vehicles, and HasLabs — same vault tools as DC and Star Wars.",
    status: "live",
    path: "/vault/gi-joe",
    highlights: [
      "Classified Series",
      "Retro Cardbacks",
      "Vintage 3.75-inch",
      "Vehicles",
      "HasLabs",
    ],
    scopeNote: "Classified + Retro + vintage first seed",
  },
  {
    id: "marvel",
    name: "Marvel",
    shortLabel: "Marvel",
    tagline:
      "Legends, Mega, and multi-packs — planned vault for Marvel-scale collecting.",
    status: "coming-soon",
    highlights: ["Legends", "Mega", "Multipacks"],
    scopeNote: "Coming soon",
  },
  {
    id: "fallout",
    name: "Fallout",
    shortLabel: "Fallout",
    tagline:
      "Wasteland figures and mega-scale builds in one vault when this franchise goes live.",
    status: "coming-soon",
    highlights: ["Figures", "Mega", "Sets"],
    scopeNote: "Coming soon",
  },
];

export function getFranchise(id: string): FranchiseVault | undefined {
  return FRANCHISES.find((f) => f.id === id);
}

export function getLiveFranchises(): FranchiseVault[] {
  return FRANCHISES.filter((f) => f.status === "live");
}

export function getVaultByCatalogId(
  catalogId: FranchiseId,
): FranchiseVault | undefined {
  return FRANCHISES.find((f) => f.catalogId === catalogId);
}

/** Stripe product meta — wire Checkout Session later. */
export const VAULT_ACCESS = {
  priceUsd: 3.99,
  priceLabel: "$3.99",

  billing: "one-time" as const,
  productName: "MyAFVault Lifetime Access",
  description:
    "One-time unlock for the DC, Star Wars, and GI Joe vaults — catalogue, In My Vault, wishlist, photos, collections, collector board, and cloud sync.",
  /** Checkout is live when STRIPE_SECRET_KEY is set on the server */
  stripeReady: true,
} as const;
