import { initialize as initializeServices } from "vscode/services";

import getDialogsServiceOverride from "@codingame/monaco-vscode-dialogs-service-override";
import getStorageServiceOverrride from "@codingame/monaco-vscode-storage-service-override";
import getViewsServiceOverride, {
  Parts,
  attachPart
} from "@codingame/monaco-vscode-views-service-override";

import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";

import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";

type Panels = Array<{
  panel: Parts;
  element: HTMLDivElement;
}>;

export async function init() {
  await initializeServices({
    ...getStorageServiceOverrride(),
    ...getConfigurationServiceOverride(),
    ...getViewsServiceOverride(),
    ...getModelServiceOverride(),
    ...getDialogsServiceOverride()
  });
}

export function attachPanels(panels: Panels) {
  for (const { panel, element } of panels) {
    attachPart(panel, element);
  }
}
