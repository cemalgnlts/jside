import { ExtensionHostKind, registerExtension } from "vscode/extensions";

import type { IExtensionManifest } from "vscode/extensions";

const manifest: IExtensionManifest = {
  name: "tools",
  publisher: __APP_NAME,
  version: __APP_VERSION,
  engines: {
    vscode: "*"
  }
};

const { setAsDefaultApi } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

async function activate() {
  await setAsDefaultApi();
}

export default activate;
