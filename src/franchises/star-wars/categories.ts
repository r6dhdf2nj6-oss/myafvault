export const STAR_WARS_CATEGORIES = [
  "Kenner 3.75-inch",
  "Kenner Vehicles",
  "Kenner Playsets",
  "Modern 3.75-inch",
  "Black Series 6-inch",
  "Vintage Collection",
  "Other Star Wars",
] as const;

export type StarWarsCategory = (typeof STAR_WARS_CATEGORIES)[number];
