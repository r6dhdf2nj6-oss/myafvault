/**
 * Seed data/lego/catalog.json from Rebrickable daily CSV dumps.
 *
 * Sources (required — do not scrape HTML or call APIs):
 *   https://cdn.rebrickable.com/media/downloads/sets.csv.gz
 *   https://cdn.rebrickable.com/media/downloads/themes.csv.gz
 *
 * Re-runnable: overwrites the catalog array. Does not merge or duplicate.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "data/lego");
const outPath = join(outDir, "catalog.json");
const stamp = "2024-01-01T00:00:00.000Z";

const SETS_URL = "https://cdn.rebrickable.com/media/downloads/sets.csv.gz";
const THEMES_URL = "https://cdn.rebrickable.com/media/downloads/themes.csv.gz";

const YEAR_MIN = 2000;
const YEAR_MAX = 2026;

/** Exact CatalogProduct.category strings. */
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
];

/**
 * Theme roots whose entire parent_id subtree maps to a named category.
 * IDs are Rebrickable theme ids from themes.csv.
 */
const CATEGORY_ROOTS = {
  "Star Wars": [158, 171, 18, 209, 261],
  Marvel: [696, 287, 596, 751],
  DC: [695, 617, 592],
  "Harry Potter": [246, 667, 710],
  "Indiana Jones": [264],
  "Lord of the Rings": [561, 562, 566],
  "Jurassic World": [602, 274, 620],
  Disney: [608, 269, 780, 593, 615, 783],
  "Super Mario": [690],
  Minecraft: [577],
};

/**
 * Clearly licensed System themes that are not one of the 10 named categories.
 * Walked from themes.csv; Duplo / CMF counterparts are omitted.
 */
const OTHER_LICENSED_ROOTS = [
  270, // Ben 10
  272, // SpongeBob SquarePants
  317, // Avatar: The Last Airbender
  570, // Teenage Mutant Ninja Turtles
  575, // The Lone Ranger
  603, // Scooby-Doo
  606, // Angry Birds
  607, // Ghostbusters
  654, // The Powerpuff Girls
  669, // Overwatch
  680, // Stranger Things
  682, // Trolls: World Tour
  689, // Minions
  717, // Speed Racer
  724, // Avatar
  747, // Sonic The Hedgehog
  748, // Gabby's Dollhouse
  752, // Animal Crossing
  763, // Despicable Me 4
  764, // The Legend of Zelda
  765, // Wicked
  766, // Fortnite
  768, // Wednesday
  770, // Horizon Adventures
  772, // Bluey (System; Duplo Bluey is 788)
  775, // One Piece
  776, // Pokémon
  792, // KPop Demon Hunters
  796, // Shrek
];

/**
 * Original / non-System lines. Not used as include roots.
 * Listed so a future editor does not add them by name:
 *   Duplo 504, CMF 535, BrickHeadz 610, Dimensions 604,
 *   Gear 501, Books 497, Service Packs 443, City 52,
 *   Technic 1 (except 18 Technic Star Wars), Icons 721,
 *   Ninjago 435, Friends 494, Creator 22, Ideas/CUUSOO 576,
 *   Speed Champions 601, The LEGO Movie 578.
 */

const KNOWN_ROWS = [
  { sku: "75192-1", category: "Star Wars", nameIncludes: "Millennium Falcon" },
  { sku: "76215-1", category: "Marvel", nameIncludes: "Black Panther" },
  { sku: "71360-1", category: "Super Mario", nameIncludes: "Adventures with Mario" },
  { sku: "21161-1", category: "Minecraft", nameIncludes: "Crafting Box 3.0" },
];

function parseCsv(text) {
  const rows = [];
  let i = 0;
  let field = "";
  let row = [];
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((x) => x !== "")) rows.push(row);
  }
  return rows;
}

async function downloadGzCsv(url) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`${url} → HTTP ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      return parseCsv(gunzipSync(buf).toString("utf8"));
    } catch (err) {
      lastError = err;
      const wait = 2 ** (attempt + 2) * 1000;
      console.warn(`Download failed (${url}): ${err}. Retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError;
}

function dropSku(setNum) {
  if (!setNum.endsWith("-1")) return true;
  const num = setNum.slice(0, -2);
  // Magazine / foil packs (6-digit 12xxxx, 21xxxx)
  if (/^12\d{4}$/.test(num)) return true;
  if (/^21\d{4}$/.test(num)) return true;
  // Internal-looking 7-digit 65xxxxx / 66xxxxx
  if (/^65\d{5}$/.test(num)) return true;
  if (/^66\d{5}$/.test(num)) return true;
  return false;
}

function expandSubtree(themes, rootId) {
  const ids = new Set();
  const walk = (id) => {
    ids.add(id);
    for (const theme of themes.values()) {
      if (theme.parent_id === id) walk(theme.id);
    }
  };
  walk(rootId);
  return ids;
}

function buildThemeIndex(themeRows) {
  const themes = new Map();
  for (const [id, name, parentId] of themeRows) {
    themes.set(Number(id), {
      id: Number(id),
      name,
      parent_id: parentId ? Number(parentId) : null,
    });
  }
  return themes;
}

