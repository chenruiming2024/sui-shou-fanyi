import { useEffect } from "react";
import { useSettingsStore } from "../store/settingsStore";

export function useTheme() {
  const { theme } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => { dark ? root.classList.add("dark") : root.classList.remove("dark"); };

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    apply(theme === "dark");
  }, [theme]);
}