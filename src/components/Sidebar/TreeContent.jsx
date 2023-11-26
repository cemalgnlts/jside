import { lazy, useEffect, useState, useRef } from "react";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { $dockViewApi, $insertFile } from "../../state";

import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import styles from "./styles.module.css";
import { FileSystem } from "../../libs/FileSystem";
import { explainFSError } from "../../utils/Utils";

const FileTree = lazy(() => import("@components/FileTree"));

function TreeContent({ fsType, tree, isProjectExplorer }) {
  /** @type {React.MutableRefObject<import("react-complex-tree").TreeRef>} */
  const treeRef = useRef(null);
  const providerRef = useRef(null);
  const items = useAtomValue(tree);
  const [canAccessFS, setCanAccessFS] = useState(FileSystem.hasAccessDeviceFS);

  useEffect(() => {
    if (treeRef && items["new"]) {
      requestAnimationFrame(() => treeRef.current.startRenamingItem("new"));
    }
  }, [items]);

  const requestPermission = async () => {
    try {
      await FileSystem.requestPermission();
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
        items={items}
        treeRef={treeRef}
        providerRef={providerRef}
        isProjectExplorer={isProjectExplorer}
      />
    </div>
  );
}

export default TreeContent;
