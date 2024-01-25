import { commands } from "vscode";

import {
  Parts,
  attachPart,
  isPartVisibile,
  onPartVisibilityChange,
  setPartVisibility
} from "@codingame/monaco-vscode-views-service-override";
import { Sash, ISashEvent } from "monaco-editor/esm/vs/base/browser/ui/sash/sash.js";

import { init } from "./workspace/init";

async function App() {
  await init();

  const parts = [Parts.TITLEBAR_PART, Parts.EDITOR_PART, Parts.SIDEBAR_PART, Parts.PANEL_PART, Parts.STATUSBAR_PART];

  for (const part of parts) {
    const id = part.split(".")[2];
    const el = document.getElementById(id) as HTMLDivElement;

    attachPart(part, el);

    onPartVisibilityChange(part, (isVisible) => {
      el.style.display = isVisible ? "" : "none";

      if (part === Parts.SIDEBAR_PART) {
        if (isVisible) document.documentElement.style.removeProperty("--sidebar-width");
        else document.documentElement.style.setProperty("--sidebar-width", "0px");
      }
    });

    if (!isPartVisibile(part)) el.style.display = "none";

    if (part === Parts.PANEL_PART) setPartVisibility(Parts.PANEL_PART, false);
    else if (part === Parts.SIDEBAR_PART) addSash(el, "--sidebar-width");
  }

  await commands.executeCommand("workbench.view.extension.project-manager");

  document.querySelector(".splash")?.remove();
}

function addSash(el: HTMLDivElement, propertyName: string) {
  const sash = new Sash(
    el,
    {
      getVerticalSashLeft() {
        return 1;
      }
    },
    { orientation: 0 }
  );

  sash.onDidReset(() => {
    document.documentElement.style.removeProperty(propertyName);
  });

  sash.onDidChange((ev: ISashEvent) => {
    const width = document.body.clientWidth - ev.currentX;
    document.documentElement.style.setProperty(propertyName, `${width}px`);
  });
}

export default App;
