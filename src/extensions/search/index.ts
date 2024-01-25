import { editor } from "monaco-editor";
import { ExtensionHostKind, registerExtension } from "vscode/extensions";

import type { ProviderResult, Uri } from "vscode";

const manifest = {
  name: "search-provider",
  publisher: __APP_NAME,
  version: __APP_VERSION,
  engines: {
    vscode: "*"
  },
  enabledApiProposals: ["fileSearchProvider"]
};

const { getApi } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

async function activate() {
  const { workspace } = await getApi();

  workspace.registerFileSearchProvider("file", {
    provideFileSearchResults: function (): ProviderResult<Uri[]> {
      return editor
        .getModels()
        .map((model) => model.uri)
        .filter((uri) => uri.scheme === "file");
    }
  });
}

export default activate;
