import { Suspense, lazy } from "react";

import {
  $projectTree,
  $isProjectExplorer,
  $updateProjectTree,
  $updateFileTree,
  $fileTree
} from "../../state";

import styles from "./styles.module.css";
import { useAtomValue } from "jotai";

const FileTreeContent = lazy(() => import("./FileTreeContent.jsx"));

function Sidebar() {
  const isProjectExplorer = useAtomValue($isProjectExplorer);
  const tree = isProjectExplorer ? $projectTree : $fileTree;
  const updateTree = isProjectExplorer ? $updateProjectTree : $updateFileTree;

  return (
    <aside className={styles.sidebar}>
      <Suspense fallback={<p>Loading...</p>}>
        <FileTreeContent
          title="Projects"
          tree={tree}
          updateTree={updateTree}
          isProjectExplorer={isProjectExplorer}
        />
      </Suspense>
    </aside>
  );
}

export default Sidebar;
