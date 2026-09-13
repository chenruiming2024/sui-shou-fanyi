import { create } from "zustand";
import type { TranslateResult } from "../types/translate";
import { DEFAULT_FROM, DEFAULT_TO } from "../lib/constants";

interface TranslateState {
  inputText: string; outputText: string; fromLang: string; toLang: string;
  isTranslating: boolean; elapsedMs: number; error: string | null;
  setInputText: (t: string) => void; setFromLang: (l: string) => void; setToLang: (l: string) => void;
  swapLangs: () => void; swapLangsOnly: () => void; setResult: (r: TranslateResult) => void; setError: (e: string) => void;
  setTranslating: (v: boolean) => void;
}

export const useTranslateStore = create<TranslateState>((set, get) => ({
  inputText: "", outputText: "", fromLang: DEFAULT_FROM, toLang: DEFAULT_TO,
  isTranslating: false, elapsedMs: 0, error: null,
  setInputText: (t) => set({ inputText: t }),
  setFromLang: (l) => set({ fromLang: l }),
  setToLang: (l) => set({ toLang: l }),
  swapLangs: () => { const { fromLang, toLang, inputText, outputText } = get(); set({ fromLang: toLang, toLang: fromLang, inputText: outputText, outputText: inputText }); },
  swapLangsOnly: () => { const { fromLang, toLang } = get(); set({ fromLang: toLang, toLang: fromLang }); },
  setResult: (r) => set({ outputText: r.result, elapsedMs: r.elapsed_ms, isTranslating: false, error: null }),
  setError: (e) => set({ error: e, isTranslating: false }),
  setTranslating: (v) => set({ isTranslating: v }),
}));
