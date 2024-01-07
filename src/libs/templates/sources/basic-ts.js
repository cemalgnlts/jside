import { files as filesJS } from "./basic.js";

export const files = new Map(filesJS);
files.delete("main.js");

files.set("esbuild.config.json", `{
	"entryPoints": [
		"./src/main.ts"
	],
	"outdir": "dist",
	"platform": "browser",
	"target": "es2019",
	"bundle": true,
	"minify": true
}`);

files.set("main.ts", 'console.log("JS works.");');