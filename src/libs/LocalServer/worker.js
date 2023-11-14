import * as esbuild from "esbuild-wasm";
import wasmURL from "esbuild-wasm/esbuild.wasm?url";
import FileSystem from "./FileSystem.js";

const VERSION = 1;

const fileSystem = new FileSystem();

let esbuildCtx = null;

self.onmessage = async function onMessage(ev) {
  const { type, data } = ev.data;

  switch (type) {
    case "init":
      await esbuild.initialize({
        wasmModule: await getWASMModule(),
        worker: false
      });

      // Warm up.
      await esbuild.transform("let a=1;").catch(() => {});

      esbuildCtx = await esbuild.context({
        entryPoints: ["/main.jsx"],
        outdir: "/dist",
        plugins: [fileSystemPlugin()],
        define: {
          "process.env.NODE_ENV": "'production'"
        },
        platform: "browser",
        target: "es2019",
        format: "esm",
        jsx: "automatic",
        bundle: true,
        minify: true
      });

      self.postMessage({ type: "ready" });
      break;
    case "build":
      let res = null;

      try {
        await esbuildCtx.cancel();
        res = await esbuildCtx.rebuild();
      } catch (err) {
        self.postMessage({ type: "error", data: err.toString() });
        return;
      }

      if (res.errors.length > 0) {
        self.postMessage({ type: "error", data: res.errors.join("\n") });
      }

      const modifiedFiles = [];
      const promises = res.outputFiles.map((res) => {
        modifiedFiles.push(res.path);
        return fileSystem.writeFile(res.path, res.contents);
      });

      try {
        await Promise.all(promises);
      } catch (err) {
        self.postMessage({ type: "error", data: err.toString() });
        return;
      }

      self.postMessage({ type: "modified", data: modifiedFiles });
      break;
  }
};

function fileSystemPlugin() {
  const resolveCDN = (args) => {
    return {
      namespace: "cdn",
      external: true,
      path: new URL(`${args.path}?bundle`, "https://esm.sh").href
    };
  };

  const resolveFilePath = (args) => {
    let { path, resolveDir } = args;

    if (path.startsWith("./")) {
      path = path.replace(
        "./",
        resolveDir === "/" ? resolveDir : `${resolveDir}/`
      );
    } else if (!path.startsWith("/")) {
      path = resolveDir === "/" ? (path = `/${path}`) : `${resolveDir}/${path}`;
    }

    return { path };
  };

  const loadFile = async (args) => {
    const blob = await fileSystem.readFile(args.path);
    const buffer = await blob.arrayBuffer();

    return {
      contents: new Uint8Array(buffer),
      loader: getLoader(args.path)
    };
  };

  return {
    name: "FileSystemPlugin",
    setup(build) {
      // CDN files.
      build.onResolve({ filter: /^@?[\w\-]+[\w/\-]*$/ }, resolveCDN);

      // Local files.
      build.onResolve({ filter: /.*/ }, resolveFilePath);
      build.onLoad({ filter: /.*/ }, loadFile);
    }
  };
}

function getLoader(path) {
  const ext = FileSystem.extname(path);

  switch (ext) {
    case "cjs":
    case "mjs":
      return "js";
    case "cts":
    case "mts":
      return "ts";
  }

  if (path.endsWith(".module.css")) return "local-css";

  return ext;
}

async function getWASMModule() {
  const cache = await caches.open(`v${VERSION}`);
  let res = await cache.match(wasmURL);

  if (!res) {
    res = await fetch(wasmURL);
    await cache.put(wasmURL, res.clone());
  }

  return WebAssembly.compileStreaming(res);
}
