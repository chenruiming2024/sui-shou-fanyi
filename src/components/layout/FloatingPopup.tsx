import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { useTranslateStore } from "../../store/translateStore";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface Props { text: string; onDismiss: () => void; }

export function FloatingPopup({ text, onDismiss }: Props) {
  const store = useTranslateStore();
  const handleOpen = async () => {
    store.setInputText(text);
    onDismiss();
    await getCurrentWindow().setFocus();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-4 right-4 z-50 max-w-[320px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-3"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">📋 {text}</p>
          <button onClick={onDismiss} className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={12} />
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={handleOpen} className="flex-1 h-7 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-1">
            <ExternalLink size={12} /> 打开主窗口
          </button>
          <button onClick={onDismiss} className="h-7 px-3 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">关闭</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}