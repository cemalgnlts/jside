import { ILogService, StandaloneServices, getService, initialize as initializeServices } from "vscode/services";

import getDialogsServiceOverride from "@codingame/monaco-vscode-dialogs-service-override";
import getStorageServiceOverrride from "@codingame/monaco-vscode-storage-service-override";
import getViewsServiceOverride, { Parts, attachPart } from "@codingame/monaco-vscode-views-service-override";

import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";

import getConfigurationServiceOverride, {
  IStoredWorkspace,
  initUserConfiguration
} from "@codingame/monaco-vscode-configuration-service-override";
import {
  HTMLFileSystemProvider,
  initFile,
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

import "vscode/localExtensionHost";

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";

import userConfig from "./userConfiguration.json?raw";

import { openNewCodeEditor } from "./openNewEditor";
import { Uri, workspace } from "vscode";
import WebFileSystem from "../WebFileSystem";

import { IExtensionService } from "vscode/vscode/vs/workbench/services/extensions/common/extensions";
import { registerServiceInitializeParticipant } from "vscode/lifecycle";

registerServiceInitializeParticipant((accessor) => accessor.get(IExtensionService));

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
  const rootDirHandle = await navigator.storage.getDirectory();
  const projectsDirHandle = await rootDirHandle.getDirectoryHandle("projects");

  const htmlFileSystemProvider = new HTMLFileSystemProvider(undefined, "opfs", StandaloneServices.get(ILogService));
  await htmlFileSystemProvider.registerDirectoryHandle(projectsDirHandle);

  registerFileSystemOverlay(1, htmlFileSystemProvider);
  // workspace.registerFileSystemProvider("opfs", provider, {
  //   isCaseSensitive: true
  // });

  workspace.updateWorkspaceFolders(0, 0, {
    uri: Uri.file(projectsDirHandle.name)
  });
}

export async function attachPanels(panels: Panels) {
  for (const { panel, element } of panels) {
    attachPart(panel, element);
  }

  // const workbenchLayoutService = await getService(IWorkbenchLayoutService)
  // workbenchLayoutService.setPanelPosition(1);
}
