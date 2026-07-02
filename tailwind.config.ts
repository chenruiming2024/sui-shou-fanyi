import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#3B82F6", dark: "#60A5FA", hover: "#2563EB", "hover-dark": "#3B82F6" } },
      borderRadius: { window: "12px" },
    },
  },
  plugins: [],
};
export default config;