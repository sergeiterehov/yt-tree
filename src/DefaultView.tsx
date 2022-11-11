import mockList, { IMockItem } from "./mockList";
import TreeView from "./TreeView/TreeView";

const DefaultView: React.FC = () => {
  return (
    <TreeView
      width={600}
      height={300}
      list={mockList}
      idProperty="id"
      childrenProperty="children"
    >
      {({ item }) => <span>{(item as IMockItem).name}</span>}
    </TreeView>
  );
};

export default DefaultView;
