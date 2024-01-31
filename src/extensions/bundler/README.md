Fast Refresh only works for **./index.ts** and **./worker.ts**.

**./worker.ts** is compiled with esbuild during the build process. This is because **worker.ts** needs iife & cjs formats to work.
https://code.visualstudio.com/api/extension-guides/web-extensions#web-extension-main-file