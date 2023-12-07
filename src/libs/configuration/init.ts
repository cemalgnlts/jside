import { IConfigurationService, getService, initialize as initializeServices } from "vscode/services";

// services
import getDialogsServiceOverride from "@codingame/monaco-vscode-dialogs-service-override";
import getStorageServiceOverrride from "@codingame/monaco-vscode-storage-service-override";
import getViewsServiceOverride, { Parts, attachPart } from "@codingame/monaco-vscode-views-service-override";
import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";
import getConfigurationServiceOverride, {
  initUserConfiguration
} from "@codingame/monaco-vscode-configuration-service-override";
import { registerFileSystemOverlay } from "@codingame/monaco-vscode-files-service-override";
import getExtensionsServiceOverride from "@codingame/monaco-vscode-extensions-service-override";
import getStatusBarServiceOverride from "@codingame/monaco-vscode-view-status-bar-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getNotificationsServiceOverride from "@codingame/monaco-vscode-notifications-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getSnippetsServiceOverride from "@codingame/monaco-vscode-snippets-service-override";
import getQuickAccessServiceOverride from "@codingame/monaco-vscode-quickaccess-service-override";
import getOutputServiceOverride from "@codingame/monaco-vscode-output-service-override";
import getMarkersServiceOverride from "@codingame/monaco-vscode-markers-service-override";
import getLifecycleServiceOverride from "@codingame/monaco-vscode-lifecycle-service-override";

// Languages
import "@codingame/monaco-vscode-html-default-extension";
import "@codingame/monaco-vscode-css-default-extension";
import "@codingame/monaco-vscode-javascript-default-extension";
import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "@codingame/monaco-vscode-json-default-extension";
import "@codingame/monaco-vscode-typescript-language-features-default-extension";

// Themes
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-theme-seti-default-extension";

// Workers
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import TextmateWorker from "@codingame/monaco-vscode-textmate-service-override/worker?worker";
import OutputLinkComputer from "@codingame/monaco-vscode-output-service-override/worker?worker";

import { openNewCodeEditor } from "./openNewEditor";
import { Uri, workspace } from "vscode";

import "vscode/localExtensionHost";

import userConfig from "./userConfiguration.json?raw";
import WebFileSystem from "../WebFileSystem";

type Panels = Array<{
  panel: Parts;
  element: HTMLDivElement;
}>;

const workspaceUri = Uri.file("/workspace.code-workspace");

window.MonacoEnvironment = {
  getWorker: (moduleId, label) => {
    switch (label) {
      case "editorWorkerService":
        return new EditorWorker();
      case "textMateWorker":
        return new TextmateWorker();
      case "outputLinkComputer":
        return new OutputLinkComputer();
      // case "javascript":
      // case "typescript":
      //   return new TypeScriptWorker();
    }

    throw Error(`Unimplemented worker ${label} (${moduleId})`);
  }
};

export async function init() {
  await initUserConfiguration(userConfig);

  await initializeServices(
    {
      ...getExtensionsServiceOverride(),
      ...getStorageServiceOverrride(),
      ...getConfigurationServiceOverride(),
      ...getViewsServiceOverride(openNewCodeEditor),
      ...getModelServiceOverride(),
      ...getLanguagesServiceOverride(),
      ...getTextmateServiceOverride(),
      ...getSnippetsServiceOverride(),
      ...getQuickAccessServiceOverride({
        isKeybindingConfigurationVisible: () => false,
        shouldUseGlobalPicker: () => false
      }),
      ...getNotificationsServiceOverride(),
      ...getDialogsServiceOverride(),
      ...getStatusBarServiceOverride(),
      ...getThemeServiceOverride(),
      ...getOutputServiceOverride(),
      ...getMarkersServiceOverride(),
      ...getLifecycleServiceOverride()
    },
    document.body,
    {
      workspaceProvider: {
        trusted: true,
        open: async () => false,
        workspace: { workspaceUri }
      }
    }
  );

  await initFS();
}

async function initFS() {
  const rootDirHandle = await navigator.storage.getDirectory();
  const projectsDirHandle = await rootDirHandle.getDirectoryHandle("projects");

  const webFS = new WebFileSystem();
  await webFS.mount(projectsDirHandle);

  registerFileSystemOverlay(1, webFS);

  workspace.updateWorkspaceFolders(0, 0, { uri: Uri.file(projectsDirHandle.name) });
}

export async function attachPanels(panels: Panels) {
  for (const { panel, element } of panels) {
    attachPart(panel, element);
  }
}
