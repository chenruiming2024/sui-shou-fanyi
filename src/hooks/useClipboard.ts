import { useEffect, useRef, useState } from "react";
import { readClipboard } from "../lib/invoke";

export function useClipboard(enabled: boolean) {
  const [lastText, setLastText] = useState("");
  const [newText, setNewText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!enabled) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(async () => {
      try {
        const text = await readClipboard();
        if (text && text !== lastText && text.length > 2 && text.length < 500) {
          setLastText(text);
          if (/[\u4e00-\u9fff]/.test(text) || /[a-zA-Z]{3,}/.test(text)) {
            setNewText(text);
          }
        }
      } catch { /* ignore */ }
    }, 1500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [enabled, lastText]);

  const dismiss = () => setNewText("");
  return { newText, dismiss };
}