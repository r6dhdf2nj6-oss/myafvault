export const STAR_WARS_CATEGORIES = [
  "Kenner 3.75-inch",
  "Kenner Vehicles",
  "Kenner Playsets",
  "Vintage Collection",
  "Retro Collection",
  "Black Series",
  "POTF2",
  "Prequels 3.75-inch",
] as const;

export type StarWarsCategory = (typeof STAR_WARS_CATEGORIES)[number];
