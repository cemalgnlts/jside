export const files = new Map();

files.set(
  "esbuild.config.json",
  JSON.stringify(
    {
      entryPoints: ["./src/main.js"],
      target: "es2019",
      bundle: true
    },
    null,
    2
  )
);

files.set(
  "jsconfig.json",
  JSON.stringify(
    {
      compilerOptions: {
        lib: ["ES2020", "DOM"],
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "Bundler",
        esModuleInterop: true,
        noEmit: true,
        skipLibCheck: true,
        allowImportingTsExtensions: true,
        allowArbitraryExtensions: true,
        verbatimModuleSyntax: true,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true
      },
      include: ["src"],
      exclude: ["node_modules"]
    },
    null,
    2
  )
);

files.set(
  "index.html",
  `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Document</title>
		<script src="main.js" defer></script>
    <link rel="stylesheet" href="base.css">
	</head>
	<body>
		<h1>Hello World!</h1>
	</body>
</html>`
);

files.set("src/main.js", 'console.log("JS works.");');
files.set(
  "srcbase.css",
  `* {
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
}`
);

files.set("README.md", `# My Project`);
