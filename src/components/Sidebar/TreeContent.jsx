import { lazy, useEffect, useRef } from "react";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { $dockViewApi, $insertFile } from "../../state";

import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import styles from "./styles.module.css";

const FileTree = lazy(() => import("@components/FileTree"));

function TreeContent({ tree, updateTree, title, isProjectExplorer }) {
  /** @type {React.MutableRefObject<import("react-complex-tree").TreeRef>} */
  const treeRef = useRef(null);
  const provider = useRef(null);
  const contextMenuRef = useRef(null);
  const selectedLiId = useRef(null);
  const dockViewApi = useAtomValue($dockViewApi);
  const items = useAtomValue(tree);
  const updateFileTree = useSetAtom(updateTree);
  const insertFile = useSetAtom($insertFile);

  useEffect(() => {
    updateFileTree();
  }, [isProjectExplorer]);

  useEffect(() => {
    if (treeRef && items["new"]) {
      requestAnimationFrame(() => treeRef.current.startRenamingItem("new"));
    }
  }, [items]);

  const addNewFile = () => {
    if (!isProjectExplorer) {
      insertFile({ parentIndex: "root", relativeParentPath: "" });
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

  const onContextMenu = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const btn =
      ev.target.tagName === "button"
        ? ev.target
        : ev.target.closest("li").querySelector("button");

    selectedLiId.current = btn.dataset.rctItemId;

    if (contextMenuRef.current.style.display !== "block")
      contextMenuRef.current.style.display = "block";

    contextMenuRef.current.style.setProperty("--left", `${ev.x}px`);
    contextMenuRef.current.style.setProperty("--top", `${ev.y - 5}px`);
  };

  const onContextMenuAction = (ev) => {
    const li = ev.target.tagName !== "LI" ? ev.target.closest("li") : ev.target;
    const action = li.dataset.action;

    if (action === "rename") {
      treeRef.current.treeContext.setRenamingItem(selectedLiId.current);
    } else if (
      action === "delete" &&
      confirm("Do you want to delete this file forever?")
    ) {
      provider.current.remove(selectedLiId.current);
    }
  };

  const closeContextMenu = (ev) => {
    ev.preventDefault();
    contextMenuRef.current.style.display = "none";
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
          provider={provider}
          onContextMenu={onContextMenu}
          isProjectExplorer={isProjectExplorer}
        />
      </div>
      <div
        className={styles.contextMenu}
        onClick={closeContextMenu}
        onContextMenu={closeContextMenu}
        ref={contextMenuRef}
      >
        <ul onClick={onContextMenuAction}>
          <li data-action="rename">
            <Icon name="edit"></Icon> Rename
          </li>
          <li className={styles.divider}></li>
          <li data-action="delete">
            <Icon name="delete"></Icon> Delete
          </li>
        </ul>
      </div>
    </>
  );
}

export default TreeContent;
