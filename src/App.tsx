import { useEffect } from "react";
import { setAlwaysOnTop } from "./lib/invoke";
import { useTheme } from "./hooks/useTheme";
import { useSettingsStore } from "./store/settingsStore";
import { useToastStore } from "./store/toastStore";
import { MainLayout } from "./components/layout/MainLayout";
import { TitleBar } from "./components/layout/TitleBar";
import { Toast } from "./components/common/Toast";

export default function App() {
  useTheme();
  const { alwaysOnTop } = useSettingsStore();
  const { message, type, visible, hide } = useToastStore();

  useEffect(() => {
    setAlwaysOnTop(alwaysOnTop).catch(() => {});
  }, [alwaysOnTop]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <TitleBar />
      <MainLayout />
      {visible && message && (
        <Toast
          message={message}
          type={type}
          onDismiss={hide}
        />
      )}
    </div>
  );
}