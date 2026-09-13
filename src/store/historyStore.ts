import { create } from "zustand";
import type { HistoryItem } from "../types/translate";
import { getHistory, searchHistory, clearHistory as apiClear } from "../lib/invoke";

interface HistoryState {
  items: HistoryItem[]; isOpen: boolean; loading: boolean;
  close: () => void; toggle: () => void;
  fetch: () => Promise<void>; search: (kw: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  items: [], isOpen: false, loading: false,
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  fetch: async () => { set({ loading: true }); try { const items = await getHistory(); set({ items }); } finally { set({ loading: false }); } },
  search: async (kw) => { if (!kw.trim()) { return getHistory().then(items => set({ items })); } set({ loading: true }); try { const items = await searchHistory(kw); set({ items }); } finally { set({ loading: false }); } },
  clearAll: async () => { await apiClear(); set({ items: [] }); },
}));