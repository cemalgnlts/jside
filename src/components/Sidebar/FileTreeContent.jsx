import { Suspense, lazy, useEffect, useRef } from "react";

import { useAtomValue, useSetAtom } from "jotai";
import { $fileTree, $updateFileTree, $insertFile } from "../../state";

import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import styles from "./styles.module.css";

const FileTree = lazy(() => import("@components/FileTree"));

function ProjectsTreeContent({ tree }) {
  /** @type {React.MutableRefObject<import("react-complex-tree").TreeRef>} */
  let treeRef = useRef(null);
  const files = useAtomValue(tree);
  const insertFile = useSetAtom($insertFile);
  const updateFileTree = useSetAtom($updateFileTree);

  useEffect(() => {
    if (treeRef && files["new"]) {
      setTimeout(() => treeRef.current.startRenamingItem("new"), 50);
    }
  }, [files]);

  const addNewFile = () => {
    insertFile({ parent: "root" });
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
        <span className={styles.name}>{files.root.title}</span>
        <div className={styles.actions}>
          <Button title="New file" onClick={addNewFile} icon small ghost>
            <Icon name="note_add" />
          </Button>
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
          <Button title="Refresh" onClick={refresh} icon small ghost>
            <Icon name="refresh" />
          </Button>
        </div>
      </div>
      <div className="rct-dark">
        <FileTree items={files} treeRef={treeRef} />
      </div>
    </>
  );
}

export default ProjectsTreeContent;
