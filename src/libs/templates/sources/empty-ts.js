import { files as filesJS } from "./empty.js";

export const files = new Map(filesJS);

files.set(
  "esbuild.config.json",
  JSON.stringify(
    {
      entryPoints: ["./src/main.ts"],
      platform: "browser",
      target: "es2019",
      bundle: true,
      minify: true
    },
    null,
    2
  )
);

files.set("tsconfig.json", files.get("jsconfig.json"));
files.set("src/main.ts", `console.log("Hello World");`);

files.delete("src/main.js");
files.delete("jsconfig.json");
