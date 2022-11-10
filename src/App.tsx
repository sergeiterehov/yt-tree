import React from "react";
import styled from "styled-components";
import mockList, { IMockItem } from "./mockList";
import TreeView, {
  TreeViewItem,
  TreeViewItemComponent,
  TreeViewRef,
} from "./TreeView/TreeView";
import "./App.css";

const ITEM_HEIGHT = 32;

// Styled tree element with styled-component
const TreeItem = styled(TreeViewItem)`
  background-color: ${({ index }) =>
    index % 2 ? "rgba(0,0,0, .05)" : undefined};

  &:hover {
    background-color: rgba(0, 60, 120, 0.1);
  }

  & .TreeView-Item-Control > * {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${({ collapsed }) => (collapsed ? "black" : "gray")};
    color: transparent;
    line-height: 1em;
    border-radius: 100%;
    overflow: hidden;
    width: 16px;
    height: 16px;
  }
`;

// Styled item content with CSSProperties
const ItemView: TreeViewItemComponent<IMockItem> = ({ item }) => {
  return (
    <div style={{ fontWeight: item.children.length ? "bolder" : undefined }}>
      {item.name}
    </div>
  );
};

const App: React.FC = () => {
  // Available some API for control
  const treeRef = React.useRef<TreeViewRef>(null);

  return (
    <div className="App">
      <button onClick={() => treeRef.current?.scrollTo(33, true)}>
        Scroll and expand 33
      </button>
      <TreeView
        ref={treeRef}
        width={600}
        height={300}
        itemHeight={ITEM_HEIGHT}
        itemComponent={TreeItem}
        list={mockList}
        idProperty="id"
        childrenProperty="children"
      >
        {ItemView}
      </TreeView>
    </div>
  );
};

export default App;
