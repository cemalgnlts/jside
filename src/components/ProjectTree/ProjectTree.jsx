import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment
} from "react-complex-tree";
import Icon from "../Icon";
import { useAtomValue } from "jotai";
import { $projectTree } from "../../state";

const items = {
  root: {
    index: "root",
    canMove: true,
    isFolder: true,
    children: ["child1", "child2"],
    title: "Root item",
    canRename: true
  },
  child1: {
    index: "child1",
    title: "Child item 1"
  },
  child2: {
    index: "child2",
    title: "Child item 2"
  }
};

function ProjectTree(items) {
  const renderItem = (item) => {
    return (
      <ItemTitle title={item.title}>
        <Icon name="folder" />
      </ItemTitle>
    );
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
      renderItemTitle={renderItem}
      disableMultiselect={true}
      viewState={{}}
    >
      <Tree treeId="projectTree" rootItem="root" treeLabel="Project Tree" />
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

export default ProjectTree;
