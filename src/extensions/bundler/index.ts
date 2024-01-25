import { ExtensionHostKind, IExtensionManifest, registerExtension } from "vscode/extensions";

const manifest: IExtensionManifest = {
  name: "bundler",
  displayName: "Bundler",
  publisher: __APP_NAME,
  version: "1.0.0",
  browser: "/worker.js",
  engines: {
    vscode: "*"
  },
  contributes: {
    commands: [
      {
        command: "bundler.init",
        title: "Init Bundler"
      },
      {
        command: "bundler.startLivePreview",
        title: "Bundler: Start Live Preview"
      },
      {
        command: "bundler.stopLivePreview",
        title: "Bundler: Stop Live Preview"
      },
      {
        command: "bundler.openWebPage",
        title: "Bundler: Open Preview Web Page"
      },
      {
        command: "bundler.showLogs",
        title: "Bundler: Show Logs"
      }
    ],
    menus: {
      commandPalette: [
        {
          command: "bundler.init",
          when: "false"
        }
      ]
    },
    jsonValidation: [
      {
        fileMatch: "esbuild.config.json",
        url: "./esbuildConfigSchema.json"
      }
    ]
  },
  activationEvents: [
    // "workspaceContains:esbuild.config.json",
    "command:bundler.init"
  ]
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalWebWorker);

registerFileUrl("/worker.js", new URL("./worker.ts", import.meta.url).toString());
registerFileUrl("./esbuildConfigSchema.json", new URL("./esbuildConfigSchema.json", import.meta.url).toString());
