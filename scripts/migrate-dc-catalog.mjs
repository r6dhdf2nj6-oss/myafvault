import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = JSON.parse(readFileSync(join(root, "src/data/catalog.json"), "utf8"));
const stamp = "2024-01-01T00:00:00.000Z";

function mapDcCategory(p) {
  const hay = `${p.name ?? ""} ${p.line ?? ""}`.toLowerCase();
  if (hay.includes("gold label")) return "Gold Label";
  if (hay.includes("platinum")) return "Platinum Edition";
  if (hay.includes("page punchers")) return "Page Punchers";
  if (hay.includes("playset")) return "McFarlane Playsets";
  if (p.category === "vehicle") return "McFarlane Vehicles";
  if (p.category === "statue") return "McFarlane 12-inch";
  const scale = String(p.scale ?? "");
  if (scale.includes("12") || scale.includes("1:6")) return "McFarlane 12-inch";
  if (p.category === "multipack") return "Other DC";
  if (p.category === "megafig" || p.category === "7-inch") return "McFarlane 7-inch";
  return "Other DC";
}

const migrated = src.map((p) => {
  const category = mapDcCategory(p);
  const year =
    typeof p.releaseYear === "number" && p.releaseYear > 0
      ? p.releaseYear
      : undefined;
  return {
    ...p,
    franchise: "dc",
    category,
    year,
    manufacturer: p.manufacturer ?? "McFarlane Toys",
    vehicleOrPlayset:
      category === "McFarlane Vehicles" || category === "McFarlane Playsets",
    owned: false,
    wishlist: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
});

const outDir = join(root, "data/dc");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "catalog.json"), JSON.stringify(migrated, null, 2) + "\n");

const counts = {};
for (const p of migrated) counts[p.category] = (counts[p.category] ?? 0) + 1;
console.log("DC products", migrated.length);
console.log(counts);
