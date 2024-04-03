import { buildSync } from "esbuild";

const build = (name, format = "cjs") => {
  buildSync({
    entryPoints: [`./extensions/intelliSense/${name}`],
    outdir: "./src/extensions/intelliSense",
    external: ["vscode"],
    bundle: true,
    minify: true,
    format
  });
};

build("extension.ts");
build("server.ts", "iife");

console.log("Extension building completed.");