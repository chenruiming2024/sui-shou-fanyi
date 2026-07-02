import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { useTranslateStore } from "../../store/translateStore";

export function SwapButton() {
  const swapLangs = useTranslateStore(s => s.swapLangs);
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ rotate: 180 }} transition={{ duration: 0.3 }}
      onClick={swapLangs}
      className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
      <ArrowLeftRight size={14} className="text-gray-500 dark:text-gray-400" />
    </motion.button>
  );
}