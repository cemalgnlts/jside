import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import {  fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@components": fileURLToPath(new URL("./src/components", import.meta.url))
    }
  },
  plugins: [react()]
});
