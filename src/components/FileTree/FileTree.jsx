import {
  UncontrolledTreeEnvironment,
  StaticTreeDataProvider,
  Tree
} from "react-complex-tree";

import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";
import { useAtomValue } from "jotai";
import { $files } from "../../state";

const items = {
  root: {
    index: "root",
    isFolder: true,
    children: ["child2", "child1"],
    title: "folder"
  },
  child2: {
    index: "child2",
    isFolder: true,
    children: ["child3"],
    title: "assets"
  },
  child1: {
    index: "child1",
    children: [],
    title: "main.js"
  },
  child3: {
    index: "child3",
    children: [],
    title: "base.css"
  }
};

function FileTree() {
  const files = useAtomValue($files);

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

export default FileTree;
