import { useState } from "react";
import { Copy, Volume2, X } from "lucide-react";
import { useTranslateStore } from "../../store/translateStore";
import { useToastStore } from "../../store/toastStore";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export function InputArea() {
  const { inputText, setInputText } = useTranslateStore();
  const [copied, setCopied] = useState(false);
  const showToast = useToastStore((s) => s.show);

  const handleCopy = async () => {
    if (!inputText) return;
    await writeText(inputText);
    setCopied(true);
    showToast("原文已复制到剪贴板", "success");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSpeak = () => {
    if (!inputText) return;
    const utterance = new SpeechSynthesisUtterance(inputText);
    utterance.lang = /[\u4e00-\u9fff]/.test(inputText) ? "zh-CN" : "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <textarea
        value={inputText}
        onChange={(e) => {
          if (e.target.value.length <= 5000) setInputText(e.target.value);
        }}
        placeholder="输入要翻译的文本"
        className="flex-1 resize-none bg-transparent text-base leading-relaxed p-4 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
      />
      <div className="h-8 flex items-center px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={handleSpeak}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="朗读原文"
          >
            <Volume2 size={14} className="text-gray-400" />
          </button>
          <button
            onClick={handleCopy}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="复制原文"
          >
            <Copy size={14} className={copied ? "text-green-500" : "text-gray-400"} />
          </button>
        </div>
        {inputText && (
          <button
            onClick={() => setInputText("")}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="清除输入"
          >
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
