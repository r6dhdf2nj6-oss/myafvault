#!/usr/bin/env node
/** Mechanical check: DC string accessories get stable sku+slug ids. */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function slugAccessory(name) {
  const slug = name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "part";
}

function accessoryId(source, name, seen) {
  const skuKey = (source.sku || source.id || "sku")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = `acc-${skuKey || "sku"}-${slugAccessory(name)}`;
  const n = (seen.get(base) ?? 0) + 1;
  seen.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dc = JSON.parse(await readFile(join(root, "data/dc/catalog.json"), "utf8"));

let empty = 0;
let withParts = 0;
let dupes = 0;
for (const row of dc) {
  const raw = row.accessories ?? [];
  if (!raw.length) {
    empty += 1;
    continue;
  }
  withParts += 1;
  const seen = new Map();
  const ids = new Set();
  for (const name of raw) {
    if (typeof name !== "string" || !name.trim()) continue;
    const id = accessoryId({ id: row.id, sku: row.sku }, name, seen);
    if (ids.has(id)) dupes += 1;
    ids.add(id);
    if (!id.startsWith("acc-")) throw new Error(`Bad id ${id}`);
  }
}

if (dupes) throw new Error(`Duplicate accessory ids: ${dupes}`);
if (withParts < 900) throw new Error(`Expected most DC rows to have parts, got ${withParts}`);
console.log(
  `DC accessories OK — ${withParts} listed, ${empty} unknown (no fake parts), unique ids.`,
);
