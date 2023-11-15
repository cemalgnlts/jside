import { DockviewReact } from "dockview";
import { PanelContent, PanelTab } from "@components/Panel";
import Editor from "@components/Editor";
import { useSetAtom } from "jotai";
import { $dockViewApi } from "../../state";

const components = {
  default: PanelContent,
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
