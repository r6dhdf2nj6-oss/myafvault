/**
 * Expand data/star-wars/catalog.json only.
 * Pulse rows are fetched live (official names, SKUs, pack shots).
 * Original Kenner / POTF2 / prequel 3.75-inch rows are metadata-only.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HISTORICAL_SW } from "./star-wars-historical.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "data/star-wars/catalog.json");
const stamp = "2024-01-01T00:00:00.000Z";

/** Confirmed or high-confidence Pulse product paths. SKU is the key. */
const PULSE_SPECS = [
  // Existing seed — keep, but refresh from Pulse and fix remapped slugs
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-luke-skywalker/G09035X00", category: "Vintage Collection", character: "Luke Skywalker", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-luke-skywalker-xwing-pilot/F97885X00", category: "Vintage Collection", character: "Luke Skywalker", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-han-solo/G09215X21", category: "Vintage Collection", character: "Han Solo", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-darth-vader/F97845X00", category: "Vintage Collection", character: "Darth Vader", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-chewbacca/G09235X21", category: "Vintage Collection", character: "Chewbacca", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-landspeeder-vehicle/G06735L00", category: "Kenner Vehicles", character: "Luke Skywalker", year: 2024, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-streets-of-mos-eisley/G06715L00", category: "Kenner Playsets", character: "Jawa", year: 2024, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-mos-eisley-set/G32105L00", category: "Vintage Collection", character: "Mos Eisley", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-phase-i-clone-troopers/G33095L00", category: "Vintage Collection", character: "Clone Trooper", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-xwing-fighter-and-luke-skywalker-xwing-kenner-colors/G25375L00", category: "Kenner Vehicles", character: "Luke Skywalker", year: 2026, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-luke-skywalkers-xwing-fighter-vehicle/E6137AV20", category: "Kenner Vehicles", character: "Luke Skywalker", year: 2021, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-jedi-master-indara/G09045X00", category: "Vintage Collection", character: "Jedi Master Indara", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-r2d2/F97865X00", category: "Vintage Collection", character: "R2-D2", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-stormtrooper/F97875X00", category: "Vintage Collection", character: "Stormtrooper", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-osha-aniseya/F97895X00", category: "Vintage Collection", character: "Osha Aniseya", year: 2024 },

  // Additional current TVC Pulse listings
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-captain-enoch-thrawns-night-troopers/F92595L00", category: "Vintage Collection", character: "Captain Enoch", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-imperial-armored-commando/G12875L00", category: "Vintage Collection", character: "Imperial Armored Commando", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-anakin-skywalker-asajj-ventress/G27685L00", category: "Vintage Collection", character: "Anakin Skywalker", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-laati-gunship/G25385L00", category: "Vintage Collection", character: "Clone Trooper Pilot", year: 2026, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-eleventh-brother/G26225X00", category: "Vintage Collection", character: "Eleventh Brother", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-phase-ii-clone-trooper/F93965L00", category: "Vintage Collection", character: "Clone Trooper", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-anakin-skywalker-3pack/G12825L00", category: "Vintage Collection", character: "Anakin Skywalker", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-bantha-tusken-raider-2pack/G13005L00", category: "Vintage Collection", character: "Tusken Raider", year: 2025, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-star-wars-heir-to-the-empire-figure-3pack/G12835L00", category: "Vintage Collection", character: "Grand Admiral Thrawn", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-jedi-spirits-3pack/G13955L00", category: "Vintage Collection", character: "Anakin Skywalker", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-ig12-grogu-anzellan/G06705L00", category: "Vintage Collection", character: "Grogu", year: 2025, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-howler-sabine-wren-peridea/G06725L00", category: "Vintage Collection", character: "Sabine Wren", year: 2025, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-darth-vaders-tie-advanced/G12805L00", category: "Vintage Collection", character: "Darth Vader", year: 2025, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-baylan-skoll/G09105X21", category: "Vintage Collection", character: "Baylan Skoll", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-shin-hati/G09115X21", category: "Vintage Collection", character: "Shin Hati", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-the-stranger-qimir/G26115X00", category: "Vintage Collection", character: "The Stranger", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-padmé-amidala/G26125X00", category: "Vintage Collection", character: "Padmé Amidala", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-padme-amidala/G26125X00", category: "Vintage Collection", character: "Padmé Amidala", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-shaak-ti/G26135X00", category: "Vintage Collection", character: "Shaak Ti", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-poggle-the-lesser/G26025X00", category: "Vintage Collection", character: "Poggle the Lesser", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-general-veers-atat-commander/G26035X00", category: "Vintage Collection", character: "General Veers", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-greedo/G26045X00", category: "Vintage Collection", character: "Greedo", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-snowtrooper-commander/G26055X00", category: "Vintage Collection", character: "Snowtrooper Commander", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-imperial-snowtrooper-commander/G26055X00", category: "Vintage Collection", character: "Snowtrooper Commander", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-darth-vader-emperors-wrath/G26145X00", category: "Vintage Collection", character: "Darth Vader", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-darth-vader-emperors-wrath/G26325X00", category: "Vintage Collection", character: "Darth Vader", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-maul/G26155X00", category: "Vintage Collection", character: "Maul", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-geonosian-warriors/G27695L00", category: "Vintage Collection", character: "Geonosian Warrior", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-geonosian-warriors/G32115L00", category: "Vintage Collection", character: "Geonosian Warrior", year: 2026 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-the-ghost/G00405L00", category: "Vintage Collection", character: "Hera Syndulla", year: 2024, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-ahsoka-tano/F73015X00", category: "Retro Collection", character: "Ahsoka Tano", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-ahsoka-tano/F73025X00", category: "Retro Collection", character: "Ahsoka Tano", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-ahsoka-tano/F73025L00", category: "Retro Collection", character: "Ahsoka Tano", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-the-mandalorian/F85635X21", category: "Retro Collection", character: "The Mandalorian", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-the-mandalorian/F85635L00", category: "Retro Collection", character: "The Mandalorian", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-the-ghost/F93775L00", category: "Vintage Collection", character: "Hera Syndulla", year: 2025, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-the-ghost/G03875L00", category: "Vintage Collection", character: "Hera Syndulla", year: 2025, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-mos-eisley-cantina/G03885L00", category: "Vintage Collection", character: "Wuher", year: 2025, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-cantina-adventure-set/G13965L00", category: "Vintage Collection", character: "Greedo", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-battle-droid-troop-builder/G13975L00", category: "Vintage Collection", character: "Battle Droid", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-snowtrooper-4pack/G13985L00", category: "Vintage Collection", character: "Snowtrooper", year: 2025 },

  // Retro Collection Pulse
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-luke-skywalker/F97585X00", category: "Retro Collection", character: "Luke Skywalker", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-the-mandalorian/F85635X00", category: "Retro Collection", character: "The Mandalorian", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-grogu/F85675X00", category: "Retro Collection", character: "Grogu", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-morgan-elsbeth/F73035X22", category: "Retro Collection", character: "Morgan Elsbeth", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-chopper-c110p/F73075X22", category: "Retro Collection", character: "Chopper", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-star-wars-the-acolyte-figure-multipack/G03865L00", category: "Retro Collection", character: "Osha Aniseya", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-star-wars-episode-ii-episode-iii-multipack/G03715L00", category: "Retro Collection", character: "Anakin Skywalker", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-star-wars-return-of-the-jedi-multipack/F69885L21", category: "Retro Collection", character: "Admiral Ackbar", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-star-wars-a-new-hope-collectible-multipack-set/F76495L00", category: "Retro Collection", character: "C-3PO", year: 2022 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-ahsoka-tano/F73015X22", category: "Retro Collection", character: "Ahsoka Tano", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-sabine-wren/F73025X22", category: "Retro Collection", character: "Sabine Wren", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-general-hera-syndulla/F73045X22", category: "Retro Collection", character: "Hera Syndulla", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-marrok/F73055X22", category: "Retro Collection", character: "Marrok", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-hk87-assassin-droid/F73065X22", category: "Retro Collection", character: "HK-87", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-cad-bane/F85645X00", category: "Retro Collection", character: "Cad Bane", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-fennec-shand/F85655X00", category: "Retro Collection", character: "Fennec Shand", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-krrsantan/F85665X00", category: "Retro Collection", character: "Krrsantan", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-boba-fett/F85685X00", category: "Retro Collection", character: "Boba Fett", year: 2023 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-darth-vader/E80855X00", category: "Retro Collection", character: "Darth Vader", year: 2019 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-luke-skywalker/E80865X00", category: "Retro Collection", character: "Luke Skywalker", year: 2019 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-han-solo/E80875X00", category: "Retro Collection", character: "Han Solo", year: 2019 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-princess-leia-organa/E80885X00", category: "Retro Collection", character: "Princess Leia Organa", year: 2019 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-chewbacca/E80895X00", category: "Retro Collection", character: "Chewbacca", year: 2019 },
  { url: "https://www.hasbropulse.com/product/star-wars-retro-collection-stormtrooper/E80905X00", category: "Retro Collection", character: "Stormtrooper", year: 2019 },
];

