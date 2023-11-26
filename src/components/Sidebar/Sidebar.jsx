import { Suspense, lazy, useEffect, useRef } from "react";

import { useAtomValue } from "jotai";
import { LayoutPriority, PaneviewReact } from "dockview";

import styles from "./styles.module.css";
import { $currentStatus } from "../../state";
import PaneHeader from "./PaneHeader.jsx";

const TreeContent = lazy(() => import("./TreeContent.jsx"));

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
  const { isProjectExplorer, projectName } = useAtomValue($currentStatus);
  /** @type {React.MutableRefObject<import("dockview").PaneviewApi>} */
  const paneApi = useRef(null);

  useEffect(() => {
    if (isProjectExplorer) return;

    paneApi.current.panels.forEach((panel) =>
      paneApi.current.removePanel(panel)
    );

    paneApi.current.addPanel({
      id: "explorer",
      title: projectName,
      component: "default",
      headerComponent: "default",
      isExpanded: true,
      params: {
        isProjectExplorer
      }
    });
  }, [isProjectExplorer]);

  /** @param {import("dockview").PaneviewReadyEvent} ev */
  const onReady = (ev) => {
    const commonOpts = {
      component: "default",
      headerComponent: "default",
      isExpanded: true,
      params: {
        isProjectExplorer
      }
    };

    ev.api.addPanel({
      id: "device",
      title: "Device Folder",
      ...commonOpts
    });

    ev.api.addPanel({
      id: "op",
      title: "Origin Private File System",
      ...commonOpts
    });

    paneApi.current = ev.api;
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
