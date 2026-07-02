import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onDismiss: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onDismiss }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 200);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="fixed top-2 inset-x-0 z-[100] mx-auto w-fit flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
        >
          {type === "success" ? (
            <CheckCircle size={16} className="text-green-500 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-500 shrink-0" />
          )}
          <span className="text-sm text-gray-800 dark:text-gray-100 whitespace-nowrap">
            {message}
          </span>
          <button
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
            className="ml-1 shrink-0"
          >
            <X size={13} className="text-gray-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}