import { files as filesJS } from "./basic.js";

export const files = new Map(filesJS);

files.set(
  "esbuild.config.json",
  JSON.stringify(
    {
      entryPoints: ["./src/main.ts"],
      outdir: "dist",
      platform: "browser",
      target: "es2019",
      bundle: true,
      minify: true
    },
    null,
    2
  )
);

files.set("main.ts", 'console.log("JS works.");');

files.set("tsconfig.json", files.get("jsconfig.json"));

files.delete("main.js");
files.delete("tsconfig.json");