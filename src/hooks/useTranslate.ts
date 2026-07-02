import { useEffect, useCallback } from "react";
import { translate as apiTranslate, addHistory } from "../lib/invoke";
import { useTranslateStore } from "../store/translateStore";

const isChineseText = (text: string): boolean => {
  return /[\u4e00-\u9fff]/.test(text.trim());
};

export function useTranslate() {
  const store = useTranslateStore();
  const { inputText, fromLang, toLang, isTranslating } = store;

  const doTranslate = useCallback(async () => {
    if (!inputText.trim() || isTranslating) return;

    // 中英互译场景下的语言自动识别
    const isZhEnPair =
      (fromLang === "zh" && toLang === "en") || (fromLang === "en" && toLang === "zh");

    if (isZhEnPair) {
      const inputIsChinese = isChineseText(inputText);
      const inputIsEnglish = !inputIsChinese && /[a-zA-Z]/.test(inputText.trim());

      // 源语言是中文但输入是英文 → 交换为英→中（仅交换语言方向，保留用户输入）
      if (fromLang === "zh" && inputIsEnglish) {
        store.swapLangsOnly();
        return;
      }
      // 源语言是英文但输入是中文 → 交换为中→英（仅交换语言方向，保留用户输入）
      if (fromLang === "en" && inputIsChinese) {
        store.swapLangsOnly();
        return;
      }
    }

    store.setTranslating(true);

    try {
      const result = await apiTranslate({
        text: inputText.trim(),
        from: fromLang,
        to: toLang,
      });
      store.setResult(result);
      addHistory(inputText.trim(), result.result, fromLang, toLang).catch(() => {});
    } catch (e) {
      store.setError(String(e));
    }
  }, [inputText, fromLang, toLang, isTranslating]);

  useEffect(() => {
    if (!inputText.trim()) {
      // 清空输入后同步清空输出和计时
      useTranslateStore.getState().setResult({ result: "", elapsed_ms: 0 });
      return;
    }
    const timer = setTimeout(doTranslate, 500);
    return () => clearTimeout(timer);
  }, [inputText, fromLang, toLang]);

  return { doTranslate, ...store };
}
