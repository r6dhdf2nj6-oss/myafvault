export const DC_CATEGORIES = [
  "McFarlane 7-inch",
  "McFarlane 12-inch",
  "McFarlane Vehicles",
  "McFarlane Playsets",
  "Gold Label",
  "Platinum Edition",
  "Page Punchers",
  "Other DC",
] as const;

export type DcCategory = (typeof DC_CATEGORIES)[number];
