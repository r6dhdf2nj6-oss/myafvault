# MyAFVault product backlog

**Positioning:** The index for the line — pack-accurate accessories, chase labels, shelf photos. Not a barcode dump.

Price is **$3.99 lifetime**. No subscription. Lifetime includes current live vaults (DC McFarlane, Star Wars, GI Joe, LEGO) and listed features as they ship. Marvel, Fallout, Disney, and Pixar stay coming-soon until a real vault ships. Do not claim live market values.

## Principles

- Pack-accurate first. Empty accessory lists stay unknown — never invent parts.
- User overlay on master catalog. Completeness and incoming live on the signed-in vault, not the SKU row.
- DC first for completeness data. Other live vaults must keep loading.
- Extend the existing schema and franchise UI. Match current auth, Tailwind, and vault patterns.
- Out of scope until later: barcode scan, live eBay pricing, native apps, Marvel vault.

## Data model

| Entity | Role |
| --- | --- |
| `CatalogProduct` | Master listing. `accessories[]` are structured `{id,name,kind,image_url?,is_baf_part?}`. `kind` ∈ head \| hand \| weapon \| effect \| stand \| card \| vehicle_part \| other \| baf. Empty live SKUs set `accessoriesUnknown`. |
| `UserEntry` | Overlay keyed by product id. `status`: none \| owned \| wishlist \| incoming (keeps `owned` / `wishlist` booleans in sync). |
| `AccessoryCheck` | Overlay row: product id + `accessory_id` + `present` + `quantity`. Completeness = present / catalog accessory count. |
| `IncomingDetails` | retailer, order #, ordered_at, eta, `shipState` ordered \| shipped \| arrived \| cancelled, `trackingUrl` paste-only. Arrived → owned. |

Stable accessory ids: `acc-{sku\|productId}-{slug}`. String accessories normalize at load so catalog JSON can stay string[] until a later content pass.

## Screens

| ID | Screen | Sprint |
| --- | --- | --- |
| S1 | Marketing home — hero, proof, features, pricing | S1 copy |
| S2 | Vault picker | exists |
| S3 | Catalogue cards + completeness + filters | S1 |
| S4 | Incoming list (retailer / order / ETA / ship / tracking) | S1 |
| S5 | Figure dossier — **In the box** checklist + n/m | S1 |
| S6 | Shareable shelf / collections | exists; deepen later |
| S7 | Wishlist (stays separate from incoming and owned) | exists |
| S8 | Character page | later |
| S9 | Insurance-ready export (CSV/PDF) | week 2 / later |
| S10 | Locations, spare / BAF, lot helper | later |

## Epics

**P0 — Sprint 1 (now)**

- **P0 A Completeness (DC first).** Structured accessories, overlay checks, dossier checklist, card n/m, complete / incomplete / sealed filters, mark-all-present, `accessoriesUnknown` when a live SKU has no parts.
- **P0 B Incoming.** Fourth collection status, S4 list, arrived → owned, incoming tint/badge on cards.

**P1 — next**

- Export CSV/PDF (insurance-ready). Locations. Spare / BAF depth (parts beyond a flag).

**P2 — later**

- Character page. Lot helper. Barcode scan. Photo ID. Marvel vault (and other coming-soon lines) only when a real catalog exists.

## Marketing copy

- **Hero sub:** Pack-accurate accessories. Chase labels. Your shelf. Not a spreadsheet and not a barcode dump.
- **Proof line:** 4 live vaults · {listings} · $3.99 once · no subscription
- **Feature order:** In the box → Finish the wave → Shareable shelf → Incoming → Insurance-ready export → Chase labeled → Pay once
- **Pricing footnote:** Lifetime includes current live vaults and these features as they ship.

## Sprint 1 weeks

- **Week 1:** Accessory types + load-time string→object normalize. Overlay checks persist on `UserEntry` (local + cloud JSON). DC dossier In-the-box tab. Card completeness. Filters. Mark all present.
- **Same sprint:** Incoming status + S4 + arrived→owned + card tint. Landing / pay copy. No catalog content rewrite beyond mechanical accessory shape.

## Acceptance A1

User opens a DC figure, taps 2 missing accessories (or marks all present then unchecks 2), refreshes, checks persist, catalogue card shows e.g. **7/9**.

## Explicitly not this sprint

Export CSV/PDF, Locations, Spare/BAF deep work, Character page, Lot helper, scan, photo ID, barcode, live eBay, native apps, Marvel vault.
