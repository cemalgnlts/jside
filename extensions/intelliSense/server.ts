import { create as createTypeScriptServicePlugin } from "volar-service-typescript";
// import ts from "typescript";
import {
  LanguagePlugin,
  createConnection,
  createServer,
  createTypeScriptProjectProviderFactory,
  loadTsdkByUrl
} from "@volar/language-server/browser";

import { InitializationOptions } from "@volar/language-server/browser";

interface TypeScriptWebServerOptions extends InitializationOptions {
  typescript: {
    tsdkUrl: string;
  };
  versions?: Record<string, string>;
  globalModules?: string[];
}

const connection = createConnection();
const server = createServer(connection);
connection.listen();

connection.onInitialize(async (params) => {
  const initOptions: TypeScriptWebServerOptions = params.initializationOptions;
  const tsdk = await loadTsdkByUrl(initOptions.typescript.tsdkUrl, "en");

  return server.initialize(params, createTypeScriptProjectProviderFactory(tsdk.typescript, tsdk.diagnosticMessages), {
    watchFileExtensions: ["js", "cjs", "mjs", "ts", "cts", "mts", "jsx", "tsx", "json"],
    getServicePlugins: () => [createTypeScriptServicePlugin(tsdk.typescript)],
    getLanguagePlugins() {
      if (!initOptions.globalModules) return [];

      const globalEnvLanguagePlugin: LanguagePlugin = {
        createVirtualCode: () => undefined,
        updateVirtualCode: (_, virtualCode) => virtualCode,
        typescript: {
          extraFileExtensions: [],
          getScript: () => undefined,
          resolveLanguageServiceHost(host) {
            const text = (initOptions.globalModules ?? [])
              .map((name: string) => `/// <reference types="${name}" />`)
              .join("\n");
              
            const snapshot = tsdk.typescript.ScriptSnapshot.fromString(text);

            console.log(host);
            
            return {
              ...host,
              getScriptFileNames: () => [...host.getScriptFileNames(), "/global.d.ts"],
              getScriptSnapshot: (fileName) =>
                fileName === "/global.d.ts" ? snapshot : host.getScriptSnapshot(fileName)
            };
          }
        }
      };

      return [globalEnvLanguagePlugin];
    }
  });
});

connection.onInitialized(server.initialized);
connection.onShutdown(server.shutdown);
