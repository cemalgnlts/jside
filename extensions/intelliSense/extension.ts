import { Uri, ExtensionContext } from "vscode";

import {
  activateFindFileReferences,
  activateReloadProjects,
  activateServerSys,
  activateAutoInsertion,
  activateTsConfigStatusItem
} from "@volar/vscode";

import * as lsp from "@volar/vscode/browser";

import { InitializationOptions } from "@volar/language-server/browser";

interface TypeScriptWebServerOptions extends InitializationOptions {
  typescript: {
    tsdkUrl: string;
  };
  versions?: Record<string, string>;
  globalModules?: string[];
}

let client: lsp.BaseLanguageClient | undefined;

export async function activate(context: ExtensionContext) {
  const serverMain = Uri.joinPath(context.extensionUri, "./server.js");
  const worker = new Worker(serverMain.toString());
  
  const configs = {
    versions: {},
    globalModules: []
  };
  
  const documentSelector: lsp.DocumentSelector = [
    "typescript",
    "typescriptreact",
    "javascript",
    "javascriptreact"
  ];

  const clientOptions: lsp.LanguageClientOptions = {
    documentSelector,
    initializationOptions: {
      typescript: {
        tsdkUrl: "/node_modules/typescript/lib"
      },
      versions: configs.versions,
      globalModules: configs.globalModules
    } satisfies TypeScriptWebServerOptions
  };

  client = new lsp.LanguageClient("ts-intellisense", "TypeScript IntelliSense", clientOptions, worker);
  await client.start();

  activateFindFileReferences("typescript-web.find-file-references", client);
  activateReloadProjects("typescript-web.reload-projects", client);
  activateServerSys(client);
  activateAutoInsertion(documentSelector, client);
  activateTsConfigStatusItem(documentSelector, "typescript-web.tsconfig", client);
}

export function deactivate() {
  return client?.stop();
}
