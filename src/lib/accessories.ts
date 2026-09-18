import type { CatalogAccessory, CatalogAccessoryKind } from "@/types";

export const ACCESSORY_KINDS: readonly CatalogAccessoryKind[] = [
  "head",
  "hand",
  "weapon",
  "effect",
  "stand",
  "card",
  "vehicle_part",
  "other",
  "baf",
] as const;

export type AccessorySource = {
  id: string;
  sku?: string;
};

export type RawAccessory = string | Partial<CatalogAccessory> | null | undefined;

const KIND_SET = new Set<string>(ACCESSORY_KINDS);

export function isAccessoryKind(value: unknown): value is CatalogAccessoryKind {
  return typeof value === "string" && KIND_SET.has(value);
}

export function slugAccessory(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "part";
}

export function accessoryId(
  source: AccessorySource,
  name: string,
  seen: Map<string, number>,
): string {
  const skuKey = (source.sku || source.id || "sku")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = `acc-${skuKey || "sku"}-${slugAccessory(name)}`;
  const n = (seen.get(base) ?? 0) + 1;
  seen.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}

export function inferAccessoryKind(name: string): CatalogAccessoryKind {
  const low = name.toLowerCase();
  if (
    /\b(baf|build[- ]?a[- ]?figure|collect[- ]?and[- ]?connect|cnc)\b/.test(low)
  ) {
    return "baf";
  }
  if (/\b(head|helmet|portrait|mask|cowl|face)\b/.test(low)) return "head";
  if (/\b(hand|hands|fist|grip|wrist)\b/.test(low)) return "hand";
  if (
    /\b(sword|gun|pistol|rifle|blaster|bat|weapon|hammer|axe|knife|staff|spear|bow|shield|grenade|whip)\b/.test(
      low,
    )
  ) {
    return "weapon";
  }
  if (/\b(effect|blast|energy|flame|lightning|fx|beam)\b/.test(low)) {
    return "effect";
  }
  if (/\b(stand|base|backdrop|diorama|flight stand)\b/.test(low)) return "stand";
  if (/\b(card|poster|comic|booklet|certificate|coa)\b/.test(low)) return "card";
  if (/\b(vehicle|wheel|wing|turret|sidecar|engine|part)\b/.test(low)) {
    return "vehicle_part";
  }
  return "other";
}

function fromName(
  name: string,
  source: AccessorySource,
  seen: Map<string, number>,
): CatalogAccessory {
  const kind = inferAccessoryKind(name);
  return {
    id: accessoryId(source, name, seen),
    name,
    kind,
    is_baf_part: kind === "baf",
  };
}

/** Load-time string→object migration. Already-structured rows keep stable ids. */
export function normalizeAccessories(
  raw: RawAccessory[] | null | undefined,
  source: AccessorySource,
): CatalogAccessory[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const seen = new Map<string, number>();
  const out: CatalogAccessory[] = [];

  for (const item of raw) {
    if (typeof item === "string") {
      const name = item.trim();
      if (!name) continue;
      out.push(fromName(name, source, seen));
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) continue;
    const kind = isAccessoryKind(item.kind)
      ? item.kind
      : inferAccessoryKind(name);
    const id =
      typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : accessoryId(source, name, seen);
    if (typeof item.id === "string" && item.id.trim()) {
      const n = (seen.get(id) ?? 0) + 1;
      seen.set(id, n);
    }
    out.push({
      id,
      name,
      kind,
      image_url:
        typeof item.image_url === "string" && item.image_url.trim()
          ? item.image_url.trim()
          : undefined,
      is_baf_part: item.is_baf_part === true || kind === "baf",
    });
  }

  return out;
}

export function accessoryNames(
  accessories:
    | Array<string | CatalogAccessory | { name?: string } | null | undefined>
    | null
    | undefined,
): string[] {
  if (!accessories?.length) return [];
  const names: string[] = [];
  for (const item of accessories) {
    if (typeof item === "string") {
      const name = item.trim();
      if (name) names.push(name);
    } else if (item?.name?.trim()) {
      names.push(item.name.trim());
    }
  }
  return names;
}

export function firstAccessoryName(
  accessories: Array<string | CatalogAccessory> | null | undefined,
): string | undefined {
  return accessoryNames(accessories)[0];
}
