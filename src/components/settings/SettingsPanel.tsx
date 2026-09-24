import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Moon, Monitor, Download, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { useSettingsStore } from "../../store/settingsStore";
import { exportHistoryCsv, getConfig, saveConfig, registerShortcut } from "../../lib/invoke";
import { useHistoryStore } from "../../store/historyStore";
import { useToastStore } from "../../store/toastStore";
import { ShortcutRecorder } from "./ShortcutRecorder";
import { Switch } from "../common/Switch";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { getVersion } from "@tauri-apps/api/app";
import type { ThemeMode } from "../../types/translate";

export function SettingsPanel() {
  const store = useSettingsStore();
  const [appid, setAppid] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // 版本号取自构建产物（tauri.conf.json / Cargo.toml），避免 UI 里再硬编码一份
  const [appVersion, setAppVersion] = useState("");
  const showToast = useToastStore((s) => s.show);
  // 最近一次注册成功的快捷键，用于注册失败时回退
  const lastRegisteredRef = useRef<string | null>(null);

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => {});
  }, []);

  useEffect(() => {
    if (store.isOpen) {
      getConfig().then((cfg) => {
        setAppid(cfg.appid || "");
        setSecretKey(cfg.secret_key || "");
      }).catch(() => {});
    }
  }, [store.isOpen]);

  useEffect(() => {
    const shortcut = store.shortcut;
    if (!shortcut) return;
    registerShortcut(shortcut)
      .then(() => {
        lastRegisteredRef.current = shortcut;
      })
      .catch((err: unknown) => {
        // 后端按原因返回不同文案（缺修饰键 / 不支持的按键 / 已被占用），原样透出
        const reason = typeof err === "string" && err ? err : `快捷键 ${shortcut} 注册失败`;
        const fallback = lastRegisteredRef.current;
        showToast(
          fallback
            ? `${reason}，已恢复为 ${fallback}`
            : `${reason}，请在设置中更换组合键`,
          "error"
        );
        if (fallback && fallback !== shortcut) {
          store.setShortcut(fallback);
        }
      });
  }, [store.shortcut]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig(appid, secretKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("保存失败: " + e); }
    finally { setSaving(false); }
  };

  const themeOptions: { label: string; value: ThemeMode; icon: React.ReactNode }[] = [
    { label: "亮色", value: "light", icon: <Sun size={14} /> },
    { label: "暗色", value: "dark", icon: <Moon size={14} /> },
    { label: "跟随系统", value: "system", icon: <Monitor size={14} /> },
  ];

  const handleExport = useCallback(async () => {
    try {
      const csv = await exportHistoryCsv();
      const path = await save({
        filters: [{ name: "CSV", extensions: ["csv"] }],
        defaultPath: "翻译历史.csv",
      });
      if (path) {
        const bom = "\ufeff";
        await writeTextFile(path, bom + csv);
        showToast("历史记录已导出", "success");
      }
    } catch (e) {
      showToast("导出失败: " + e, "error");
    }
  }, [showToast]);

  const handleClearAll = useCallback(async () => {
    if (!confirm("确定清空所有缓存？\n\n这将清除：\n- 所有翻译历史记录\n- 应用本地设置（主题、快捷键等将恢复默认）")) {
      return;
    }
    try {
      await useHistoryStore.getState().clearAll();
      localStorage.removeItem("theme");
      localStorage.removeItem("shortcut");
      localStorage.removeItem("clipboardWatch");
      localStorage.removeItem("alwaysOnTop");
      store.setTheme("system");
      store.setShortcut("Alt+T");
      store.setClipboardWatch(false);
      store.setAlwaysOnTop(false);
      showToast("缓存已清空，设置已恢复默认", "success");
    } catch (e) {
      showToast("清除失败: " + e, "error");
    }
  }, [store, showToast]);

  const handleShortcutChange = (newShortcut: string) => {
    store.setShortcut(newShortcut);
  };

  return (
    <AnimatePresence>
      {store.isOpen && (
        <motion.div
          key="settings-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 z-40"
          onClick={() => store.close()}
        />
      )}
      {store.isOpen && (
        <motion.div
          key="settings-panel"
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
          className="absolute left-0 right-0 bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-xl z-50 max-h-[70%] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">设置</h3>
            <button onClick={() => store.close()} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={14} className="text-gray-400" />
            </button>
          </div>
          <div className="px-5 py-4 space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">百度翻译 API 配置</label>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-gray-400 dark:text-gray-500 block mb-1">用户ID (App ID)</label>
                  <input type="text" value={appid} onChange={(e) => setAppid(e.target.value)}
                    placeholder="请输入百度翻译 App ID"
                    className="w-full h-8 px-3 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 dark:text-gray-500 block mb-1">密钥 (Secret Key)</label>
                  <div className="relative">
                    <input type={showKey ? "text" : "password"} value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="请输入百度翻译密钥"
                      className="w-full h-8 px-3 pr-9 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="w-full h-8 flex items-center justify-center gap-1.5 text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors">
                  <Save size={14} /> {saving ? "保存中.." : saved ? "已保存" : "保存配置"}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">主题模式</label>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {themeOptions.map(opt => (
                  <button key={opt.value} onClick={() => store.setTheme(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-all ${store.theme === opt.value ? "bg-white shadow-sm text-gray-800 dark:bg-gray-600 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-200">剪贴板监听</span>
                <Switch checked={store.clipboardWatch} onChange={(v) => store.setClipboardWatch(v)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-200">全局快捷键</span>
                <ShortcutRecorder value={store.shortcut} onChange={handleShortcutChange} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleExport}
                className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200">
                <Download size={14} /> 导出历史 CSV
              </button>
              <button onClick={handleClearAll}
                className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <Trash2 size={14} /> 清除所有缓存
              </button>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-[11px] text-gray-400 dark:text-gray-500">随手翻译{appVersion ? ` v${appVersion}` : ""} · 基于百度翻译 API</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}