export const files = new Map();

files.set("esbuild.config.json", `{
	"entryPoints": [
		"./src/main.js"
	],
	"platform": "browser",
	"target": "es2019",
	"bundle": true,
	"minify": true
}`);

files.set("jsconfig.json", `{
	"compilerOptions": {
		"lib": ["ES2020", "DOM"],
		"target": "ESNext",
		"skipLibCheck": true,
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true
	}
}`);

files.set("src/main.js", `console.log("Hello World");`);

files.set("REAMDE.md", "#My Project");