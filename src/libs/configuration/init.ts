import {
  ILogService,
  IThemeService,
  StandaloneServices,
  getService,
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
import getNotificationsServiceOverride from "@codingame/monaco-vscode-notifications-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";

import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-javascript-default-extension";
import "@codingame/monaco-vscode-theme-seti-default-extension";

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";

import userConfig from "./userConfiguration.json?raw";

import { openNewCodeEditor } from "./openNewEditor";
import { Uri, workspace } from "vscode";

// import "vscode/localExtensionHost";

type Panels = Array<{
  panel: Parts;
  element: HTMLDivElement;
}>;

window.MonacoEnvironment = {
  getWorker: (moduleId, label) => {
    if (label === "editorWorkerService") return new EditorWorker();

    throw Error(`Unimplemented worker ${label} (${moduleId})`);
  }
};

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
    ...getLanguagesServiceOverride(),
    ...getNotificationsServiceOverride(),
    ...getDialogsServiceOverride(),
    ...getStatusBarServiceOverride(),
    ...getThemeServiceOverride(),
    ...getExtensionsServiceOverride()
  });

  await initFS();
}

async function initFS() {
  const root = await navigator.storage.getDirectory();

  const opfsProvider = new HTMLFileSystemProvider(
    undefined,
    "Origin Private File System",
    StandaloneServices.get(ILogService)
  );
  
  await opfsProvider.registerDirectoryHandle(root);
  registerFileSystemOverlay(1, opfsProvider);

  // workspace.updateWorkspaceFolders(0, 0, {
  //   uri: Uri.file(root.name)
  // });
}

export async function attachPanels(panels: Panels) {
  for (const { panel, element } of panels) {
    attachPart(panel, element);
  }

  // const workbenchLayoutService = await getService(IWorkbenchLayoutService)
  // workbenchLayoutService.setPanelPosition(1);
}
