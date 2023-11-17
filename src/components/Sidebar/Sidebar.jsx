import FileTree from "@components/FileTree";

import { useAtomValue, useSetAtom } from "jotai";
import {
  $fileTree,
  $updateFileTree,
  $insertFile,
  fileSystem
} from "../../state";

import styles from "./styles.module.css";
import Icon from "../Icon/Icon";
import Button from "../button/Button";
import { useCallback, useEffect, useRef } from "react";

function Sidebar() {
  /** @type {React.MutableRefObject<import("react-complex-tree").TreeRef>} */
  let treeRef = useRef(null);
  const files = useAtomValue($fileTree);
  const insertFile = useSetAtom($insertFile);
  const updateFileTree = useSetAtom($updateFileTree);

  useEffect(() => {
    updateFileTree();
  }, []);

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
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.name}>{files.root.name}</span>
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
    </aside>
  );
}

export default Sidebar;
