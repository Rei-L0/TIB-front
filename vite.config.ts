import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { i18nReplace } from "./plugins/vite-plugin-i18n-replace";

export default defineConfig({
  plugins: [react(), i18nReplace(process.env.VITE_I18N_LANG || "ko")],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.VITE_I18N_LANG": JSON.stringify(
      process.env.VITE_I18N_LANG || "ko"
    ),
  },
});
