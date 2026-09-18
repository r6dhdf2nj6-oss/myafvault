import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AccessoryCheck,
  CollectionStatus,
  IncomingDetails,
  ProductCategory,
  UserCollection,
  UserEntry,
} from "@/lib/types";
import { emptyIncoming, statusFlags } from "@/lib/collection-status";

export type SortKey =
  | "name-asc"
  | "name-desc"
  | "year-desc"
  | "year-asc"
  | "character-asc"
  | "owned-first";

export type ViewMode = "grid" | "list";
export type ScopeFilter =
  | "owned"
  | "wishlist"
  | "unowned"
  | "custom"
  | "incoming"
  | "complete"
  | "incomplete"
  | "sealed";


export type AppSection = "catalogue" | "collections" | "incoming";

interface CatalogueState {
  entries: Record<string, UserEntry>;
  collections: Record<string, UserCollection>;
  search: string;
  categoryFilters: ProductCategory[];
  lineFilters: string[];
  scopeFilters: ScopeFilter[];
  sort: SortKey;
  view: ViewMode;
  section: AppSection;

  setSearch: (q: string) => void;
  setCategoryFilters: (c: ProductCategory[]) => void;
  toggleCategoryFilter: (c: ProductCategory | "all") => void;
  setLineFilters: (l: string[]) => void;
  toggleLineFilter: (l: string) => void;
  setScopeFilters: (s: ScopeFilter[]) => void;
  toggleScopeFilter: (s: ScopeFilter) => void;

  setSort: (s: SortKey) => void;
  setView: (v: ViewMode) => void;
  setSection: (s: AppSection) => void;

  markOwned: (productId: string, owned?: boolean) => void;
  toggleWishlist: (productId: string) => void;
  setCollectionStatus: (productId: string, status: CollectionStatus) => void;
  markIncoming: (
    productId: string,
    details?: Partial<IncomingDetails>,
  ) => void;
  markArrived: (productId: string) => void;
  setAccessoryCheck: (
    productId: string,
    accessoryId: string,
    present: boolean,
    quantity?: number,
  ) => void;
  markAllAccessoriesPresent: (
    productId: string,
    accessoryIds: string[],
  ) => void;
  bulkMarkOwned: (productIds: string[], owned: boolean) => void;
  bulkSetWishlist: (productIds: string[], wishlist: boolean) => void;
  updateEntry: (productId: string, patch: Partial<UserEntry>) => void;
  addPersonalPhoto: (productId: string, dataUrl: string) => void;
  removePersonalPhoto: (productId: string, index: number) => void;
  /** Set which personal photo is THIS user's cover only */
  setPersonalCover: (productId: string, index: number) => void;
  /** Stop using personal cover; fall back to system/catalog */
  clearPersonalCover: (productId: string) => void;
  addCustomEntry: (entry: UserEntry) => void;
  removeEntry: (productId: string) => void;
  importEntries: (entries: Record<string, UserEntry>) => void;
  replaceEntries: (entries: Record<string, UserEntry>) => void;
  clearCollection: () => void;

  upsertCollection: (collection: UserCollection) => void;
  updateCollection: (
    id: string,
    patch: Partial<UserCollection>,
  ) => void;
  removeCollection: (id: string) => void;
  addCollectionPhoto: (id: string, dataUrl: string) => void;
  removeCollectionPhoto: (id: string, index: number) => void;
  setCollectionProducts: (id: string, productIds: string[]) => void;
  replaceCollections: (collections: Record<string, UserCollection>) => void;
  ownerUserId: string | null;
}

function emptyEntry(productId: string): UserEntry {
  const now = new Date().toISOString();
  return {
    productId,
    status: "none",
    owned: false,
    wishlist: false,
    accessoryChecks: {},
    condition: null,
    purchasePrice: null,
    estimatedValue: null,
    purchaseDate: null,
    notes: "",
    personalPhotos: [],
    usePersonalPhoto: false,
    createdAt: now,
    updatedAt: now,
  };
}

