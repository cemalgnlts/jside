import {
  UncontrolledTreeEnvironment,
  StaticTreeDataProvider,
  Tree
} from "react-complex-tree";

import Icon from "@components/Icon";

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
  const renderItemTitle = (ev) => {
    const { isFolder, title } = ev.item;
    let icon = "insert_drive_file";

    if (isFolder) icon = ev.context.isExpanded ? "folder_open" : "folder";

    return <ItemTitle title={title} icon={icon} />;
  };

  const onCollapse = (item) => {};

  const onExpand = (item) => {};

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))
      }
      getItemTitle={(item) => item.title}
      onExpandItem={onExpand}
      onCollapseItem={onCollapse}
      renderItemTitle={renderItemTitle}
      viewState={{}}
    >
      <Tree treeId="fileTree" rootItem="root" treeLabel="File Tree" />
    </UncontrolledTreeEnvironment>
  );
}

function ItemTitle({ title, icon }) {
  return (
    <>
      <Icon name={icon} />
      <p>{title}</p>
    </>
  );
}

export default FileTree;
