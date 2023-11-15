import { memo } from "react";

import {
  UncontrolledTreeEnvironment,
  StaticTreeDataProvider,
  Tree
} from "react-complex-tree";

import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";

function FileTree({ items }) {
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

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))
      }
      getItemTitle={(item) => item.title}
      renderItemTitle={renderItemTitle}
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
