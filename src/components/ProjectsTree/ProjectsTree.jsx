import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment
} from "react-complex-tree";
import Icon from "../Icon";

const items = {
  root: {
    index: "root",
    isFolder: true,
    children: ["p1", "p2"]
  },
  p1: {
    index: "p1",
    title: "First Project",
    isFolder: false
  },
  p2: {
    index: "p2",
    title: "Another project",
    isFolder: false
  }
};

function ProjectsTree() {
  const renderItem = (item) => {
    return (
      <ItemTitle title={item.title}>
        <Icon name="folder" />
      </ItemTitle>
    );
  };

  return (
    <UncontrolledTreeEnvironment
      dataProvider={new StaticTreeDataProvider(items, (item) => ({ ...item }))}
      getItemTitle={(item) => item.title}
      renderItem={renderItem}
      disableMultiselect={true}
      viewState={{}}
    >
      <Tree treeId="projectsTree" rootItem="root" treeLabel="Projects Tree" />
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

export default ProjectsTree;
