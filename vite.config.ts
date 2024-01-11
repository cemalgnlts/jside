// @ts-expect-error node type
import fs from "node:fs";
// @ts-expect-error node type
import url from "node:url";
// @ts-expect-error node type
import zlib from "node:zlib";
// @ts-expect-error node type
import { Worker } from "node:worker_threads";
// @ts-expect-error node type
import os from "node:os";

declare const require: (packageName: string) => any;
declare const $require: typeof require;

import { defineConfig } from "vite";
import type { PluginOption } from "vite";

import { build } from "esbuild";
import type { Plugin } from "esbuild";
import fastGlob from "fast-glob";

import { minify } from "terser";

import JSONC from "jsonc-simple-parser";

import pkg from "./package.json" assert { type: "json" };

const mvaDeps = Object.keys(pkg.dependencies).filter((name) => name.startsWith("@codingame"));

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [extensionWorkerTranformer(), MinifyCompressPWA()],
	define: {
		__APP_NAME: "'JSIDE'",
		__APP_VERSION: JSON.stringify(pkg.version),
		__APP_DATE: JSON.stringify(new Date().toLocaleDateString())
	},
	build: {
		target: "es2020",
		minify: "esbuild",
		reportCompressedSize: false,
		cssCodeSplit: false,
		assetsInlineLimit: 2048,
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
					// @ts-expect-error ESNext feature
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

// VSCode worker extension file must be in CJS format and bundle must be enabled.
// I left it that way because I couldn't find a better way.
function extensionWorkerTranformer(): PluginOption {
	let isBuildMode = false;
	let wasmAbsolutePath = "";
	let wasmOutputPath = "";
	let tempWorkerFile = "";

	const Provider: Plugin = {
		name: "VSCodeExtensionProvier",
		setup(build) {
			build.onLoad({ filter: /\.wasm$/ }, (args) => {
				// @ts-expect-error process is node global namespace
				const path = args.path.replace(process.cwd(), "");
				wasmAbsolutePath = args.path;
				wasmOutputPath = path;

				if (isBuildMode) {
					const file = path.split("/").pop();
					wasmOutputPath = `/assets/${file}`;
				}

				return {
					contents: `export default "${wasmOutputPath}";`
				};
			});
		}
	};

	return {
		name: "ExtensionWorker",
		enforce: "pre",
		apply(_, env) {
			if (env.command === "build") isBuildMode = true;

			return true;
		},
		async transform(code, id) {
			const fileRe = isBuildMode ? /extensions\/esbuild\/index.ts$/ : /extensions\/esbuild\/worker.ts$/;

			if (fileRe.test(id)) {
				const workerFile = isBuildMode ? id.replace(/index.ts$/, "worker.ts") : id;

				const {
					outputFiles: [file]
				} = await build({
					entryPoints: [workerFile],
					plugins: [Provider],
					platform: "node",
					format: "cjs",
					external: ["vscode"],
					bundle: true,
					minify: true,
					write: false
				});

				if (isBuildMode) {
					code = code.replace(
						'new URL("./worker.ts", import.meta.url).toString()',
						'new URL("./worker.js", import.meta.url).toString()'
					);

					tempWorkerFile = workerFile.replace(".ts", ".js");

					fs.writeFileSync(tempWorkerFile, file.text);
				}

				return { code: isBuildMode ? code : file.text, map: null, moduleSideEffects: true };
			}
		},
		closeBundle() {
			if (!isBuildMode || wasmAbsolutePath.length === 0) return;

			fs.cpSync(wasmAbsolutePath, `dist${wasmOutputPath}`);
			fs.rmSync(tempWorkerFile);
		}
	};
}

function MinifyCompressPWA(): PluginOption {
	// const minifiedFiles = [];

	return {
		name: "MinifyCompressPWA",
		enforce: "post",
		apply: "build",
		// async renderChunk(code, chunk) {
		// 	const res = await minify(code, {
		// 		ecma: 2020,
		// 		format: {
		// 			comments: false
		// 		}
		// 	});

		// 	minifiedFiles.push(chunk.fileName);

		// 	return { code: res.code };
		// },
		async closeBundle() {
			// await removeSomeFiles();

			setupPWA();

			// const exclude = minifiedFiles.map((file) => file.replace(/assets\/([^-]+).*.js/, "**/$1*.js"));
			// let assets = fastGlob.sync("./dist/**", { ignore: exclude });
			// assets = assets.filter((file) => /\.(css|js|json)$/.test(file));

			// const thread = new Thread(extraMinify);
			// await Promise.all(assets.map((filePath) => thread.run(filePath)));

			// console.log("Assets minimized.");

			await compressAssets();
		}
	};
}

// async function removeSomeFiles() {
// 	const files = fastGlob.sync("./dist/**/lib.es{2,5,6}*");
// 	const promises = files.map((file) => fs.promises.rm(file));
// 	await Promise.all(promises);
// }

async function setupPWA() {
	let assets: string[] = fastGlob.sync("./dist/**", {
		ignore: ["./dist/sw.js", "./dist/*.png", "./dist/**/*.map"]
	});

	// convert: ./dist/sw.js -> /sw.js
	assets = assets.map((path) => path.slice("./dist".length));

	const rootFileIndex = assets.findIndex((name) => name === "/index.html");
	assets[rootFileIndex] = "/";

	const contents = fs.readFileSync("./dist/sw.js", "utf-8").split("\n");
	contents[0] = `const VERSION = "${pkg.version}";`;
	contents[1] = `const files = ${JSON.stringify(assets)};`;

	fs.writeFileSync("./dist/sw.js", contents.join("\n"), "utf-8");

	console.log("PWA builded.");
}

// async function extraMinify(filePath: string) {
// 	const fs = $require("fs");
// 	const { minify } = $require("terser");
// 	const { build } = $require("esbuild");
// 	const { default: JSONC } = await import("jsonc-simple-parser");

// 	let content = fs.readFileSync(filePath, "utf-8");

// 	if (filePath.endsWith(".js")) {
// 		const { code } = await minify(content, {
// 			ecma: 2020,
// 			format: {
// 				comments: false
// 			}
// 		});

// 		content = code;
// 	} else if (filePath.endsWith(".css")) {
// 		const {
// 			outputFiles: [file]
// 		} = await build({
// 			entryPoints: [filePath],
// 			write: false,
// 			minify: true
// 		});

// 		content = file.text;
// 	} else if (filePath.endsWith(".json")) {
// 		content = JSON.stringify(JSONC.parse(content));
// 	}

// 	fs.writeFileSync(filePath, content, "utf-8");
// }

async function compressAssets() {
	const assets: string[] = fastGlob.sync("./dist/assets/*");

	const threads = new Thread((filePath) => {
		const fs = $require("node:fs");
		const zlib = $require("node:zlib");

		const contents = fs.readFileSync(filePath);

		const compressed = zlib.brotliCompressSync(contents, {
			params: {
				[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
				[zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT
			}
		});

		fs.writeFileSync(filePath, compressed);
	});

	await Promise.all(assets.map((filePath) => threads.run(filePath)));

	console.log("Assets Compressed.");
}

class Thread<Args extends any[]> {
	threads = new Set<Worker>();
	queue: Array<() => void> = [];
	maxThreadCount = (os?.availableParallelism() ?? os.cpus()) - 1;
	code: string;

	constructor(fun: (...args: Args) => any) {
		this.code = this.buildWorkerCode(fun.toString());
	}

	async run(...args: Args): Promise<any> {
		const worker = await this.getWorker();

		return new Promise((resolve, reject) => {
			worker.resolveMessage = resolve;
			worker.rejectMessage = reject;
			worker.postMessage(args);
		});
	}

	async getWorker() {
		if (this.threads.size <= this.maxThreadCount) {
			const worker = new Worker(this.code, { eval: true });

			worker.on("message", (ev) => {
				worker.resolveMessage(ev);
				worker.unref();
				this.threads.delete(worker);

				if (this.queue.length > 0) {
					const resolve = this.queue.shift();
					resolve();
				}
			});

			worker.on("error", (err) => {
				worker.rejectMessage();
				console.error(err);
			});

			this.threads.add(worker);

			return worker;
		}

		return new Promise<void>((resolve, reject) => {
			this.queue.push(resolve);
		}).then(() => this.getWorker());
	}

	buildWorkerCode(fn: string) {
		return `const { parentPort } = require("worker_threads");
		const $require = require;
		const fun = ${fn};

		parentPort.on("message", async args => {
			const res = await fun(...args);
			parentPort.postMessage(res);
		});`;
	}
}
