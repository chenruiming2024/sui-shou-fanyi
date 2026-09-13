import { useState } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useToastStore } from "../store/toastStore";

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const showToast = useToastStore((s) => s.show);

  const copy = async (text: string, message?: string) => {
    if (!text) return;
    await writeText(text);
    setCopied(true);
    if (message) showToast(message, "success");
    setTimeout(() => setCopied(false), 1500);
  };

  return { copied, copy };
}
