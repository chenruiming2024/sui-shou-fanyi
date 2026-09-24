import { useState, useEffect, useRef } from "react";
import { Keyboard } from "lucide-react";
import { useToastStore } from "../../store/toastStore";

interface Props { value: string; onChange: (v: string) => void; }

const MODIFIER_KEYS = ["Control", "Shift", "Alt", "Meta"];

export function ShortcutRecorder({ value, onChange }: Props) {
  const [recording, setRecording] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        setRecording(false);
        return;
      }

      const parts: string[] = [];
      if (e.ctrlKey) parts.push("Ctrl");
      if (e.shiftKey) parts.push("Shift");
      if (e.altKey) parts.push("Alt");
      if (e.metaKey) parts.push("Meta");

      if (MODIFIER_KEYS.includes(e.key)) return;

      // 必须带修饰键：无修饰键的全局热键会被系统独占，其他程序里就敲不出这个键
      if (parts.length === 0) {
        showToast(`请搭配 Ctrl / Shift / Alt / Win 使用，不能只用 ${e.key === " " ? "空格" : e.key}`, "error");
        return;
      }

      // 后端 parse_shortcut_str 同时接受裸键名与 Code 形式（"T" | "KeyT"）
      const key = e.key === " " ? "Space" : e.key.length === 1 ? e.key.toUpperCase() : e.key;
      parts.push(key);

      onChange(parts.join("+"));
      setRecording(false);
    };

    document.addEventListener("keydown", handleKeyDown, true);

    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setRecording(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [recording, onChange, showToast]);

  const displayValue = value
    .replace(/Key([A-Z])/g, "$1")
    .replace(/Digit(\d)/g, "$1");

  return (
    <button
      ref={buttonRef}
      onClick={() => setRecording(!recording)}
      className={`h-8 px-3 flex items-center gap-1.5 text-xs rounded-lg transition-colors ${
        recording
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/30"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      <Keyboard size={13} />
      {recording ? (
        <span className="flex items-center gap-1">
          按下组合键（需含修饰键）
          <kbd className="px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">ESC</kbd>
          取消
        </span>
      ) : (
        displayValue
      )}
    </button>
  );
}
