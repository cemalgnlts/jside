import { lazy, useEffect, useState, useRef } from "react";

import { useAtomValue, useSetAtom } from "jotai";
import {
  $fileTree,
  $updateFileTree,
  $updateProjectTree,
  projectTrees
} from "../../state";

import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import styles from "./styles.module.css";
import { FileSystem } from "../../libs/FileSystem";
import { explainFSError } from "../../utils/Utils";
import useEvents from "../../hooks/useEvents";

const FileTree = lazy(() => import("@components/FileTree"));

function TreeContent({ fsType, isProjectExplorer }) {
  /** @type {React.MutableRefObject<import("react-complex-tree").TreeRef>} */
  const treeRef = useRef(null);
  const providerRef = useRef(null);
  const { onEvent } = useEvents();
  const updateFileTree = useSetAtom(
    isProjectExplorer ? $updateProjectTree : $updateFileTree
  );
  const items = useAtomValue(
    isProjectExplorer ? projectTrees[fsType] : $fileTree
  );
  const [canAccessFS, setCanAccessFS] = useState(
    !isProjectExplorer || FileSystem.checkPermission(fsType)
  );

  useEffect(() => {
    onEvent("rct-collapse", () => {
      if (treeRef) treeRef.current.collapseAll();
    });

    // Auto permission request for opfs.
    if (fsType === "op")
      FileSystem.requestPermission("op")
        .then(() => updateFileTree(fsType))
        .catch((err) => alert(err));
  }, []);

  useEffect(() => {
    if (treeRef && items["new"]) {
      requestAnimationFrame(() => treeRef.current.startRenamingItem("new"));
    }

    if(!isProjectExplorer) updateFileTree();
  }, [items]);

  const requestPermission = async () => {
    try {
      await FileSystem.requestPermission(fsType);
      updateFileTree(fsType);
      setCanAccessFS(true);
    } catch (err) {
      alert(explainFSError(err));
    }
  };

  return (
    <div className="rct-dark">
      {!canAccessFS && fsType === "device" ? (
        <Button
          onClick={requestPermission}
          className={styles.permissionReqBtn}
          ghost
        >
          <Icon name="folder" />
          <small>Request Storage Permission</small>
        </Button>
      ) : null}
      <FileTree
        fsType={fsType}
        items={items}
        treeRef={treeRef}
        providerRef={providerRef}
        isProjectExplorer={isProjectExplorer}
      />
    </div>
  );
}

export default TreeContent;
