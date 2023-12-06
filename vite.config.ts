import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import fs from "node:fs";
import url from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "vscode/extensions",
      "vscode/services",
      "vscode/monaco",
      "vscode/localExtensionHost",
      "monaco-editor/esm/vs/nls.js",
      "monaco-editor/esm/vs/editor/editor.worker.js"
    ],
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
