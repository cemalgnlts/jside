import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment
} from "react-complex-tree";
import Icon from "../Icon";
import { useAtomValue } from "jotai";
import { $projectTree } from "../../state";

function ProjectTree() {
  const items = useAtomValue($projectTree);

  const onItemSelect = (item) => console.log(item);

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
      onPrimaryAction={onItemSelect}
      viewState={{}}
    >
      <Tree treeId="projectTree" rootItem="root" treeLabel="Project Tree" />
    </UncontrolledTreeEnvironment>
  );
}

const renderItem = (item) => {
  return (
    <ItemTitle title={item.title}>
      <Icon name="folder" />
    </ItemTitle>
  );
};

const ItemTitle = ({ title, children }) => (
  <>
    {children}
    <p>{title}</p>
  </>
);

export default ProjectTree;
