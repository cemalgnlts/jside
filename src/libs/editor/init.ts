import {
  ILogService,
  StandaloneServices,
  initialize as initializeServices
} from "vscode/services";

import getDialogsServiceOverride from "@codingame/monaco-vscode-dialogs-service-override";
import getStorageServiceOverrride from "@codingame/monaco-vscode-storage-service-override";
import getViewsServiceOverride, {
  Parts,
  attachPart
} from "@codingame/monaco-vscode-views-service-override";

import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";

import getConfigurationServiceOverride, {
  initUserConfiguration
} from "@codingame/monaco-vscode-configuration-service-override";
import {
  HTMLFileSystemProvider,
  registerFileSystemOverlay
} from "@codingame/monaco-vscode-files-service-override";
import getExtensionsServiceOverride from "@codingame/monaco-vscode-extensions-service-override";
import getStatusBarServiceOverride from "@codingame/monaco-vscode-view-status-bar-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";

import "@codingame/monaco-vscode-theme-defaults-default-extension";

// import workerConfig from "./extHostWorker.ts";

import userConfig from "./userConfiguration.json?raw";

type Panels = Array<{
  panel: Parts;
  element: HTMLDivElement;
}>;

window.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    console.log(label);
  }
};

import ExtensionHostWorker from "vscode/workers/extensionHost.worker?worker";
import { openNewCodeEditor } from "./openNewEditor";

export async function init() {
  await initUserConfiguration(userConfig);

  await initializeServices({
    ...getStorageServiceOverrride(),
    ...getConfigurationServiceOverride(),
    ...getViewsServiceOverride(openNewCodeEditor, undefined, (state) => ({
      ...state,
      editor: {
        ...state.editor,
        restoreEditors: true
      }
    })),
    ...getModelServiceOverride(),
    ...getDialogsServiceOverride(),
    ...getStatusBarServiceOverride(),
    ...getThemeServiceOverride(),
    ...getExtensionsServiceOverride(ExtensionHostWorker)
  });

  await initFS();

  // workspace.updateWorkspaceFolders(0, 0, {
  //   uri: Uri.file("Origin Private File System")
  // });
}

async function initFS() {
  const root = await navigator.storage.getDirectory();

  const opfsProvider = new HTMLFileSystemProvider(
    undefined,
    "Origin Private File System",
    StandaloneServices.get(ILogService)
  );
  opfsProvider.registerDirectoryHandle(root);

  registerFileSystemOverlay(1, opfsProvider);
}

export function attachPanels(panels: Panels) {
  for (const { panel, element } of panels) {
    attachPart(panel, element);
  }
}
