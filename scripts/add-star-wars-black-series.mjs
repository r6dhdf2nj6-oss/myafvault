/**
 * Append Pulse-current Star Wars The Black Series rows to
 * data/star-wars/catalog.json without touching 3.75-inch history.
 *
 * Official names, SKUs, product URLs, and Amplience pack shots come from
 * Hasbro Pulse OCAPI. Rows that cannot be verified are skipped.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "data/star-wars/catalog.json");
const stamp = "2024-01-01T00:00:00.000Z";
const CLIENT_ID = "b1ea4d5d-0e99-4a54-a9af-c1695a200a72";
const OCAPI = "https://www.hasbropulse.com/s/hasbrous/dw/shop/v21_10";
const UA = "Mozilla/5.0 MyAFVaultCatalogSeed/1.0";

function slugId(sku, name) {
  const slug = String(sku || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `sw-${slug}`;
}

function decode(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&trade;/gi, "")
    .replace(/&#x202f;/gi, " ")
    .replace(/&#x2019;/gi, "’")
    .replace(/\u202f/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function isBlackSeriesName(name) {
  return /black series/i.test(name || "");
}

function officialImage(url) {
  if (!url) return null;
  const raw = String(url);
  if (!raw.includes("cdn.media.amplience.net")) return null;
  if (raw.includes("pulse-social")) return null;
  return raw.split("?")[0];
}

function inferCharacter(name) {
  const cleaned = name
    .replace(/^STAR WARS[:\s]*/i, "")
    .replace(/The Black Series\s*/i, "")
    .replace(/,\s*Star Wars:.*$/i, "")
    .replace(/\s*\|\s*Black Series.*$/i, "")
    .replace(/\s*6(\.0)?[\s-]*inch.*$/i, "")
    .replace(/\s*Action Figures?.*$/i, "")
    .replace(/\s*Figure Sets?.*$/i, "")
    .replace(/\s*Figures?$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned && cleaned.length < 90 ? cleaned : name;
}

function classifyBlackSeries(name, product) {
  const n = `${name} ${product.c_productSubClass ?? ""} ${product.c_productType ?? ""}`.toLowerCase();
  const exclusive =
    product.c_isPulseExclusive === true ||
    /exclusive/i.test(product.c_productType ?? "");
  const deluxe = /\bdeluxe\b/i.test(name);
  const multipack =
    /\b([23]-pack|2 pack|3 pack|battle pack|multipack|2-pack)\b/i.test(name);
  const roleplay =
    /helmet|lightsaber|thermal detonator|roleplay|force fx/i.test(n);
  const vehicleOrPlayset =
    /vehicle|playset|speeder|fighter|gunship|landspeeder|\bstap\b|&\s*at-?rt\b|at-?rt\s*(&|and)\s/i.test(
      n,
    ) && !roleplay;

  let productType = "Action Figure";
  let subcategory = exclusive ? "Exclusive" : "Figure";
  if (vehicleOrPlayset) {
    productType = "Vehicle / Playset";
    subcategory = exclusive ? "Exclusive Vehicle" : "Vehicle";
  } else if (roleplay) {
    productType = "Roleplay";
    subcategory = exclusive ? "Exclusive Roleplay" : "Roleplay";
  } else if (deluxe) {
    productType = "Deluxe Figure";
    subcategory = exclusive ? "Exclusive Deluxe" : "Deluxe";
  } else if (multipack) {
    productType = "Multipack";
    subcategory = exclusive ? "Exclusive Multipack" : "Multipack";
  }

  const scale = roleplay ? "" : '6"';
  return { exclusive, deluxe, vehicleOrPlayset, productType, subcategory, scale };
}

function releaseYearOf(product) {
  const raw =
    product.c_releaseDate ||
    product.c_anticipatedShipDateValue ||
    product.c_anticipatedShipDate ||
    "";
  const m = String(raw).match(/^(20\d{2})/);
  return m ? Number(m[1]) : undefined;
}