function touch(
  entry: UserEntry,
  patch: Partial<UserEntry>,
): UserEntry {
  return { ...entry, ...patch, updatedAt: new Date().toISOString() };
}

function touchCollection(
  col: UserCollection,
  patch: Partial<UserCollection>,
): UserCollection {
  return { ...col, ...patch, updatedAt: new Date().toISOString() };
}

const persistOwnerRef = { current: null as string | null };

const userScopedStorage = createJSONStorage(() => ({
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const owner = persistOwnerRef.current;
    if (!owner) return null;
    return window.localStorage.getItem(`${name}:${owner}`);
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    const owner = persistOwnerRef.current;
    if (!owner) return;
    window.localStorage.setItem(`${name}:${owner}`, value);
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    const owner = persistOwnerRef.current;
    if (!owner) return;
    window.localStorage.removeItem(`${name}:${owner}`);
  },
}));

export const useCatalogue = create<CatalogueState>()(
  persist(
    (set, get) => ({
      entries: {},
      collections: {},
      search: "",
      categoryFilters: [],
      lineFilters: [],
      scopeFilters: [],
      sort: "year-desc",
      view: "grid",
      section: "catalogue",
      ownerUserId: null,

      setSearch: (search) => set({ search }),
      setCategoryFilters: (categoryFilters) => set({ categoryFilters }),
      toggleCategoryFilter: (c) => {
        if (c === "all") {
          set({ categoryFilters: [] });
          return;
        }
        const cur = get().categoryFilters;
        set({
          categoryFilters: cur.includes(c)
            ? cur.filter((x) => x !== c)
            : [...cur, c],
        });
      },
      setLineFilters: (lineFilters) => set({ lineFilters }),
      toggleLineFilter: (l) => {
        const cur = get().lineFilters;
        set({
          lineFilters: cur.includes(l)
            ? cur.filter((x) => x !== l)
            : [...cur, l],
        });
      },
      setScopeFilters: (scopeFilters) => set({ scopeFilters }),
      toggleScopeFilter: (s) => {
        const cur = get().scopeFilters;
        set({
          scopeFilters: cur.includes(s)
            ? cur.filter((x) => x !== s)
            : [...cur, s],
        });
      },
      setSort: (sort) => set({ sort }),
      setView: (view) => set({ view }),
      setSection: (section) => set({ section }),

      markOwned: (productId, owned = true) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        const status: CollectionStatus = owned
          ? "owned"
          : cur.status === "incoming"
            ? "incoming"
            : cur.wishlist
              ? "wishlist"
              : "none";
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              ...statusFlags(status),
            }),
          },
        });
      },

      toggleWishlist: (productId) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        const nextOn = !cur.wishlist;
        set({
          entries: {
            ...get().entries,
            [productId]: touch(
              cur,
              nextOn
                ? statusFlags("wishlist")
                : statusFlags(cur.owned ? "owned" : "none"),
            ),
          },
        });
      },

      setCollectionStatus: (productId, status) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        const incoming =
          status === "incoming"
            ? (cur.incoming ?? emptyIncoming())
            : cur.incoming;
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              ...statusFlags(status),
              incoming,
            }),
          },
        });
      },

      markIncoming: (productId, details) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              ...statusFlags("incoming"),
              incoming: {
                ...(cur.incoming ?? emptyIncoming()),
                ...details,
              },
            }),
          },
        });
      },

      markArrived: (productId) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              ...statusFlags("owned"),
              incoming: {
                ...(cur.incoming ?? emptyIncoming()),
                shipState: "arrived",
              },
            }),
          },
        });
      },

      setAccessoryCheck: (productId, accessoryId, present, quantity = 1) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        const next: AccessoryCheck = {
          accessoryId,
          present,
          quantity: Math.max(1, quantity),
        };
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              accessoryChecks: {
                ...(cur.accessoryChecks ?? {}),
                [accessoryId]: next,
              },
            }),
          },
        });
      },

      markAllAccessoriesPresent: (productId, accessoryIds) => {
        if (accessoryIds.length === 0) return;
        const cur = get().entries[productId] ?? emptyEntry(productId);
        const accessoryChecks = { ...(cur.accessoryChecks ?? {}) };
        for (const accessoryId of accessoryIds) {
          accessoryChecks[accessoryId] = {
            accessoryId,
            present: true,
            quantity: accessoryChecks[accessoryId]?.quantity ?? 1,
          };
        }
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, { accessoryChecks }),
          },
        });
      },

      bulkMarkOwned: (productIds, owned) => {
        if (productIds.length === 0) return;
        const next = { ...get().entries };
        const now = new Date().toISOString();
        for (const id of productIds) {
          const cur = next[id] ?? emptyEntry(id);
          next[id] = {
            ...cur,
            ...statusFlags(owned ? "owned" : cur.wishlist ? "wishlist" : "none"),
            updatedAt: now,
          };
        }
        set({ entries: next });
      },

      bulkSetWishlist: (productIds, wishlist) => {
        if (productIds.length === 0) return;
        const next = { ...get().entries };
        const now = new Date().toISOString();
        for (const id of productIds) {
          const cur = next[id] ?? emptyEntry(id);
          next[id] = {
            ...cur,
            ...statusFlags(
              wishlist ? "wishlist" : cur.owned ? "owned" : "none",
            ),
            updatedAt: now,
          };
        }
        set({ entries: next });
      },

      updateEntry: (productId, patch) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        let next = patch;
        if (patch.status) {
          next = { ...patch, ...statusFlags(patch.status) };
        } else if (patch.owned === true) {
          next = { ...patch, ...statusFlags("owned") };
        } else if (patch.wishlist === true) {
          next = { ...patch, ...statusFlags("wishlist") };
        }
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, next),
          },
        });
      },

      addPersonalPhoto: (productId, dataUrl) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        const photos = [...cur.personalPhotos, dataUrl].slice(0, 8);
        const newIndex = photos.length - 1;
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              personalPhotos: photos,
              usePersonalPhoto: true,
              personalCoverIndex: newIndex,
              ...statusFlags("owned"),
            }),
          },
        });
      },

      removePersonalPhoto: (productId, index) => {
        const cur = get().entries[productId];
        if (!cur) return;
        const photos = cur.personalPhotos.filter((_, i) => i !== index);
        let coverIdx = cur.personalCoverIndex ?? 0;
        if (photos.length === 0) {
          coverIdx = 0;
        } else if (index < coverIdx) {
          coverIdx = coverIdx - 1;
        } else if (index === coverIdx) {
          coverIdx = Math.min(coverIdx, photos.length - 1);
        }
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              personalPhotos: photos,
              usePersonalPhoto: photos.length > 0 ? cur.usePersonalPhoto : false,
              personalCoverIndex: photos.length > 0 ? coverIdx : 0,
            }),
          },
        });
      },

      setPersonalCover: (productId, index) => {
        const cur = get().entries[productId] ?? emptyEntry(productId);
        if (cur.personalPhotos.length === 0) return;
        const safe = Math.max(0, Math.min(index, cur.personalPhotos.length - 1));
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              usePersonalPhoto: true,
              personalCoverIndex: safe,
            }),
          },
        });
      },

      clearPersonalCover: (productId) => {
        const cur = get().entries[productId];
        if (!cur) return;
        set({
          entries: {
            ...get().entries,
            [productId]: touch(cur, {
              usePersonalPhoto: false,
            }),
          },
        });
      },

      addCustomEntry: (entry) => {
        set({
          entries: {
            ...get().entries,
            [entry.productId]: entry,
          },
        });
      },

      removeEntry: (productId) => {
        const next = { ...get().entries };
        delete next[productId];
        set({ entries: next });
      },

      importEntries: (entries) => {
        set({ entries: { ...get().entries, ...entries } });
      },

      replaceEntries: (entries) => {
        set({ entries });
      },

      clearCollection: () => set({ entries: {}, collections: {} }),

      upsertCollection: (collection) => {
        set({
          collections: {
            ...get().collections,
            [collection.id]: collection,
          },
        });
      },

      updateCollection: (id, patch) => {
        const cur = get().collections[id];
        if (!cur) return;
        set({
          collections: {
            ...get().collections,
            [id]: touchCollection(cur, patch),
          },
        });
      },

      removeCollection: (id) => {
        const next = { ...get().collections };
        delete next[id];
        set({ collections: next });
      },

      addCollectionPhoto: (id, dataUrl) => {
        const cur = get().collections[id];
        if (!cur) return;
        const photos = [...cur.photos, dataUrl].slice(0, 24);
        set({
          collections: {
            ...get().collections,
            [id]: touchCollection(cur, {
              photos,
              coverPhotoIndex:
                cur.photos.length === 0 ? 0 : cur.coverPhotoIndex,
            }),
          },
        });
      },

      removeCollectionPhoto: (id, index) => {
        const cur = get().collections[id];
        if (!cur) return;
        const photos = cur.photos.filter((_, i) => i !== index);
        let cover = cur.coverPhotoIndex;
        if (photos.length === 0) cover = 0;
        else if (index === cover) cover = 0;
        else if (index < cover) cover = Math.max(0, cover - 1);
        set({
          collections: {
            ...get().collections,
            [id]: touchCollection(cur, {
              photos,
              coverPhotoIndex: cover,
            }),
          },
        });
      },

      setCollectionProducts: (id, productIds) => {
        const cur = get().collections[id];
        if (!cur) return;
        set({
          collections: {
            ...get().collections,
            [id]: touchCollection(cur, { productIds }),
          },
        });
      },

      replaceCollections: (collections) => {
        set({ collections });
      },
    }),
    {
      name: "dc-mcfarlane-catalogue-v4",
      storage: userScopedStorage,
      skipHydration: true,
      partialize: (s) => ({
        entries: s.entries,
        collections: s.collections,
        view: s.view,
        section: s.section,
        ownerUserId: s.ownerUserId,
      }),
    },
  ),
);

