export const GI_JOE_CATEGORIES = [
  "Classified Series",
  "Retro Cardbacks",
  "Vintage 3.75-inch",
  "Vehicles",
  "HasLabs",
  "Playsets",
  "Other GI Joe",
] as const;

export type GiJoeCategory = (typeof GI_JOE_CATEGORIES)[number];
