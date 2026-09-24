import { invoke } from "@tauri-apps/api/core";
import type { TranslateRequest, TranslateResult, HistoryItem } from "../types/translate";

export async function translate(req: TranslateRequest): Promise<TranslateResult> { return invoke("translate", { req }); }
export async function getHistory(limit?: number): Promise<HistoryItem[]> { return invoke("get_history", { limit: limit ?? 100 }); }
export async function searchHistory(keyword: string): Promise<HistoryItem[]> { return invoke("search_history", { keyword }); }
export async function addHistory(source_text: string, target_text: string, source_lang: string, target_lang: string): Promise<void> { return invoke("add_history", { sourceText: source_text, targetText: target_text, sourceLang: source_lang, targetLang: target_lang }); }
export async function clearHistory(): Promise<void> { return invoke("clear_history"); }
export async function exportHistoryCsv(): Promise<string> { return invoke("export_history_csv"); }
export async function getConfig(): Promise<Record<string, string>> { return invoke("get_config"); }
export async function saveConfig(appid: string, secretKey: string): Promise<void> { return invoke("save_config", { appid, secretKey }); }
export async function minimizeWindow(): Promise<void> { return invoke("minimize_window"); }
export async function toggleMaximize(): Promise<void> { return invoke("toggle_maximize"); }
export async function hideWindow(): Promise<void> { return invoke("hide_window"); }
export async function setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> { return invoke("set_always_on_top", { alwaysOnTop }); }
export async function registerShortcut(shortcutStr: string): Promise<void> { return invoke("register_shortcut", { shortcutStr }); }
