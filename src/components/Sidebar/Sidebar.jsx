import FileTree from "@components/FileTree";

import { useAtom, useAtomValue } from "jotai";
import { $tree, $fileTree } from "../../state";

import styles from "./styles.module.css";
import Icon from "../Icon/Icon";
import Button from "../button/Button";
import { useRef } from "react";

function Sidebar() {
  /** @type {React.MutableRefObject<import("react-complex-tree").TreeRef>} */
  let treeRef = useRef(null);
  const files = useAtomValue($tree);
  const [, refreshFiles] = useAtom($fileTree);

  const refresh = () => {
    refreshFiles();
  };

  const addNewFile = () => {};

  const addNewFolder = () => {};

  const collapseFolders = () => {
    treeRef.current.collapseAll();
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>{files.root.title}</span>
        <div className={styles.actions}>
          <Button title="New file" icon small ghost>
            <Icon name="note_add" />
          </Button>
          <Button title="New folder" icon small ghost>
            <Icon name="create_new_folder" />
          </Button>
          <Button title="Refresh" onClick={refresh} icon small ghost>
            <Icon name="refresh" />
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
        </div>
      </div>
      <div className="rct-dark">
        <FileTree items={files} treeRef={treeRef} />
      </div>
    </aside>
  );
}

export default Sidebar;
