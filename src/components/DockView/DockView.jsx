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

  return (
    <DockviewReact
      components={components}
      defaultTabComponent={PanelTab}
      onReady={onReady}
    />
  );
}

export default DockView;
