export const LEGO_CATEGORIES = [
  "Star Wars",
  "Marvel",
  "DC",
  "Harry Potter",
  "Indiana Jones",
  "Lord of the Rings",
  "Jurassic World",
  "Disney",
  "Super Mario",
  "Minecraft",
  "Other Licensed",
] as const;

export type LegoCategory = (typeof LEGO_CATEGORIES)[number];
