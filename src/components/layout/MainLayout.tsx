import { useTranslate } from "../../hooks/useTranslate";
import { useTranslateStore } from "../../store/translateStore";
import { InputArea } from "../translate/InputArea";
import { OutputArea } from "../translate/OutputArea";
import { LanguageSelector } from "../translate/LanguageSelector";
import { SwapButton } from "../translate/SwapButton";
import { HistoryDrawer } from "../history/HistoryDrawer";
import { SettingsPanel } from "../settings/SettingsPanel";
import { FloatingPopup } from "./FloatingPopup";
import { useClipboard } from "../../hooks/useClipboard";
import { useSettingsStore } from "../../store/settingsStore";
import { MAX_CHARS } from "../../lib/constants";

export function MainLayout() {
  const { doTranslate, fromLang, toLang, isTranslating, elapsedMs, error, inputText } = useTranslate();
  const { clipboardWatch } = useSettingsStore();
  const { newText, dismiss } = useClipboard(clipboardWatch);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Language bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0">
        <LanguageSelector value={fromLang} onChange={(l) => useTranslateStore.getState().setFromLang(l)} />
        <SwapButton />
        <LanguageSelector value={toLang} onChange={(l) => useTranslateStore.getState().setToLang(l)} align="right" />
      </div>

      {/* Input + Output */}
      <div className="flex-1 flex min-h-0">
        <InputArea />
        <div className="w-px bg-gray-200 dark:bg-gray-700 shrink-0" />
        <OutputArea />
      </div>

      {/* Status bar */}
      <div className="h-8 flex items-center px-4 border-t border-gray-200/50 dark:border-gray-700/50 shrink-0">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">百度翻译</span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2">{inputText.length} / {MAX_CHARS}</span>
        {elapsedMs > 0 && <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2">耗时 {elapsedMs}ms</span>}
        {error && <span className="text-[11px] text-red-400 ml-2">{error}</span>}
        <div className="flex-1" />
        <button onClick={doTranslate} disabled={isTranslating} className="h-7 px-4 text-xs font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors">
          {isTranslating ? "翻译中..." : "翻译"}
        </button>
      </div>

      {/* Overlays */}
      <HistoryDrawer />
      <SettingsPanel />
      {newText && <FloatingPopup text={newText} onDismiss={dismiss} />}
    </div>
  );
}