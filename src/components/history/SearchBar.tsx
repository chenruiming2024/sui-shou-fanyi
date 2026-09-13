import { Search } from "lucide-react";
import { useHistoryStore } from "../../store/historyStore";
import { useState, useEffect } from "react";

export function SearchBar() {
  const store = useHistoryStore();
  const [kw, setKw] = useState("");
  useEffect(() => { const t = setTimeout(() => { store.search(kw); }, 300); return () => clearTimeout(t); }, [kw]);
  return (
    <div className="relative">
      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={kw} onChange={e => setKw(e.target.value)}
        placeholder="搜索翻译记录..."
        className="w-full h-9 pl-8 pr-3 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
      />
    </div>
  );
}