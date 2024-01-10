export const files = new Map();

files.set("esbuild.config.json", `{
	"entryPoints": [
		"./main.js"
	],
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

files.set("index.html", `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="base.css">
    <script src="main.js" defer></script>
    <title>Basic</title>
  </head>
  <body>
    <h1>Hello</h1>
  </body>
</html>`);

files.set("main.js", 'console.log("JS works.");');
files.set("base.css", `* {
  box-sizing: border-box;
}

:root {
  --color-bg: #FFFCF0;
  --color-fg: #100F0F;
}

html, body {
  height: 100%;
}

body {
  margin: 0;
  font-family: Roboto, sans-serif;
  background-color: var(--color-bg);
  color: var(--color-fg);
}`);

files.set("README.md", `# Hello`);