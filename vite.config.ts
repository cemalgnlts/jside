import { PluginOption, defineConfig } from "vite";

import fs from "node:fs";
import url from "node:url";
import { buildSync } from "esbuild";

import { ManifestOptions, VitePWA } from "vite-plugin-pwa";

// import { minify as htmlMinifier } from "html-minifier-terser";
// import { minify as terserMinifier } from "terser";

import pkg from "./package.json" assert { type: "json" };

const mvaDeps = Object.keys(pkg.dependencies).filter((name) => name.startsWith("@codingame"));
// Cut the biggest packages into chunks.
const mvaChunks = {
	"monaco-vscode-configuration-service-override": ["@codingame/monaco-vscode-configuration-service-override"],
	"monaco-vscode-view-title-bar-service-override": ["@codingame/monaco-vscode-view-title-bar-service-override"],
	"monaco-vscode-markers-service-override": ["@codingame/monaco-vscode-markers-service-override"],
	"monaco-vscode-view-status-bar-service-override": ["@codingame/monaco-vscode-view-status-bar-service-override"],
	"monaco-vscode-theme-service-override": ["@codingame/monaco-vscode-theme-service-override"],
	"monaco-vscode-textmate-service-override": ["@codingame/monaco-vscode-textmate-service-override"],
	"monaco-vscode-accessibility-service-override": ["@codingame/monaco-vscode-accessibility-service-override"]
};

const manifest: Partial<ManifestOptions> = {
	name: "JSIDE",
	id: "/",
	start_url: "/",
	display: "fullscreen",
	display_override: ["window-controls-overlay"],
	description: "A PWA-powered IDE for the entire JS ecosystem that works completely offline.",
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
	// includeAssets: ["**/*"],
	workbox: {
		globPatterns: ["**/*"],
		globIgnores: ["**/*.map"],
		maximumFileSizeToCacheInBytes: 15728640 // 15 MB
	},
	minify: true,

	manifest
});

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [extensionWorkerTranformer(), pwa],
	build: {
		target: "es2020",
		sourcemap: false,
		chunkSizeWarningLimit: 1500,
		assetsInlineLimit: 1024,
		modulePreload: {
			resolveDependencies: () => []
		},
		rollupOptions: {
			output: {
				manualChunks: {
					"monaco-editor": ["monaco-editor"],
					...mvaChunks
				}
			}
		}
	},
	server: {
		headers: {
			"Cross-Origin-Embedder-Policy": "credentialless",
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Resource-Policy": "cross-origin"
		}
	},
	optimizeDeps: {
		include: ["vscode-semver", ...mvaDeps],
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
		dedupe: ["monaco-editor", "vscode", ...mvaDeps]
	}
});

function extensionWorkerTranformer(): PluginOption {
	return {
		name: "ExtensionWorker",
		enforce: "post",
		apply: () => true,
		transform(code, id) {
			if (/extensions\/[\w]+\/worker.ts$/.test(id)) {
				const {
					outputFiles: [file]
				} = buildSync({
					stdin: { contents: code },
					write: false,
					platform: "node",
					format: "cjs",
					external: ["vscode"],
					bundle: true,
					minify: true
				});

				return { code: file.text };
			}
		}
	};
}

// function AssetsMinifier() {
//   return {
//     name: "JSON minify",
//     async closeBundle() {
//       let files = await fs.promises.readdir(path.resolve("dist", "assets"));
//       files = files.filter(file => /\.(html|css|js)$/.test(file));

//       for (const file of files) {
//         const filePath = path.resolve("dist", "assets", file);

//         let content = await fs.promises.readFile(filePath, "utf-8");

//         if (/\.(js)$/.test(file)) {
//           const { code } = await terserMinifier(content, {
//             ecma: "2019",
//             keep_classnames: true,
//             keep_fnames: true,
//             compress: false,
//             mangle: false
//           });

//           content = code;
//         } else {
//           content = await htmlMinifier(content, {
//             collapseBooleanAttributes: true,
//             collapseWhitespace: true,
//             minifyCSS: true,
//             minifyJS: true,
//             removeComments: true,
//             removeEmptyAttributes: true,
//             removeRedundantAttributes: true,
//             removeScriptTypeAttributes: true,
//             removeStyleLinkTypeAttributes: true,
//             trimCustomFragments: true,
//             useShortDoctype: true
//           });
//         }

//         await fs.promises.writeFile(filePath, content, "utf-8");
//       }
//     }
//   }
// }
