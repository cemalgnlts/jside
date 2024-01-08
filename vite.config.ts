import fs from "node:fs";
import url from "node:url";
import zlib from "node:zlib";
import { pipeline } from "node:stream";
import { promisify } from "node:util";

import { defineConfig, transformWithEsbuild } from "vite";
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
		minify: false,
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
				// const workerFile = isBuildMode ? id : id.replace(/index.ts$/, "worker.ts");

				const {
					outputFiles: [file]
				} = await build({
					entryPoints: [workerFile],
					plugins: [Provider],
					platform: "node",
					format: "cjs",
					external: ["vscode"],
					bundle: true,
					// minify: true,
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
			// await removeSomeFiles();

			setupPWA();

			await extraMinify(minifiedFiles);

			compressAssets();
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

	assets = assets.map((path) => path.slice("./dist".length));

	const rootFileIndex = assets.findIndex((name) => name === "/index.html");
	assets[rootFileIndex] = "/";

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
			const {
				outputFiles: [file]
			} = await build({
				entryPoints: [filePath],
				write: false,
				minify: true
			});

			content = file.text;
		} else if (filePath.endsWith(".json")) {
			content = JSON.stringify(JSONC.parse(content));
		}

		fs.writeFileSync(filePath, content, "utf-8");
	}

	console.log("Assets minimized.");
}

function compressAssets() {
	const assets = fastGlob.sync("./dist/**");

	// const perItem = Math.floor(assets.length / 20);

	// let grouped = Array.from({ length: assets.length / perItem }, () => assets.splice(0, perItem));

	// const compressStream = zlib.createBrotliCompress({
	// 	params: {
	// 		[zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
	// 		[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
	// 	}
	// });

	// const pipe = promisify(pipeline);

	// const promises = assets.map((filePath) =>
	// 	pipe(fs.createReadStream(filePath), compressStream, fs.createWriteStream(filePath))
	// );

	// await Promise.all(promises);

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
