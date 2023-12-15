import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import fs from "node:fs";
import url from "node:url";

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
  includeAssets: ["**/*"],
  workbox: {
    globPatterns: ["**/*"]
  },
  // @ts-ignore
  manifest
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pwa],
  build: {
    target: "es2019",
    sourcemap: false
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin"
    }
  },
  optimizeDeps: {
    include: ["vscode-semver"],
    esbuildOptions: {
      plugins: [
        {
          name: "import.meta.url",
          setup({ onLoad }) {
            // Help vite that bundles/move files in dev mode without touching `import.meta.url` which breaks asset urls
            onLoad({ filter: /.*\.js/, namespace: "file" }, async (args) => {
              const code = fs.readFileSync(args.path, "utf8");

              const assetImportMetaUrlRE =
                /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g;
              let i = 0;
              let newCode = "";
              for (
                let match = assetImportMetaUrlRE.exec(code);
                match != null;
                match = assetImportMetaUrlRE.exec(code)
              ) {
                newCode += code.slice(i, match.index);

                const path = match[1].slice(1, -1);
                const resolved = await import.meta.resolve!(path, url.pathToFileURL(args.path));

                newCode += `new URL(${JSON.stringify(url.fileURLToPath(resolved))}, import.meta.url)`;

                i = assetImportMetaUrlRE.lastIndex;
              }
              newCode += code.slice(i);

              return { contents: newCode };
            });
          }
        }
      ]
    }
  },
  resolve: {
    dedupe: ["monaco-editor", "vscode"]
  }
});
