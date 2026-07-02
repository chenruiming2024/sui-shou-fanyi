import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useHistoryStore } from "../../store/historyStore";
import { SearchBar } from "./SearchBar";
import { HistoryList } from "./HistoryList";

export function HistoryDrawer() {
  const store = useHistoryStore();
  return (
    <AnimatePresence>
      {store.isOpen && (
        <motion.div
          key="history-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 z-30"
          onClick={() => store.close()}
        />
      )}
      {store.isOpen && (
        <motion.div
          key="history-panel"
          initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
          className="absolute right-0 top-0 bottom-0 w-[360px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col z-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{"\u7ffb\u8bd1\u5386\u53f2"}</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => { if (confirm("\u786e\u5b9a\u6e05\u7a7a\u6240\u6709\u5386\u53f2\u8bb0\u5f55\uff1f")) store.clearAll(); }}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="\u6e05\u7a7a">
                <Trash2 size={14} className="text-red-400" />
              </button>
              <button onClick={() => store.close()}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="px-3 py-2">
            <SearchBar />
          </div>
          <div className="flex-1 overflow-auto">
            <HistoryList />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
