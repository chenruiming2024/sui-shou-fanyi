import { create } from "zustand";
import type { ThemeMode } from "../types/translate";

interface SettingsState {
  isOpen: boolean; theme: ThemeMode; shortcut: string;
  clipboardWatch: boolean; alwaysOnTop: boolean;
  toggle: () => void; open: () => void; close: () => void;
  setTheme: (t: ThemeMode) => void; setShortcut: (s: string) => void;
  setClipboardWatch: (v: boolean) => void; setAlwaysOnTop: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isOpen: false, theme: (localStorage.getItem("theme") as ThemeMode) || "system",
  shortcut: localStorage.getItem("shortcut") || "Alt+T",
  clipboardWatch: localStorage.getItem("clipboardWatch") === "true",
  alwaysOnTop: localStorage.getItem("alwaysOnTop") === "true",
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setTheme: (t) => { localStorage.setItem("theme", t); set({ theme: t }); },
  setShortcut: (s) => { localStorage.setItem("shortcut", s); set({ shortcut: s }); },
  setClipboardWatch: (v) => { localStorage.setItem("clipboardWatch", String(v)); set({ clipboardWatch: v }); },
  setAlwaysOnTop: (v) => { localStorage.setItem("alwaysOnTop", String(v)); set({ alwaysOnTop: v }); },
}));
