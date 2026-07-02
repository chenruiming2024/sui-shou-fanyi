import { create } from "zustand";
import type { HistoryItem } from "../types/translate";
import { getHistory, searchHistory, clearHistory as apiClear } from "../lib/invoke";

interface HistoryState {
  items: HistoryItem[]; isOpen: boolean; searchKeyword: string; loading: boolean;
  open: () => void; close: () => void; toggle: () => void;
  fetch: (limit?: number) => Promise<void>; search: (kw: string) => Promise<void>;
  setSearchKeyword: (kw: string) => void; clearAll: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  items: [], isOpen: false, searchKeyword: "", loading: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  fetch: async (limit) => { set({ loading: true }); try { const items = await getHistory(limit); set({ items }); } finally { set({ loading: false }); } },
  search: async (kw) => { if (!kw.trim()) { return getHistory().then(items => set({ items })); } set({ loading: true }); try { const items = await searchHistory(kw); set({ items }); } finally { set({ loading: false }); } },
  setSearchKeyword: (kw) => set({ searchKeyword: kw }),
  clearAll: async () => { await apiClear(); set({ items: [] }); },
}));