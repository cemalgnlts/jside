import { memo, useEffect, useState } from "react";

import { UncontrolledTreeEnvironment, Tree } from "react-complex-tree";

import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";
import { useAtomValue, useSetAtom } from "jotai";
import { $dockViewApi, $openProject } from "../../state";

import FileSystemTreeDataProvider from "./FileSystemTreeDataProvider";

function FileTree({ items, treeRef, isProjectExplorer }) {
  /** @type {import("dockview").DockviewApi} */
  const dockViewApi = useAtomValue($dockViewApi);
  const openProject = useSetAtom($openProject);
  
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
    openProject({ title: item.title, path: item.path });
  };

  const onItemSelect = (item) => {
    if (isProjectExplorer) selectProject(item);
    else selectFile(item);
  };

  const onRename = (item, name) => {
    dockViewApi.getPanel(item.index)?.setTitle(name);
  };

  const preRenderItemTitle = (ev) =>
    renderItemTitle(ev, isProjectExplorer ? "folder" : "insert_drive_file");

  return (
    <UncontrolledTreeEnvironment
      dataProvider={new FileSystemTreeDataProvider(items)}
      getItemTitle={(item) => item.title}
      renderItemTitle={preRenderItemTitle}
      onPrimaryAction={onItemSelect}
      onRenameItem={onRename}
      disableMultiselect={true}
      viewState={{}}
    >
      <Tree
        treeId="fileTree"
        rootItem="root"
        treeLabel="File Tree"
        ref={treeRef}
      />
    </UncontrolledTreeEnvironment>
  );
}

function renderItemTitle(ev, defaultIcon) {
  const { isFolder, title } = ev.item;

  let IconEl = null;

  if (isFolder) {
    const iconName = ev.context.isExpanded ? "folder_open" : "folder";
    IconEl = <Icon name={iconName} />;
  } else {
    IconEl = getFileIcon(title) || <Icon name={defaultIcon} />;
  }

  return <ItemTitle title={title}>{IconEl}</ItemTitle>;
}

const ItemTitle = ({ title, children }) => (
  <>
    {children}
    <p>{title}</p>
  </>
);

export default memo(FileTree);
