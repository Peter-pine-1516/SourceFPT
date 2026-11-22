import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const buildVersion = Date.now().toString(36);

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_DATA_VERSION__: JSON.stringify(buildVersion),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
