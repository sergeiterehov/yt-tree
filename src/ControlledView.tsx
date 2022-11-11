import React from "react";
import mockList, { IMockItem } from "./mockList";
import TreeView, { TreeViewRef } from "./TreeView/TreeView";

const ControlledView: React.FC = () => {
  // Available some API for control
  const treeRef = React.useRef<TreeViewRef>(null);

  React.useLayoutEffect(() => {
    if (!treeRef.current) return;

    treeRef.current.setCollapsed(34, true);
    treeRef.current.setCollapsed(3, true);
    treeRef.current.setCollapsed(2, true);
    treeRef.current.setCollapsed(1, true);
  }, []);

  return (
    <>
      <p>
        <button onClick={() => treeRef.current?.scrollTo(33, true, true)}>
          Focus on "33", expand and scroll
        </button>
      </p>
      <TreeView
        ref={treeRef}
        width={600}
        height={300}
        list={mockList}
        idProperty="id"
        childrenProperty="children"
      >
        {({ item }) => <span>{(item as IMockItem).name}</span>}
      </TreeView>
    </>
  );
};

export default ControlledView;
