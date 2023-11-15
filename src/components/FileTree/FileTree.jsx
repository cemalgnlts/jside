import { memo, useEffect, useRef } from "react";

import {
  UncontrolledTreeEnvironment,
  StaticTreeDataProvider,
  Tree
} from "react-complex-tree";

import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";
import { useAtomValue } from "jotai";
import { $dockViewApi } from "../../state";

function FileTree({ items }) {
  /** @type {import("dockview").DockviewApi} */
  const dockViewApi = useAtomValue($dockViewApi);

  const renderItemTitle = (ev) => {
    const { isFolder, title } = ev.item;

    let IconEl = null;

    if (isFolder) {
      const name = ev.context.isExpanded ? "folder_open" : "folder";
      IconEl = <Icon name={name} />;
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
      component: "editor",
      title: item.title
    });
  };

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(items, (item, data) => ({
          ...item,
          data
        }))
      }
      getItemTitle={(item) => item.title}
      renderItemTitle={renderItemTitle}
      onPrimaryAction={onItemSelect}
      viewState={{}}
    >
      <Tree treeId="fileTree" rootItem="root" treeLabel="File Tree" />
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
