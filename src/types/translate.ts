export interface TranslateRequest { text: string; from: string; to: string; }

export interface TranslateResult { result: string; elapsed_ms: number; }

export interface HistoryItem { id: number; source_text: string; target_text: string; source_lang: string; target_lang: string; created_at: string; }
export type ThemeMode = "light" | "dark" | "system";
