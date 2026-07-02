import { useState, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { LANG_OPTIONS } from "../../lib/constants";

interface Props { value: string; onChange: (code: string) => void; excludeAuto?: boolean; align?: "left" | "right"; }

export function LanguageSelector({ value, onChange, excludeAuto, align = "left" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = LANG_OPTIONS;
  const current = options.find(o => o.code === value);

  return (
    <div className="relative" ref={ref} onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 h-8 px-3 rounded-full text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
        {current?.label || value}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className={`absolute top-full pt-1 ${align === "right" ? "right-0" : "left-0"} w-40 z-50`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
            {options.map(opt => (
              <button key={opt.code} onClick={() => { onChange(opt.code); setOpen(false); }}
                className="w-full h-10 px-3 flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                {opt.label}
                {opt.code === value && <Check size={14} className="text-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
