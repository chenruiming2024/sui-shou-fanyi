import { useEffect, useState } from "react";
import { Minus, Maximize2, Minimize2, X, Settings, History, Pin } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { minimizeWindow, toggleMaximize, hideWindow } from "../../lib/invoke";
import { useSettingsStore } from "../../store/settingsStore";
import { useHistoryStore } from "../../store/historyStore";

export function TitleBar() {
  const settingsStore = useSettingsStore();
  const historyStore = useHistoryStore();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let disposed = false;
    let unlisten: (() => void) | undefined;
    const refresh = () => {
      appWindow.isMaximized().then((v) => {
        if (!disposed) setIsMaximized(v);
      }).catch(() => {});
    };
    refresh();
    appWindow.onResized(refresh).then((fn) => {
      if (disposed) fn();
      else unlisten = fn;
    }).catch(() => {});
    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  return (
    <div className="h-10 flex items-center px-3 select-none shrink-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center gap-2 pointer-events-none">
        <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">T</span>
        </div>
        <span className="text-[13px] font-medium text-gray-800 dark:text-gray-100">{"随手翻译"}</span>
      </div>
      <div className="flex-1 h-full cursor-move" data-tauri-drag-region />
      <div className="flex items-center gap-1">
        <button onClick={() => settingsStore.toggle()} className="w-9 h-7 flex items-center justify-center rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors" title={"设置"}>
          <Settings size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
        <button onClick={() => { const willOpen = !historyStore.isOpen; historyStore.toggle(); if (willOpen) historyStore.fetch(); }} className="w-9 h-7 flex items-center justify-center rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors" title={"历史记录"}>
          <History size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
        <button
          onClick={() => settingsStore.setAlwaysOnTop(!settingsStore.alwaysOnTop)}
          className={`w-9 h-7 flex items-center justify-center rounded-md transition-colors ${
            settingsStore.alwaysOnTop
              ? "bg-blue-500/15 hover:bg-blue-500/25"
              : "hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
          }`}
          title={settingsStore.alwaysOnTop ? "取消置顶" : "窗口置顶"}
        >
          <Pin size={14} className={settingsStore.alwaysOnTop ? "text-blue-500" : "text-gray-500 dark:text-gray-400"} />
        </button>
        <button onClick={() => minimizeWindow()} className="w-9 h-7 flex items-center justify-center rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors">
          <Minus size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
        <button onClick={() => toggleMaximize()} className="w-9 h-7 flex items-center justify-center rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors" title={isMaximized ? "向下还原" : "最大化"}>
          {isMaximized
            ? <Minimize2 size={14} className="text-gray-500 dark:text-gray-400" />
            : <Maximize2 size={14} className="text-gray-500 dark:text-gray-400" />}
        </button>
        <button onClick={() => hideWindow()} className="w-9 h-7 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white transition-colors group">
          <X size={14} className="text-gray-500 dark:text-gray-400 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}
