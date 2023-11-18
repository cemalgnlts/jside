import { memo } from "react";

import { UncontrolledTreeEnvironment, Tree } from "react-complex-tree";

import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";
import { useAtomValue } from "jotai";
import { $dockViewApi } from "../../state";

import FileSystemTreeDataProvider from "./FileSystemTreeDataProvider";

function FileTree({ items, treeRef }) {
  /** @type {import("dockview").DockviewApi} */
  const dockViewApi = useAtomValue($dockViewApi);

  const renderItemTitle = (ev) => {
    const { isFolder, title } = ev.item;

    let IconEl = null;

    if (isFolder) {
      const iconName = ev.context.isExpanded ? "folder_open" : "folder";
      IconEl = <Icon name={iconName} />;
    } else {
      IconEl = getFileIcon(title) || <Icon name="insert_drive_file" />;
    }

    return <ItemTitle title={title}>{IconEl}</ItemTitle>;
  };

  const onItemSelect = (item) => {
    const panel = dockViewApi.getPanel(item.index);

    if (panel) {
      if (!panel.isActive) panel.api.setActive();
      return;
    }

    dockViewApi.addPanel({
      id: item.index,
      params: {
        path: item.path
      },
      component: "editor",
      title: item.title
    });
  };

  const onRename = (item, name) => {
    dockViewApi.getPanel(item.index)?.setTitle(name);
  };

  return (
    <UncontrolledTreeEnvironment
      dataProvider={new FileSystemTreeDataProvider(items)}
      getItemTitle={(item) => item.title}
      renderItemTitle={renderItemTitle}
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

function ItemTitle({ title, children }) {
  return (
    <>
      {children}
      <p>{title}</p>
    </>
  );
}

export default memo(FileTree);
