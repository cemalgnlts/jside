import { memo, useEffect } from "react";

import { UncontrolledTreeEnvironment, Tree } from "react-complex-tree";

import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";
import { useAtomValue, useSetAtom } from "jotai";
import { $dockViewApi, $openProject } from "../../state";

import FileSystemTreeDataProvider from "./FileSystemTreeDataProvider";

function FileTree({ items, providerRef, treeRef, fsType, isProjectExplorer }) {
  /** @type {import("dockview").DockviewApi} */
  const dockViewApi = useAtomValue($dockViewApi);
  const openProject = useSetAtom($openProject);

  if (providerRef.current === null) {
    providerRef.current = new FileSystemTreeDataProvider(items);
  }

  useEffect(() => {
    providerRef.current.update(items);
  }, [items]);

  const selectFile = (item) => {
    const panel = dockViewApi.getPanel(item.index);

    if (panel) {
      if (!panel.isActive) panel.api.setActive();

      return;
    }

    dockViewApi.addPanel({
      id: item.index,
      component: "editor",
      title: item.title,
      params: {
        path: item.path
      }
    });
  };

  const selectProject = (item) => {
    openProject({ title: item.title, path: item.path, fsType });
  };

  const onItemSelect = (item) => {
    if (isProjectExplorer) selectProject(item);
    else selectFile(item);
  };

  const onRename = (item, name) => {
    dockViewApi.getPanel(item.index)?.setTitle(name);
  };

  const onCanDrag = ([item]) => !item.isFolder;

  const onAction = (act, itemId) => {
    switch (act) {
      case "rename":
        treeRef.current.treeContext.setRenamingItem(itemId);
        break;
      case "delete":
        const txt = `Are you sure you want to delete '${items[itemId].title}' file?`;
        if (!confirm(txt)) return;
        providerRef.current.remove(itemId);
        break;
    }
  };

  const preRenderItemTitle = (ev) =>
    renderItemTitle(ev, isProjectExplorer, onAction);

  return (
    <UncontrolledTreeEnvironment
      dataProvider={providerRef.current}
      getItemTitle={(item) => item.title}
      renderItemTitle={preRenderItemTitle}
      // defaultInteractionMode={InteractionMode.DoubleClickItemToExpand}
      onPrimaryAction={onItemSelect}
      onRenameItem={onRename}
      disableMultiselect={true}
      canDragAndDrop={!isProjectExplorer}
      canDropOnFolder={true}
      canDrag={onCanDrag}
      viewState={{}}
    >
      <Tree
        treeId={`fileTree-${fsType}`}
        rootItem="root"
        treeLabel={`${fsType === "device" ? "User" : "Private"} File Tree`}
        ref={treeRef}
      />
    </UncontrolledTreeEnvironment>
  );
}

function renderItemTitle(ev, isProjectExplorer, onAction) {
  const { isFolder, title } = ev.item;

  let IconEl = null;

  if (isFolder) {
    const iconName = ev.context.isExpanded ? "folder_open" : "folder";
    IconEl = <Icon name={iconName} />;
  } else {
    IconEl = getFileIcon(title) || (
      <Icon name={isProjectExplorer ? "folder" : "insert_drive_file"} />
    );
  }

  return (
    <ItemTitle
      title={title}
      itemId={ev.item.index}
      isFolder={isFolder}
      onAction={onAction}
    >
      {IconEl}
    </ItemTitle>
  );
}

function ItemTitle({ title, itemId, isFolder, onAction, children }) {
  const onClick = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    onAction(ev.target.dataset.action, itemId);
  };

  return (
    <>
      {children}
      <p>{title}</p>
      <div className="rct-item-actions" onClick={onClick}>
        {isFolder && (
          <>
            <a
              data-action="new-folder"
              title="New folder"
              className="btn btn-icon btn-small btn-ghost"
            >
              <Icon name="create_new_folder" />
            </a>
            <a
              data-action="new-file"
              title="New file"
              className="btn btn-icon btn-small btn-ghost"
            >
              <Icon name="note_add" />
            </a>
          </>
        )}
        <a
          data-action="rename"
          title="Rename"
          className="btn btn-icon btn-small btn-ghost"
        >
          <Icon name="edit" />
        </a>
        <a
          data-action="delete"
          title="Delete"
          className="btn btn-icon btn-small btn-ghost"
        >
          <Icon name="delete" />
        </a>
      </div>
    </>
  );
}

export default memo(FileTree);