export async function hydrateCatalogue(userId?: string | null): Promise<void> {
  if (typeof window === "undefined") return;
  persistOwnerRef.current = userId ?? null;
  if (!userId) {
    useCatalogue.setState({
      entries: {},
      collections: {},
      ownerUserId: null,
      sort: "year-desc",
    });
    return;
  }
  await useCatalogue.persist.rehydrate();
  const owner = useCatalogue.getState().ownerUserId;
  if (owner && owner !== userId) {
    useCatalogue.setState({
      entries: {},
      collections: {},
      ownerUserId: userId,
    });
  } else if (!owner) {
    useCatalogue.setState({ ownerUserId: userId });
  }
  useCatalogue.setState({ sort: "year-desc" });
}

/** Drop in-memory vault without writing empty data into another user's cache. */
export function unloadCatalogue(): void {
  persistOwnerRef.current = null;
  useCatalogue.setState({
    entries: {},
    collections: {},
    ownerUserId: null,
    sort: "year-desc",
  });
}

export function selectCollectionStats(entries: Record<string, UserEntry>) {
  const list = Object.values(entries);
  const owned = list.filter((e) => e.owned);
  const wishlist = list.filter((e) => e.wishlist && !e.owned);
  const incoming = list.filter(
    (e) => e.status === "incoming" && !e.owned,
  );
  const spent = owned.reduce((s, e) => s + (e.purchasePrice ?? 0), 0);
  const estValue = owned.reduce((s, e) => s + (e.estimatedValue ?? 0), 0);
  const mint = owned.filter(
    (e) => e.condition === "mint" || e.condition === "near-mint",
  ).length;
  const withPhotos = owned.filter((e) => e.personalPhotos.length > 0).length;
  return {
    owned: owned.length,
    wishlist: wishlist.length,
    incoming: incoming.length,
    spent,
    estValue,
    mint,
    withPhotos,
  };
}

export function newCollectionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `col-${crypto.randomUUID()}`;
  }
  return `col-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
