import { motion } from "framer-motion";
import { Copy, Volume2 } from "lucide-react";
import { useTranslateStore } from "../../store/translateStore";
import { useToastStore } from "../../store/toastStore";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useState } from "react";

export function OutputArea() {
  const { outputText, isTranslating, error } = useTranslateStore();
  const [copied, setCopied] = useState(false);
  const showToast = useToastStore((s) => s.show);

  const handleCopy = async () => {
    if (!outputText) return;
    await writeText(outputText);
    setCopied(true);
    showToast("译文已复制到剪贴板", "success");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSpeak = () => {
    if (!outputText) return;
    const utterance = new SpeechSynthesisUtterance(outputText);
    utterance.lang = /[\u4e00-\u9fff]/.test(outputText) ? "zh-CN" : "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex-1 p-4 overflow-auto">
        {isTranslating ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : outputText ? (
          <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}
            className="text-base leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{outputText}</motion.p>
        ) : (
          <p className="text-base text-gray-400 dark:text-gray-500">翻译结果将显示在这里</p>
        )}
      </div>
      <div className="h-8 flex items-center gap-1 px-4">
        <button onClick={handleSpeak} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="朗读">
          <Volume2 size={14} className="text-gray-400" />
        </button>
        <button onClick={handleCopy} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="复制">
          <Copy size={14} className={copied ? "text-green-500" : "text-gray-400"} />
        </button>
      </div>
    </div>
  );
}
