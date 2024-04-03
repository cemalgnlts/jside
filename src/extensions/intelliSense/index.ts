import { ExtensionHostKind, IExtensionManifest, registerExtension } from "vscode/extensions";

const manifest: IExtensionManifest = {
  name: "intelliSense",
  publisher: __APP_NAME,
  version: __APP_VERSION,
  browser: "./extension.js",
  engines: {
    vscode: "*"
  },
  activationEvents: [
    "onLanguage:javascript",
    "onLanguage:typescript",
    "onLanguage:javascriptreact",
    "onLanguage:typescriptreact"
  ]
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalWebWorker);

registerFileUrl("extension.js", new URL("./extension.js", import.meta.url).href);
registerFileUrl("server.js", new URL("./server.js", import.meta.url).href);