function productUrlOf(product, sku) {
  const gtm = product.c_gtmItem || {};
  const fromGtm = String(gtm.pdp_url || "").trim();
  if (fromGtm.includes("/product/") && fromGtm.includes(sku)) {
    return fromGtm
      .replace("https://hasbropulse.com", "https://www.hasbropulse.com")
      .replace(/\/$/, "");
  }
  const slug = String(product.name || "")
    .toLowerCase()
    .replace(/^star wars\s*/i, "star-wars-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) return "";
  return `https://www.hasbropulse.com/product/${slug}/${sku}`;
}

async function ocapi(path) {
  const url = path.startsWith("http")
    ? path
    : `${OCAPI}${path}${path.includes("?") ? "&" : "?"}client_id=${CLIENT_ID}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      "x-dw-client-id": CLIENT_ID,
    },
  });
  if (!res.ok) {
    throw new Error(`OCAPI ${res.status} ${url}`);
  }
  return res.json();
}

async function discoverBlackSeriesIds() {
  const params = new URLSearchParams({
    q: "star wars the black series",
    count: "200",
    start: "0",
    client_id: CLIENT_ID,
    refine_1: "c_productLine=The Black Series",
    refine_2: "brand=STAR WARS",
  });
  const data = await ocapi(`${OCAPI}/product_search?${params}`);
  const hits = data.hits ?? [];
  const ids = [];
  for (const hit of hits) {
    const id = hit.product_id;
    const name = hit.product_name || "";
    if (!id || !isBlackSeriesName(name)) {
      console.warn("skip search hit", id, name);
      continue;
    }
    ids.push(id);
  }
  // Confirm the Thermal Detonator only if Pulse actually lists it.
  const extra = await ocapi(
    `${OCAPI}/product_search?${new URLSearchParams({
      q: "star wars the black series thermal detonator",
      count: "25",
      client_id: CLIENT_ID,
    })}`,
  );
  for (const hit of extra.hits ?? []) {
    const id = hit.product_id;
    const name = hit.product_name || "";
    if (id && isBlackSeriesName(name) && /thermal detonator/i.test(name)) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

async function fetchProducts(ids) {
  const out = [];
  const chunkSize = 20;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const path = `/products/(${chunk.join(",")})`;
    try {
      const data = await ocapi(path);
      const rows = data.data ?? (data.id ? [data] : []);
      out.push(...rows);
    } catch (err) {
      console.warn("batch fail, fetching singles", err.message);
      for (const id of chunk) {
        try {
          out.push(await ocapi(`/products/${id}`));
        } catch (inner) {
          console.warn("skip", id, inner.message);
        }
      }
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return out;
}

function masterRow(fields) {
  const year = fields.year ?? null;
  return {
    id: fields.id,
    franchise: "star-wars",
    name: fields.name,
    category: "Black Series",
    subcategory: fields.subcategory,
    year,
    scale: fields.scale ?? '6"',
    manufacturer: "Hasbro",
    series: "The Black Series",
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
    source: "hasbropulse.com",
    features: fields.features ?? [],
    description: fields.description ?? "",
    brand: "Star Wars",
    line: "The Black Series",
    productType: fields.productType ?? "Action Figure",
    genre: "Movies & TV",
    releaseYear: year,
    releaseMonth: null,
  };
}

const existing = JSON.parse(readFileSync(catalogPath, "utf8"));
const kept = existing.filter((p) => p.category !== "Black Series");
if (kept.length !== existing.length) {
  console.log("replacing", existing.length - kept.length, "previous Black Series rows");
}

const inchCategories = new Set([
  "Kenner 3.75-inch",
  "Kenner Vehicles",
  "Kenner Playsets",
  "Vintage Collection",
  "Retro Collection",
  "POTF2",
  "Prequels 3.75-inch",
]);
const inchCount = kept.filter((p) => inchCategories.has(p.category)).length;
if (inchCount !== 291) {
  console.warn("unexpected 3.75-inch count after keep:", inchCount);
}

const seenSku = new Set(kept.map((p) => p.sku).filter(Boolean));
const seenId = new Set(kept.map((p) => p.id));
const blackSeries = [];

const ids = await discoverBlackSeriesIds();
console.log("pulse black series ids", ids.length);
const products = await fetchProducts(ids);
console.log("pulse product payloads", products.length);

for (const product of products) {
  const sku = product.id || product.manufacturer_sku || "";
  const name = decode(product.name || "");
  if (!sku || !isBlackSeriesName(name)) {
    console.warn("skip unverified", sku, name);
    continue;
  }
  if ((product.c_productLine || "") !== "The Black Series") {
    console.warn("skip non-line", sku, product.c_productLine, name);
    continue;
  }
  if (seenSku.has(sku)) continue;
  const imageUrl =
    officialImage(product.image_groups?.[0]?.images?.[0]?.link) ||
    officialImage(product.c_gtmItem?.item_img_url) ||
    null;
  const desc = decode(product.page_description || product.short_description || "");
  const classified = classifyBlackSeries(name, product);
  const year = releaseYearOf(product);
  const productUrl = productUrlOf(product, sku);
  if (!productUrl.includes("/product/")) {
    console.warn("skip missing product url", sku, name);
    continue;
  }
  const id = slugId(sku, name);
  if (seenId.has(id)) continue;
  seenSku.add(sku);
  seenId.add(id);
  const features = [];
  if (product.c_productFeature1) features.push(decode(product.c_productFeature1));
  if (classified.exclusive) features.push("Pulse Exclusive");
  blackSeries.push(
    masterRow({
      id,
      name,
      character: inferCharacter(name),
      year,
      sku,
      description: desc.slice(0, 2000),
      accessories: extractNamedAccessories(desc),
      imageUrl,
      gallery: imageUrl ? [imageUrl] : [],
      productUrl,
      vehicleOrPlayset: classified.vehicleOrPlayset,
      productType: classified.productType,
      subcategory: classified.subcategory,
      scale: classified.scale,
      features,
    }),
  );
  console.log("ok", sku, name, imageUrl ? "photo" : "no-photo");
}

const next = [...kept, ...blackSeries];
writeFileSync(catalogPath, JSON.stringify(next, null, 2) + "\n");
const counts = {};
for (const p of next) counts[p.category] = (counts[p.category] ?? 0) + 1;
console.log("star-wars total", next.length, counts);
console.log("black series", blackSeries.length, "3.75-inch kept", inchCount);
console.log("black series photos", blackSeries.filter((p) => p.imageUrl).length);
