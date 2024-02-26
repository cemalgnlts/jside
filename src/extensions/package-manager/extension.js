/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const vscode = require("vscode");

/**
 *
 * @param {import("vscode").ExtensionContext} context VSCode api
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("packageManager.startTypeTest", async () => {
      await ensureTsApi();
    })
  );
}

async function ensureTsApi() {
  const tsExtension = vscode.extensions.getExtension("vscode.typescript-language-features", true);

  if (!tsExtension) {
    throw new Error("vscode.typescript-language-features not found");
  }

  await tsExtension.activate();

  const tsApi = tsExtension.exports.getAPI(0);

  if (!tsApi) {
    throw new Error("vscode.typescript-language-features api not found");
  }

  tsApi.configurePlugin("ts-pm-plugin", {});

  globalThis.tsApi = tsApi;

  console.log("ensureTsApi");
}

// eslint-disable-next-line no-undef
module.exports = {
  activate,
  __esModule: true
};
