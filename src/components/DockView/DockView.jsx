import { DockviewReact } from "dockview";
import { PanelContent, PanelTab } from "@components/Panel";
import { useSetAtom } from "jotai";
import { $dockViewApi } from "../../state";

import Editor from "@components/Editor";
import ProjectTemplate from "@components/ProjectTemplate";

const components = {
  default: PanelContent,
  projectTemplates: ProjectTemplate,
  editor: Editor
};

function DockView() {
  const setDockViewApi = useSetAtom($dockViewApi);

  /** @param {import("dockview").DockviewReadyEvent} ev */
  const onReady = (ev) => {
    setDockViewApi(ev.api);
  };

  /** @param {import("dockview").DockviewDropEvent} ev */
  const onDidDrop = (ev) => {
    // console.log(ev);
  };

  /** @param {import("dockview").DockviewDndOverlayEvent} ev */
  const showDndOverlay = (ev) => {
    const { types } = ev.nativeEvent.dataTransfer;

    return !types.includes("Files") && !types.includes("text/plain");
  };

  return (
    <DockviewReact
      components={components}
      defaultTabComponent={PanelTab}
      showDndOverlay={showDndOverlay}
      onReady={onReady}
      onDidDrop={onDidDrop}
    />
  );
}

export default DockView;
