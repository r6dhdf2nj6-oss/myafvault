/**
 * Seed Star Wars + GI Joe catalogs from official Hasbro Pulse pages.
 * Accessories are copied only when Pulse names them. Vintage Kenner / ARAH
 * rows are historical metadata only — no invented photos or accessories.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stamp = "2024-01-01T00:00:00.000Z";

const SW_PULSE = [
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
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-princess-leia-organa/G09045X00", category: "Vintage Collection", character: "Princess Leia Organa", year: 2025 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-obiwan-kenobi/F97855X00", category: "Vintage Collection", character: "Obi-Wan Kenobi", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-r2d2/F97865X00", category: "Vintage Collection", character: "R2-D2", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-c3po/F97875X00", category: "Vintage Collection", character: "C-3PO", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-boba-fett/F18885X00", category: "Vintage Collection", character: "Boba Fett", year: 2022 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-yoda/F18905X00", category: "Vintage Collection", character: "Yoda", year: 2022 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-stormtrooper/F97895X00", category: "Vintage Collection", character: "Stormtrooper", year: 2024 },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-tie-fighter/E96485L00", category: "Kenner Vehicles", character: "TIE Fighter Pilot", year: 2020, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/star-wars-the-vintage-collection-millennium-falcon/E07645L00", category: "Kenner Vehicles", character: "Han Solo", year: 2018, vehicleOrPlayset: true },
];

const GI_PULSE = [
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-165-snake-eyes/G10735X00", category: "Classified Series", character: "Snake Eyes", year: 2025 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-197-snake-eyes-dawn-moreno/G22785X00", category: "Classified Series", character: "Snake Eyes (Dawn Moreno)", year: 2026 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-130-cobra-commander-once-a-man/F92535S00", category: "Classified Series", character: "Cobra Commander", year: 2024 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-168-cobra-commander-with-combat-armor/G10775X00", category: "Classified Series", character: "Cobra Commander", year: 2025 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-retro-cardback-duke/F96765X00", category: "Retro Cardbacks", character: "Duke", year: 2024 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-retro-cardback-scarlett/F96755X00", category: "Retro Cardbacks", character: "Scarlett", year: 2024 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-cobra-rattler-ground-attack-jet/G14275L00", category: "HasLabs", character: "Wild Weasel", year: 2025, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-gi-joe-assault-copter-dragonfly-xh1/F92555S00", category: "HasLabs", character: "Wild Bill", year: 2024, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-cobra-hiss/F73745L00", category: "HasLabs", character: "H.I.S.S. Driver", year: 2023, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-snow-cat-combat-allterrain-vehicle-with-farley-%22frostbite%22-seward-action-figure/G20435L00", category: "HasLabs", character: "Frostbite", year: 2026, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-218-snake-eyes-varmint-atv-vs-stealth-viper-cobra-stealth-flight-pod-trubble-bubble/G20855L00", category: "Vehicles", character: "Snake Eyes", year: 2026, vehicleOrPlayset: true },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-retro-cardback-snake-eyes/F96745X00", category: "Retro Cardbacks", character: "Snake Eyes", year: 2024 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-retro-cardback-cobra-commander/F96775X00", category: "Retro Cardbacks", character: "Cobra Commander", year: 2024 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-retro-cardback-storm-shadow/F96785X00", category: "Retro Cardbacks", character: "Storm Shadow", year: 2024 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-01-snake-eyes/E84965X00", category: "Classified Series", character: "Snake Eyes", year: 2020 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-duke/E84975X00", category: "Classified Series", character: "Duke", year: 2020 },
  { url: "https://www.hasbropulse.com/product/gi-joe-classified-series-scarlett/E84985X00", category: "Classified Series", character: "Scarlett", year: 2020 },
];

function slugId(prefix, sku, name) {
  const slug = String(sku || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${prefix}-${slug}`;
}

function decode(html) {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractNamedAccessories(text) {
  if (!text) return [];
  const patterns = [
    /contains [0-9]+ character-inspired accessory pieces including ([^.]+)/i,
    /comes with ([^.]+?)(?:\s+[–—-]|\s+for |\s+so |\.|$)/i,
    /([0-9]+ accessories include ([^.]+))/i,
    /includes ([0-9]+ figures? and [0-9]+ accessories[^.]+)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const chunk = (m[2] || m[1] || "").replace(/[“”]/g, '"').trim();
    if (!chunk) continue;
    // Skip vague "figure and accessory" / "4 accessories" with no names
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
  const title =
    decode(
      (html.match(/property="og:title" content="([^"]+)"/) || [])[1] || "",
    ).replace(/\s+-\s+Hasbro Pulse$/i, "") || null;
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
  const officialImage =
    image &&
    image.includes("cdn.media.amplience.net") &&
    !image.includes("pulse-social")
      ? image.split("?")[0]
      : schema?.image &&
          String(schema.image).includes("cdn.media.amplience.net")
        ? String(schema.image).split("?")[0]
        : undefined;
  const gallery = officialImage ? [officialImage] : [];
  const accessories = extractNamedAccessories(desc);
  const line = name.toLowerCase().includes("vintage collection")
    ? "The Vintage Collection"
    : name.toLowerCase().includes("retro cardback")
      ? "Retro Cardback"
      : name.toLowerCase().includes("haslab") || spec.category === "HasLabs"
        ? "HasLab"
        : name.toLowerCase().includes("classified")
          ? "Classified Series"
          : spec.category;

  return {
    name,
    sku,
    description: desc.slice(0, 2000),
    imageUrl: officialImage ?? null,
    gallery,
    accessories,
    productUrl: spec.url,
    source: "hasbropulse.com",
    character: spec.character,
    category: spec.category,
    year: spec.year,
    vehicleOrPlayset: !!spec.vehicleOrPlayset,
    line,
  };
}

function masterRow({
  id,
  franchise,
  name,
  category,
  character,
  year,
  scale,
  manufacturer,
  series,
  line,
  brand,
  productType,
  genre,
  sku,
  description,
  features,
  accessories,
  imageUrl,
  gallery,
  productUrl,
  source,
  vehicleOrPlayset,
}) {
  return {
    id,
    franchise,
    name,
    category,
    year,
    scale: scale ?? "",
    manufacturer: manufacturer ?? "",
    series: series ?? "",
    character: character ?? "",
    vehicleOrPlayset: !!vehicleOrPlayset,
    imageUrl: imageUrl ?? null,
    owned: false,
    wishlist: false,
    createdAt: stamp,
    updatedAt: stamp,
    sku: sku ?? "",
    accessories: accessories ?? [],
    gallery: gallery ?? (imageUrl ? [imageUrl] : []),
    productUrl: productUrl ?? "",
    source: source ?? "",
    features: features ?? [],
    description: description ?? "",
    brand: brand ?? "",
    line: line ?? "",
    productType: productType ?? "",
    genre: genre ?? "",
    releaseYear: year ?? null,
    releaseMonth: null,
  };
}

const VINTAGE_SW = [
  { name: "Luke Skywalker", character: "Luke Skywalker", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Princess Leia Organa", character: "Princess Leia Organa", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Han Solo", character: "Han Solo", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Chewbacca", character: "Chewbacca", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Darth Vader", character: "Darth Vader", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Ben (Obi-Wan) Kenobi", character: "Obi-Wan Kenobi", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "See-Threepio (C-3PO)", character: "C-3PO", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Artoo-Detoo (R2-D2)", character: "R2-D2", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Stormtrooper", character: "Stormtrooper", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Jawa", character: "Jawa", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Sand People", character: "Tusken Raider", year: 1978, category: "Kenner 3.75-inch", series: "Star Wars (1977)" },
  { name: "Boba Fett", character: "Boba Fett", year: 1980, category: "Kenner 3.75-inch", series: "The Empire Strikes Back" },
  { name: "Yoda", character: "Yoda", year: 1980, category: "Kenner 3.75-inch", series: "The Empire Strikes Back" },
  { name: "Lando Calrissian", character: "Lando Calrissian", year: 1980, category: "Kenner 3.75-inch", series: "The Empire Strikes Back" },
  { name: "IG-88", character: "IG-88", year: 1980, category: "Kenner 3.75-inch", series: "The Empire Strikes Back" },
  { name: "Bossk", character: "Bossk", year: 1980, category: "Kenner 3.75-inch", series: "The Empire Strikes Back" },
  { name: "Luke Skywalker (Bespin Fatigues)", character: "Luke Skywalker", year: 1980, category: "Kenner 3.75-inch", series: "The Empire Strikes Back" },
  { name: "The Emperor", character: "Emperor Palpatine", year: 1984, category: "Kenner 3.75-inch", series: "Return of the Jedi" },
  { name: "Luke Skywalker (Jedi Knight)", character: "Luke Skywalker", year: 1983, category: "Kenner 3.75-inch", series: "Return of the Jedi" },
  { name: "X-Wing Fighter", character: "Luke Skywalker", year: 1978, category: "Kenner Vehicles", series: "Star Wars (1977)", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "TIE Fighter", character: "TIE Fighter Pilot", year: 1978, category: "Kenner Vehicles", series: "Star Wars (1977)", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Millennium Falcon", character: "Han Solo", year: 1979, category: "Kenner Vehicles", series: "Star Wars (1977)", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Landspeeder", character: "Luke Skywalker", year: 1978, category: "Kenner Vehicles", series: "Star Wars (1977)", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Imperial Troop Transport", character: "Stormtrooper", year: 1979, category: "Kenner Vehicles", series: "Star Wars (1977)", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Slave I", character: "Boba Fett", year: 1981, category: "Kenner Vehicles", series: "The Empire Strikes Back", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "AT-AT", character: "AT-AT Driver", year: 1981, category: "Kenner Vehicles", series: "The Empire Strikes Back", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Speeder Bike", character: "Scout Trooper", year: 1983, category: "Kenner Vehicles", series: "Return of the Jedi", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Death Star Space Station", character: "Death Star", year: 1978, category: "Kenner Playsets", series: "Star Wars (1977)", vehicleOrPlayset: true, productType: "Playset" },
  { name: "Cantina Adventure Set", character: "Mos Eisley", year: 1978, category: "Kenner Playsets", series: "Star Wars (1977)", vehicleOrPlayset: true, productType: "Playset" },
  { name: "Land of the Jawas", character: "Jawa", year: 1979, category: "Kenner Playsets", series: "Star Wars (1977)", vehicleOrPlayset: true, productType: "Playset" },
  { name: "Cloud City Playset", character: "Lando Calrissian", year: 1980, category: "Kenner Playsets", series: "The Empire Strikes Back", vehicleOrPlayset: true, productType: "Playset" },
  { name: "Jabba the Hutt Action Playset", character: "Jabba the Hutt", year: 1983, category: "Kenner Playsets", series: "Return of the Jedi", vehicleOrPlayset: true, productType: "Playset" },
  { name: "Ewok Village", character: "Wicket", year: 1983, category: "Kenner Playsets", series: "Return of the Jedi", vehicleOrPlayset: true, productType: "Playset" },
  { name: "Luke Skywalker (Power of the Force 2)", character: "Luke Skywalker", year: 1995, category: "Modern 3.75-inch", series: "Power of the Force 2", line: "Power of the Force 2", manufacturer: "Kenner / Hasbro" },
  { name: "Darth Vader (Power of the Force 2)", character: "Darth Vader", year: 1995, category: "Modern 3.75-inch", series: "Power of the Force 2", line: "Power of the Force 2", manufacturer: "Kenner / Hasbro" },
  { name: "Han Solo (Power of the Force 2)", character: "Han Solo", year: 1995, category: "Modern 3.75-inch", series: "Power of the Force 2", line: "Power of the Force 2", manufacturer: "Kenner / Hasbro" },
  { name: "Princess Leia Organa (Power of the Force 2)", character: "Princess Leia Organa", year: 1995, category: "Modern 3.75-inch", series: "Power of the Force 2", line: "Power of the Force 2", manufacturer: "Kenner / Hasbro" },
  { name: "Chewbacca (Power of the Force 2)", character: "Chewbacca", year: 1996, category: "Modern 3.75-inch", series: "Power of the Force 2", line: "Power of the Force 2", manufacturer: "Kenner / Hasbro" },
  { name: "Boba Fett (Power of the Force 2)", character: "Boba Fett", year: 1995, category: "Modern 3.75-inch", series: "Power of the Force 2", line: "Power of the Force 2", manufacturer: "Kenner / Hasbro" },
  { name: "Emperor Palpatine (Power of the Force 2)", character: "Emperor Palpatine", year: 1997, category: "Modern 3.75-inch", series: "Power of the Force 2", line: "Power of the Force 2", manufacturer: "Kenner / Hasbro" },
];

const VINTAGE_GI = [
  { name: "Snake Eyes", character: "Snake Eyes", year: 1982, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Scarlett", character: "Scarlett", year: 1982, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Stalker", character: "Stalker", year: 1982, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Zap", character: "Zap", year: 1982, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Breaker", character: "Breaker", year: 1982, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Grunt", character: "Grunt", year: 1982, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Rock 'n Roll", character: "Rock 'n Roll", year: 1982, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Cobra Officer", character: "Cobra Officer", year: 1982, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Cobra Commander", character: "Cobra Commander", year: 1983, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Duke", character: "Duke", year: 1983, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Gung-Ho", character: "Gung-Ho", year: 1983, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Storm Shadow", character: "Storm Shadow", year: 1984, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Destro", character: "Destro", year: 1983, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "Baroness", character: "Baroness", year: 1984, category: "Vintage 3.75-inch", series: "A Real American Hero" },
  { name: "VAMP", character: "Clutch", year: 1982, category: "Vehicles", series: "A Real American Hero", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "H.I.S.S.", character: "H.I.S.S. Driver", year: 1983, category: "Vehicles", series: "A Real American Hero", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Skystriker XP-14F", character: "Ace", year: 1983, category: "Vehicles", series: "A Real American Hero", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Dragonfly XH-1", character: "Wild Bill", year: 1983, category: "Vehicles", series: "A Real American Hero", vehicleOrPlayset: true, productType: "Vehicle" },
  { name: "Headquarters Command Center", character: "G.I. Joe", year: 1983, category: "Playsets", series: "A Real American Hero", vehicleOrPlayset: true, productType: "Playset" },
  { name: "Cobra Terrordrome", character: "Cobra", year: 1986, category: "Playsets", series: "A Real American Hero", vehicleOrPlayset: true, productType: "Playset" },
];

async function seedFranchise({
  franchise,
  pulse,
  vintage,
  prefix,
  brand,
  scaleDefault,
  manufacturerVintage,
  lineVintage,
  genre,
  outRel,
}) {
  const products = [];
  for (const spec of pulse) {
    try {
      const row = await fetchPulse(spec);
      if (!row) continue;
      products.push(
        masterRow({
          id: slugId(prefix, row.sku, row.name),
          franchise,
          name: row.name,
          category: row.category,
          character: row.character,
          year: row.year,
          scale: spec.vehicleOrPlayset ? scaleDefault : scaleDefault,
          manufacturer: "Hasbro",
          series: row.line,
          line: row.line,
          brand,
          productType: spec.vehicleOrPlayset ? "Vehicle / Playset" : "Action Figure",
          genre,
          sku: row.sku,
          description: row.description,
          accessories: row.accessories,
          imageUrl: row.imageUrl,
          gallery: row.gallery,
          productUrl: row.productUrl,
          source: row.source,
          vehicleOrPlayset: row.vehicleOrPlayset,
        }),
      );
      console.log("ok", franchise, row.name, row.imageUrl ? "photo" : "no-photo");
    } catch (err) {
      console.warn("fail", spec.url, err.message);
    }
  }

  for (const v of vintage) {
    products.push(
      masterRow({
        id: slugId(prefix, "", `${v.year}-${v.name}`),
        franchise,
        name: v.name,
        category: v.category,
        character: v.character,
        year: v.year,
        scale: "3.75\"",
        manufacturer: v.manufacturer ?? manufacturerVintage,
        series: v.series ?? "",
        line: v.line ?? lineVintage,
        brand,
        productType: v.productType ?? "Action Figure",
        genre,
        description: `${v.name} — original ${manufacturerVintage} ${v.series ?? ""} release (${v.year}). Official pack photography not attached; listing is catalog metadata only.`,
        source: manufacturerVintage.toLowerCase(),
        vehicleOrPlayset: !!v.vehicleOrPlayset,
      }),
    );
  }

  const outDir = join(root, outRel);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "catalog.json"), JSON.stringify(products, null, 2) + "\n");
  const counts = {};
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;
  console.log(franchise, "total", products.length, counts);
}

await seedFranchise({
  franchise: "star-wars",
  pulse: SW_PULSE,
  vintage: VINTAGE_SW,
  prefix: "sw",
  brand: "Star Wars",
  scaleDefault: "3.75\"",
  manufacturerVintage: "Kenner",
  lineVintage: "Kenner",
  genre: "Movies & TV",
  outRel: "data/star-wars",
});

await seedFranchise({
  franchise: "gi-joe",
  pulse: GI_PULSE,
  vintage: VINTAGE_GI,
  prefix: "gijoe",
  brand: "G.I. Joe",
  scaleDefault: "6\"",
  manufacturerVintage: "Hasbro",
  lineVintage: "A Real American Hero",
  genre: "Military",
  outRel: "data/gi-joe",
});
