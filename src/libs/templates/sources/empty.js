export const files = new Map();

files.set(
  "esbuild.config.json",
  JSON.stringify(
    {
      entryPoints: ["./src/main.js"],
      platform: "browser",
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
        allowImportingTsExtensions: true,
        allowArbitraryExtensions: true,
        verbatimModuleSyntax: true,
        noUnusedParameters: true,
        esModuleInterop: true,
        noUnusedLocals: true,
        skipLibCheck: true,
        noEmit: true,
        strict: true,
      },
      include: ["src"],
      exclude: ["node_modules"]
    },
    null,
    2
  )
);

files.set(
  "src/index.html",
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="main.js"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>`
);

files.set("src/main.js", `console.log("Hello World");`);

files.set("REAMDE.md", "# My Project");
