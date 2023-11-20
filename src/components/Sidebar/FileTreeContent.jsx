import { lazy, useEffect, useRef } from "react";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { $dockViewApi, $insertFile } from "../../state";

import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import styles from "./styles.module.css";

const FileTree = lazy(() => import("@components/FileTree"));

function ProjectsTreeContent({ tree, updateTree, title, isProjectExplorer }) {
  /** @type {React.MutableRefObject<import("react-complex-tree").TreeRef>} */
  let treeRef = useRef(null);
  const dockViewApi = useAtomValue($dockViewApi);
  const items = useAtomValue(tree);
  const updateFileTree = useSetAtom(updateTree);
  const insertFile = useSetAtom($insertFile);

  useEffect(() => {
    updateFileTree();
  }, [isProjectExplorer]);

  useEffect(() => {
    if (treeRef && items["new"]) {
      setTimeout(() => treeRef.current.startRenamingItem("new"), 50);
    }
  }, [items]);

  const addNewFile = () => {
    if (!isProjectExplorer) {
      insertFile({ parent: "root" });
      return;
    }

    const panel = dockViewApi.getPanel("newProject");

    if (panel) return;

    dockViewApi.addPanel({
      id: "newProject",
      component: "projectTemplates",
      title: "New Project",
      props: {
        noIcon: true
      }
    });
  };

  const addNewFolder = () => {};

  const collapseFolders = () => {
    treeRef.current.collapseAll();
  };

  const refresh = () => {
    updateFileTree();
  };

  return (
    <>
      <div className={styles.header}>
        <span className={styles.name}>
          {isProjectExplorer ? title : items.root.title}
        </span>
        <div className={styles.actions}>
          <Button
            title={isProjectExplorer ? "New project" : "New file"}
            onClick={addNewFile}
            icon
            small
            ghost
          >
            <Icon name={isProjectExplorer ? "add" : "note_add"} />
          </Button>

          {!isProjectExplorer && (
            <Button title="New folder" icon small ghost>
              <Icon name="create_new_folder" />
            </Button>
          )}

          {!isProjectExplorer && (
            <Button
              title="Collapse folders"
              onClick={collapseFolders}
              icon
              small
              ghost
            >
              <Icon name="unfold_less" />
            </Button>
          )}

          <Button title="Refresh" onClick={refresh} icon small ghost>
            <Icon name="refresh" />
          </Button>
        </div>
      </div>
      <div className="rct-dark">
        <FileTree
          items={items}
          treeRef={treeRef}
          isProjectExplorer={isProjectExplorer}
        />
      </div>
    </>
  );
}

export default ProjectsTreeContent;
