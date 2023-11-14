import { DockviewReact } from "dockview";
import { PanelContent, PanelTab } from "@components/Panel";
import Editor from "@components/Editor";

const components = {
  default: PanelContent,
  editor: Editor
};

function DockView() {
  /** @param {import("dockview").DockviewReadyEvent} ev */
  const onReady = (ev) => {
    ev.api.addPanel({
      id: "panel_1",
      component: "editor",
      title: "main.js"
    });
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
