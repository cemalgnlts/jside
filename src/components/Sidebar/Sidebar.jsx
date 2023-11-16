import FileTree from "@components/FileTree";

import { useAtomValue } from "jotai";
import { $fileTree } from "../../state";

import styles from "./styles.module.css";

function Sidebar() {
  const files = useAtomValue($fileTree);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.title}>{files.root.title}</div>
      <div className="rct-dark">
        <FileTree items={files} />
      </div>
    </aside>
  );
}

export default Sidebar;
