import { Suspense, lazy } from "react";

import { useAtomValue } from "jotai";
import { LayoutPriority, PaneviewReact } from "dockview";

import styles from "./styles.module.css";
import {
  $projectTree,
  $isProjectExplorer,
  $updateProjectTree,
  $updateFileTree,
  $fileTree
} from "../../state";
import PaneHeader from "./PaneHeader.jsx";

const TreeContent = lazy(() => import("./TreeContent.jsx"));

/** @type {import("dockview").SerializedPaneview} */
const serializedPaneView = {
  size: 2,
  views: [
    {
      expanded: true,
      priority: LayoutPriority.High,
      size: (window.innerHeight - 50) / 2,
      data: {
        id: "device",
        title: "Device Folder",
        component: "default",
        headerComponent: "default"
      }
    },
    {
      expanded: true,
      size: (window.innerHeight - 50) / 2,
      data: {
        id: "op",
        title: "Origin Private File System",
        component: "default",
        headerComponent: "default"
      }
    }
  ]
};

function Sidebar() {
  const isProjectExplorer = useAtomValue($isProjectExplorer);
  const tree = isProjectExplorer ? $projectTree : $fileTree;
  const updateTree = isProjectExplorer ? $updateProjectTree : $updateFileTree;

  /** @param {import("dockview").PaneviewReadyEvent} ev */
  const onReady = (ev) => {
    const params = {
      tree,
      updateTree,
      isProjectExplorer
    };

    serializedPaneView.views[0].data.params = { ...params };
    serializedPaneView.views[1].data.params = { ...params };

    ev.api.fromJSON(serializedPaneView);
  };

  return (
    <aside className={styles.sidebar}>
      <PaneviewReact
        components={components}
        headerComponents={headerComponents}
        onReady={onReady}
      />
    </aside>
  );
}

export default Sidebar;

const components = {
  default: ({
    api: { id },
    params: { tree, updateTree, isProjectExplorer }
  }) => (
    <Suspense>
      <TreeContent
        fsType={id}
        tree={tree}
        updateTree={updateTree}
        isProjectExplorer={isProjectExplorer}
      />
    </Suspense>
  )
};

const headerComponents = {
  default: PaneHeader
};
