import { Copy, RotateCw, Trash2 } from "lucide-react";
import { useHistoryStore } from "../../store/historyStore";
import { useTranslateStore } from "../../store/translateStore";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useState } from "react";

function relativeTime(dateStr: string): string {
  const d = new Date(dateStr.replace(" ", "T"));
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 172800) return "昨天";
  return `${Math.floor(diff / 86400)} 天前`;
}

export function HistoryList() {
  const { items } = useHistoryStore();
  const ts = useTranslateStore();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">
        <p>暂无翻译记录</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {items.map(item => (
        <div key={item.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-500 font-medium mb-0.5">{item.source_lang} → {item.target_lang}</p>
              <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-2">{item.source_text}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{item.target_text}</p>
            </div>
            <span className="text-[10px] text-gray-400 shrink-0 ml-2">{relativeTime(item.created_at)}</span>
          </div>
          <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={async () => { await writeText(item.target_text); setCopiedId(item.id); setTimeout(() => setCopiedId(null), 1200); }}
              className="h-6 px-2 text-[11px] flex items-center gap-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500">
              <Copy size={11} /> {copiedId === item.id ? "已复制" : "复制"}
            </button>
            <button onClick={() => { ts.setInputText(item.source_text); ts.setFromLang(item.source_lang); ts.setToLang(item.target_lang); useHistoryStore.getState().close(); }}
              className="h-6 px-2 text-[11px] flex items-center gap-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500">
              <RotateCw size={11} /> 重译
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}