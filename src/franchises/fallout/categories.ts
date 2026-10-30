export const FALLOUT_CATEGORIES = [
  "Gaming Edition",
  "TV Series",
  "Deluxe",
  "Elite Edition",
  "Posed Figures",
  "Multipacks",
  "Mini Figures",
  "Other Fallout",
] as const;

export type FalloutCategory = (typeof FALLOUT_CATEGORIES)[number];
