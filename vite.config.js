import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";

const manifest = {
  name: "JSIDE",
  id: "/",
  start_url: "/",
  display: "fullscreen",
  description:
    "A PWA-powered IDE for the entire JS ecosystem that works completely offline.",
  theme_color: "#100f0f",
  background_color: "#100f0f",
  icons: [
    {
      sizes: "512x512",
      type: "image/png",
      src: "/icon-512.png"
    },
    {
      sizes: "192x192",
      type: "image/png",
      src: "/icon-192.png"
    },
    {
      sizes: "512x512",
      type: "image/png",
      src: "/icon-512-maskable.png",
      purpose: "maskable"
    },
    {
      sizes: "192x192",
      type: "image/png",
      src: "/icon-192-maskable.png",
      purpose: "maskable"
    }
  ]
};

const pwa = VitePWA({
  injectRegister: "inline",
  registerType: "autoUpdate",
  workbox: {
    globPatterns: ["**/*"],
    includeAssets: ["**/*"]
  },
  manifest
});

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@components": fileURLToPath(new URL("./src/components", import.meta.url))
    }
  },
  plugins: [pwa, react()]
});