function slugId(sku, name) {
  const slug = String(sku || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `sw-${slug}`;
}

function decode(html) {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x202f;/gi, " ")
    .replace(/&#x2019;/gi, "’")
    .replace(/\u202f/g, " ")
    .replace(/\ufffd/g, "");
}

function extractNamedAccessories(text) {
  if (!text) return [];
  const patterns = [
    /contains [0-9]+ character-inspired accessory pieces including ([^.]+)/i,
    /comes with ([^.]+?)(?:\s+[–—-]|\s+for |\s+so |\.|$)/i,
    /includes: ([^.]+)/i,
    /includes ([0-9]+ figures? and [0-9]+ accessories[^.]+)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const chunk = (m[1] || "").replace(/[“”]/g, '"').trim();
    if (!chunk) continue;
    if (/^(figure and )?\d* ?accessories?\.?$/i.test(chunk)) return [];
    if (/^figure and accessory/i.test(chunk) && !chunk.includes(",")) return [];
    const parts = chunk
      .replace(/\s+and\s+/g, ", ")
      .split(",")
      .map((s) => s.replace(/^plus an additional figure of /i, "").trim())
      .filter((s) => s && s.length < 120 && !/^figure$/i.test(s));
    if (parts.length) return parts;
  }
  return [];
}

function isBlackSeries(name) {
  return /black series/i.test(name);
}

function inferCharacter(name, fallback) {
  if (fallback && name.toLowerCase().includes(fallback.toLowerCase().split(" ")[0])) {
    return fallback;
  }
  const cleaned = name
    .replace(/^STAR WARS[:\s]*/i, "")
    .replace(/HasLab\s*\|\s*/i, "")
    .replace(/The Vintage Collection\s*/i, "")
    .replace(/Vintage Collection\s*/i, "")
    .replace(/Retro Collection\s*/i, "")
    .replace(/\s*\|\s*Vintage Collection/i, "")
    .replace(/\s*3\.75.*$/i, "")
    .replace(/\s*Action Figures?.*$/i, "")
    .replace(/\s*Figure Sets?.*$/i, "")
    .replace(/\s*Figures?$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned && cleaned.length < 90 ? cleaned : fallback;
}

function classifyLine(name, category, url = "") {
  const n = `${name} ${url}`.toLowerCase();
  if (n.includes("retro collection") || n.includes("retro-collection")) {
    return "Retro Collection";
  }
  if (n.includes("vintage collection") || n.includes("vintage-collection")) {
    return "The Vintage Collection";
  }
  if (n.includes("black series") || n.includes("black-series")) {
    return "The Black Series";
  }
  if (category === "Retro Collection") return "Retro Collection";
  if (category === "Black Series") return "The Black Series";
  return category === "Vintage Collection" ? "The Vintage Collection" : category;
}

/** Justin's rule: pre-1995 Kenner, 1995+ Hasbro. Category can stay Kenner-styled. */
function manufacturerFromYear(year, category = "", line = "") {
  const y = typeof year === "number" && year > 0 ? year : null;
  if (y != null) return y < 1995 ? "Kenner" : "Hasbro";
  const blob = `${category} ${line}`.toLowerCase();
  if (
    /potf2|power of the force 2|vintage collection|retro collection|black series|prequel|episode [i123]/.test(
      blob,
    )
  ) {
    return "Hasbro";
  }
  if (blob.includes("kenner")) return "Kenner";
  return "Hasbro";
}

async function fetchPulse(spec) {
  const res = await fetch(spec.url, {
    headers: { "User-Agent": "Mozilla/5.0 MyAFVaultCatalogSeed/1.0" },
    redirect: "follow",
  });
  if (!res.ok) {
    console.warn("skip", res.status, spec.url);
    return null;
  }
  const html = await res.text();
  const title = decode(
    (html.match(/property="og:title" content="([^"]+)"/) || [])[1] || "",
  ).replace(/\s+-\s+Hasbro Pulse$/i, "");
  const image = (html.match(/property="og:image" content="([^"]+)"/) || [])[1];
  const desc = decode(
    (html.match(/property="og:description" content="([^"]+)"/) ||
      html.match(/name="description" content="([^"]+)"/) ||
      [])[1] || "",
  );
  const skuMatch = spec.url.match(/\/([A-Z0-9]+)$/i);
  const sku = skuMatch?.[1] ?? "";
  const schemaMatch = html.match(
    /<script type="application\/ld\+json">(\{"@context":"https:\/\/schema\.org","@type":"Product"[^<]+)<\/script>/,
  );
  let schema = null;
  if (schemaMatch) {
    try {
      schema = JSON.parse(schemaMatch[1]);
    } catch {
      schema = null;
    }
  }
  const name = (schema?.name || title || "").trim();
  if (!name) {
    console.warn("no name", spec.url);
    return null;
  }
  if (isBlackSeries(name)) {
    console.warn("skip black series", name);
    return null;
  }
  const officialImage =
    image &&
    image.includes("cdn.media.amplience.net") &&
    !image.includes("pulse-social")
      ? image.split("?")[0]
      : schema?.image && String(schema.image).includes("cdn.media.amplience.net")
        ? String(schema.image).split("?")[0]
        : undefined;
  const canonical =
    (html.match(/rel="canonical" href="([^"]+)"/) || [])[1] || spec.url;
  const line = classifyLine(name, spec.category, spec.url);
  const vehicleOrPlayset =
    !!spec.vehicleOrPlayset ||
    /vehicle|playset|fighter|gunship|landspeeder|bantha|howler|ig-12|cantina|ghost/i.test(
      name,
    );
  return {
    name,
    sku,
    description: desc.slice(0, 2000),
    imageUrl: officialImage ?? null,
    gallery: officialImage ? [officialImage] : [],
    accessories: extractNamedAccessories(desc),
    productUrl: canonical.startsWith("http") ? canonical : spec.url,
    source: "hasbropulse.com",
    character: inferCharacter(name, spec.character),
    category: spec.category,
    year: spec.year,
    vehicleOrPlayset,
    line,
  };
}

function masterRow(fields) {
  const year = fields.year ?? null;
  return {
    id: fields.id,
    franchise: "star-wars",
    name: fields.name,
    category: fields.category,
    year,
    scale: fields.scale ?? '3.75"',
    manufacturer: fields.manufacturer ?? "",
    series: fields.series ?? "",
    character: fields.character ?? "",
    vehicleOrPlayset: !!fields.vehicleOrPlayset,
    imageUrl: fields.imageUrl ?? null,
    owned: false,
    wishlist: false,
    createdAt: stamp,
    updatedAt: stamp,
    sku: fields.sku ?? "",
    accessories: fields.accessories ?? [],
    gallery: fields.gallery ?? (fields.imageUrl ? [fields.imageUrl] : []),
    productUrl: fields.productUrl ?? "",
    source: fields.source ?? "",
    features: fields.features ?? [],
    description: fields.description ?? "",
    brand: "Star Wars",
    line: fields.line ?? "",
    productType: fields.productType ?? "Action Figure",
    genre: "Movies & TV",
    releaseYear: year,
    releaseMonth: null,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const previousCatalog = (() => {
  try {
    return JSON.parse(readFileSync(catalogPath, "utf8"));
  } catch {
    return [];
  }
})();
const existingBlackSeries = previousCatalog.filter(
  (p) => p.category === "Black Series",
);

const products = [];
const seenSku = new Set();
const seenId = new Set();

for (const spec of PULSE_SPECS) {
  try {
    const row = await fetchPulse(spec);
    await sleep(150);
    if (!row) continue;
    if (seenSku.has(row.sku)) continue;
    seenSku.add(row.sku);
    const id = slugId(row.sku, row.name);
    if (seenId.has(id)) continue;
    seenId.add(id);
    products.push(
      masterRow({
        id,
        name: row.name,
        category: row.category,
        character: row.character,
        year: row.year,
        manufacturer: "Hasbro",
        series: row.line,
        line: row.line,
        sku: row.sku,
        description: row.description,
        accessories: row.accessories,
        imageUrl: row.imageUrl,
        gallery: row.gallery,
        productUrl: row.productUrl,
        source: row.source,
        vehicleOrPlayset: row.vehicleOrPlayset,
        productType: row.vehicleOrPlayset ? "Vehicle / Playset" : "Action Figure",
      }),
    );
    console.log("ok", row.sku, row.name, row.imageUrl ? "photo" : "no-photo");
  } catch (err) {
    console.warn("fail", spec.url, err.message);
  }
}

for (const v of HISTORICAL_SW) {
  const id = slugId("", `${v.year}-${v.name}`);
  if (seenId.has(id)) continue;
  seenId.add(id);
  products.push(
    masterRow({
      id,
      name: v.name,
      category: v.category,
      character: v.character,
      year: v.year,
      manufacturer: manufacturerFromYear(v.year, v.category, v.line ?? v.series),
      series: v.series ?? "",
      line: v.line ?? (v.category.startsWith("Kenner") ? "Kenner" : v.category),
      description:
        v.description ??
        `${v.name} — original ${v.series ?? v.line ?? v.category} release (${v.year}). Official pack photography not attached; listing is catalog metadata only.`,
      source: v.source ?? (v.category.startsWith("Kenner") ? "kenner" : "hasbro"),
      vehicleOrPlayset: !!v.vehicleOrPlayset,
      productType: v.productType ?? (v.vehicleOrPlayset ? (v.category.includes("Playset") ? "Playset" : "Vehicle") : "Action Figure"),
    }),
  );
}

for (const row of existingBlackSeries) {
  const sku = row.sku || "";
  if (sku && seenSku.has(sku)) continue;
  if (seenId.has(row.id)) continue;
  if (sku) seenSku.add(sku);
  seenId.add(row.id);
  products.push(row);
}

writeFileSync(catalogPath, JSON.stringify(products, null, 2) + "\n");
const counts = {};
for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;
console.log("star-wars total", products.length, counts);
console.log("pulse photos", products.filter((p) => p.imageUrl).length);
