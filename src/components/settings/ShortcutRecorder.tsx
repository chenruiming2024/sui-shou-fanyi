import { useState, useEffect, useRef, useCallback } from "react";
import { Keyboard } from "lucide-react";

interface Props { value: string; onChange: (v: string) => void; }

const keyToCode: Record<string, string> = {
  "A": "KeyA", "B": "KeyB", "C": "KeyC", "D": "KeyD", "E": "KeyE",
  "F": "KeyF", "G": "KeyG", "H": "KeyH", "I": "KeyI", "J": "KeyJ",
  "K": "KeyK", "L": "KeyL", "M": "KeyM", "N": "KeyN", "O": "KeyO",
  "P": "KeyP", "Q": "KeyQ", "R": "KeyR", "S": "KeyS", "T": "KeyT",
  "U": "KeyU", "V": "KeyV", "W": "KeyW", "X": "KeyX", "Y": "KeyY",
  "Z": "KeyZ",
  "0": "Digit0", "1": "Digit1", "2": "Digit2", "3": "Digit3", "4": "Digit4",
  "5": "Digit5", "6": "Digit6", "7": "Digit7", "8": "Digit8", "9": "Digit9",
  "F1": "F1", "F2": "F2", "F3": "F3", "F4": "F4", "F5": "F5",
  "F6": "F6", "F7": "F7", "F8": "F8", "F9": "F9", "F10": "F10",
  "F11": "F11", "F12": "F12",
  "Escape": "Escape", "Tab": "Tab", "Space": "Space",
  "Enter": "Enter", "Backspace": "Backspace", "Delete": "Delete",
  "ArrowUp": "ArrowUp", "ArrowDown": "ArrowDown", "ArrowLeft": "ArrowLeft", "ArrowRight": "ArrowRight",
  "Home": "Home", "End": "End", "PageUp": "PageUp", "PageDown": "PageDown",
  "Insert": "Insert",
};

export function ShortcutRecorder({ value, onChange }: Props) {
  const [recording, setRecording] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const formatShortcut = useCallback((parts: string[]): string => {
    const modifiers = parts.filter(p => ["Ctrl", "Shift", "Alt", "Meta"].includes(p));
    const key = parts.find(p => !["Ctrl", "Shift", "Alt", "Meta"].includes(p));
    if (!key) return "";
    const code = keyToCode[key] || key;
    const modStr = modifiers.join("+");
    return modStr ? `${modStr}+${code}` : code;
  }, []);

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

      if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;

      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      parts.push(key);

      const formatted = formatShortcut(parts);
      if (formatted) {
        onChange(formatted);
        setRecording(false);
      }
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
  }, [recording, onChange, formatShortcut]);

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
          按下快捷键...
          <kbd className="px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">ESC</kbd>
          取消
        </span>
      ) : (
        displayValue
      )}
    </button>
  );
}
