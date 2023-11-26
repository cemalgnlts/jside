import { useEffect, useState } from "react";

import { useAtomValue, useSetAtom } from "jotai";

import styles from "./styles.module.css";

import Button from "../Button";
import Icon from "../Icon";
import {
  $dockViewApi,
  $insertFile,
  $isProjectExplorer,
  $updateFileTree,
  $updateProjectTree
} from "../../state";
import useEvents from "../../hooks/useEvents";

/**
 *
 * @param {import("dockview").IPaneviewPanelProps} props
 */
function PaneHeader({ title, api, params }) {
  const [expanded, setExpanded] = useState(api.isExpanded);
  const isProjectExplorer = useAtomValue($isProjectExplorer);
  const dockViewApi = useAtomValue($dockViewApi);
  const { dispatchEvent } = useEvents();
  const insertFile = useSetAtom($insertFile);
  const updateFileTree = useSetAtom(
    isProjectExplorer ? $updateProjectTree : $updateFileTree
  );

  useEffect(() => {
    const disposable = api.onDidExpansionChange((ev) =>
      setExpanded(ev.isExpanded)
    );

    return () => disposable.dispose();
  }, []);

  const toggleState = (ev) => {
    ev.preventDefault();
    api.setExpanded(!expanded);
  };

  const addNewFile = () => {
    if (!isProjectExplorer) {
      insertFile({ parentIndex: "root", relativeParentPath: "" });
      return;
    }

    const panel = dockViewApi.getPanel("newProject");

    if (panel) return;

    dockViewApi.addPanel({
      id: "newProject",
      component: "projectTemplates",
      title: "New Project",
      params: {
        noIcon: true,
        fsType: api.id
      }
    });
  };

  const collapseFolders = () => {
    dispatchEvent("rct-collapse");
  };

  const refresh = () => {
    updateFileTree(api.id);
  };

  return (
    <div className={styles.paneHeader}>
      <a href="#" className={styles.toggler} onClick={toggleState}>
        <Icon name={expanded ? "expand_more" : "expand_less"} />
        <small>{title}</small>
      </a>
      <div className={styles.actions}>
        <Button
          title={params.isProjectExplorer ? "New project" : "New file"}
          onClick={addNewFile}
          icon
          small
          ghost
        >
          <Icon name={params.isProjectExplorer ? "add" : "note_add"} />
        </Button>

        {!params.isProjectExplorer && (
          <>
            <Button title="New folder" icon small ghost>
              <Icon name="create_new_folder" />
            </Button>
            <Button
              title="Collapse folders"
              onClick={collapseFolders}
              icon
              small
              ghost
            >
              <Icon name="unfold_less" />
            </Button>
          </>
        )}

        <Button title="Refresh" onClick={refresh} icon small ghost>
          <Icon name="refresh" />
        </Button>
      </div>
    </div>
  );
}

export default PaneHeader;