function buildCategoryByTheme(themes) {
  const categoryByTheme = new Map();

  const assign = (category, rootIds) => {
    for (const rootId of rootIds) {
      if (!themes.has(rootId)) {
        throw new Error(`Unknown Rebrickable theme id ${rootId} for ${category}`);
      }
      for (const id of expandSubtree(themes, rootId)) {
        if (!categoryByTheme.has(id)) categoryByTheme.set(id, category);
      }
    }
  };

  for (const [category, rootIds] of Object.entries(CATEGORY_ROOTS)) {
    assign(category, rootIds);
  }
  assign("Other Licensed", OTHER_LICENSED_ROOTS);
  return categoryByTheme;
}

function subcategoryFor(theme, category, themes) {
  if (!theme) return undefined;
  if (theme.name !== category) return theme.name;
  if (theme.parent_id != null) {
    const parent = themes.get(theme.parent_id);
    if (parent && parent.name !== category) return parent.name;
  }
  return undefined;
}

function toProduct(set, theme, category, subcategory) {
  const themeName = theme?.name ?? category;
  const row = {
    id: `lego-${set.set_num}`,
    franchise: "lego",
    name: set.name,
    category,
  };
  if (subcategory) row.subcategory = subcategory;
  row.year = set.year;
  row.scale = "";
  row.manufacturer = "LEGO";
  row.series = themeName;
  row.character = "";
  row.vehicleOrPlayset = false;
  row.imageUrl = set.img_url;
  row.owned = false;
  row.wishlist = false;
  row.createdAt = stamp;
  row.updatedAt = stamp;
  row.sku = set.set_num;
  row.accessories = [];
  row.gallery = [set.img_url];
  row.productUrl = `https://rebrickable.com/sets/${set.set_num}/`;
  row.source = "rebrickable.com";
  row.features = [];
  row.description = "";
  row.brand = "LEGO";
  row.line = themeName;
  row.productType = "Set";
  row.genre = "Movies & TV";
  row.releaseYear = set.year;
  row.releaseMonth = null;
  return row;
}

export async function seedLegoCatalog({ download = downloadGzCsv } = {}) {
  console.log("Downloading Rebrickable themes.csv.gz + sets.csv.gz …");
  const [themeCsv, setCsv] = await Promise.all([
    download(THEMES_URL),
    download(SETS_URL),
  ]);

  const [, ...themeRows] = themeCsv;
  const [, ...setRows] = setCsv;
  const themes = buildThemeIndex(themeRows);
  const categoryByTheme = buildCategoryByTheme(themes);

  const seen = new Set();
  const products = [];

  for (const [setNum, name, yearStr, themeIdStr, , imgUrl] of setRows) {
    if (!setNum || dropSku(setNum)) continue;
    const year = Number(yearStr);
    if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) continue;
    if (!imgUrl) continue;

    const themeId = Number(themeIdStr);
    const category = categoryByTheme.get(themeId);
    if (!category) continue;

    if (seen.has(setNum)) continue;
    seen.add(setNum);

    const theme = themes.get(themeId);
    const subcategory = subcategoryFor(theme, category, themes);
    products.push(
      toProduct(
        { set_num: setNum, name, year, img_url: imgUrl },
        theme,
        category,
        subcategory,
      ),
    );
  }

  products.sort((a, b) => {
    if (b.releaseYear !== a.releaseYear) return b.releaseYear - a.releaseYear;
    return a.sku < b.sku ? -1 : a.sku > b.sku ? 1 : 0;
  });

  const byCategory = Object.fromEntries(LEGO_CATEGORIES.map((c) => [c, 0]));
  for (const p of products) byCategory[p.category] += 1;

  console.log(`Mapped ${products.length} licensed System sets (${YEAR_MIN}–${YEAR_MAX}).`);
  for (const [category, count] of Object.entries(byCategory)) {
    console.log(`  ${category}: ${count}`);
  }

  if (products.length < 500 || products.length > 8000) {
    throw new Error(
      `Theme walk looks wrong: ${products.length} rows (expected roughly 2,500–3,200). Not writing.`,
    );
  }
  if (byCategory["Star Wars"] < 900) {
    throw new Error(
      `Star Wars count ${byCategory["Star Wars"]} is below ~900. Theme walk looks wrong.`,
    );
  }

  for (const known of KNOWN_ROWS) {
    const row = products.find((p) => p.sku === known.sku);
    if (!row) {
      throw new Error(`Known set ${known.sku} missing from catalog.`);
    }
    if (row.category !== known.category) {
      throw new Error(
        `Known set ${known.sku} mapped to ${row.category}, expected ${known.category}.`,
      );
    }
    if (!row.name.includes(known.nameIncludes)) {
      throw new Error(
        `Known set ${known.sku} name "${row.name}" does not include "${known.nameIncludes}".`,
      );
    }
    if (!row.imageUrl) {
      throw new Error(`Known set ${known.sku} has no imageUrl.`);
    }
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(products, null, 2)}\n`);
  console.log(`Wrote ${outPath}`);
  return products;
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  seedLegoCatalog().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
