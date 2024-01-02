import fs from "node:fs";
import url from "node:url";
import zlib from "node:zlib";

import { defineConfig } from "vite";
import type { PluginOption } from "vite";

import { buildSync } from "esbuild";
import fastGlob from "fast-glob";

import { minify } from "terser";

import JSONC from "jsonc-simple-parser";

import pkg from "./package.json" assert { type: "json" };

const mvaDeps = Object.keys(pkg.dependencies).filter((name) => name.startsWith("@codingame"));

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [extensionWorkerTranformer(), MinifyCompressPWA()],
	build: {
		target: "es2020",
		minify: false,
		sourcemap: false,
		reportCompressedSize: false,
		assetsInlineLimit: 1024,
		modulePreload: {
			resolveDependencies: () => []
		},
		rollupOptions: {
			output: {
				manualChunks: {
					monaco: ["monaco-editor"],
					vscode: [...mvaDeps]
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
			plugins: [importMetaResolver()]
		}
	},
	resolve: {
		dedupe: ["monaco-editor", "vscode", ...mvaDeps]
	}
});

function importMetaResolver() {
	return {
		name: "import.meta.url",
		setup({ onLoad }) {
			// Help vite that bundles/move files in dev mode without touching `import.meta.url` which breaks asset urls
			onLoad({ filter: /.*\.js/, namespace: "file" }, async (args: { path: string }) => {
				const code = fs.readFileSync(args.path, "utf8");

				const assetImportMetaUrlRE =
					/\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g;
				let i = 0;
				let newCode = "";
				for (let match = assetImportMetaUrlRE.exec(code); match != null; match = assetImportMetaUrlRE.exec(code)) {
					newCode += code.slice(i, match.index);

					const path = match[1].slice(1, -1);
					const resolved = import.meta.resolve!(path, url.pathToFileURL(args.path));

					newCode += `new URL(${JSON.stringify(url.fileURLToPath(resolved))}, import.meta.url)`;

					i = assetImportMetaUrlRE.lastIndex;
				}
				newCode += code.slice(i);

				return { contents: newCode };
			});
		}
	};
}

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

function MinifyCompressPWA(): PluginOption {
	const minifiedFiles = [];

	return {
		name: "MinifyCompressPWA",
		enforce: "post",
		apply: "build",
		async renderChunk(code, chunk) {
			const res = await minify(code, {
				ecma: 2020,
				format: {
					comments: false
				}
			});

			minifiedFiles.push(chunk.fileName);

			return { code: res.code };
		},
		async closeBundle() {
			await removeSomeFiles();

			setupPWA();

			await extraMinify(minifiedFiles);

			compressAssets();
		}
	};
}

async function removeSomeFiles() {
	const files = fastGlob.sync("./dist/**/lib.es{2,5,6}*");
	const promises = files.map((file) => fs.promises.rm(file));

	await Promise.all(promises);
}

function setupPWA() {
	let assets: string[] = fastGlob.sync("./dist/**", {
		ignore: ["./dist/sw.js", "./dist/**/*.map"]
	});

	assets = assets.map((path) => path.slice("./dist".length));

	const contents = fs.readFileSync("./dist/sw.js", "utf-8").split("\n");
	contents[0] = `const VERSION = "${pkg.version}";`;
	contents[1] = `const files = ${JSON.stringify(assets)};`;

	fs.writeFileSync("./dist/sw.js", contents.join("\n"), "utf-8");

	console.log("PWA builded.");
}

async function extraMinify(minifiedFiles: string[]) {
	const exclude = minifiedFiles.map((file) => file.replace(/assets\/([^-]+).*.js/, "**/$1*.js"));
	let assets = fastGlob.sync("./dist/**", {
		ignore: exclude
	});

	assets = assets.filter((file) => /\.(css|js|json)$/.test(file));

	for (const filePath of assets) {
		let content = fs.readFileSync(filePath, "utf-8");

		if (filePath.endsWith(".js")) {
			const { code } = await minify(content, {
				ecma: 2020,
				format: {
					comments: false
				}
			});

			content = code;
		} else if (filePath.endsWith(".css")) {
			content = buildSync({
				entryPoints: [filePath],
				write: false,
				minify: true
			}).outputFiles[0].text;
		} else if (filePath.endsWith(".json")) {
			content = JSON.stringify(JSONC.parse(content));
		}

		fs.writeFileSync(filePath, content, "utf-8");
	}

	console.log("Assets minimized.");
}

function compressAssets() {
	const assets = fastGlob.sync("./dist/**");

	for (const filePath of assets) {
		const contents = fs.readFileSync(filePath);
		const compressed = zlib.brotliCompressSync(contents, {
			params: {
				[zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
				[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
			}
		});

		fs.writeFileSync(filePath, compressed);
	}

	console.log("Assets Compressed.");
}
