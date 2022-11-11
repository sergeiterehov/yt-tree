import React from "react";
import styled from "styled-components";
import mockList, { IMockItem } from "./mockList";
import TreeView, { TreeViewRef } from "./TreeView/TreeView";
import TreeViewItem, { TreeViewItemComponent } from "./TreeView/TreeViewtem";

const ITEM_HEIGHT = 32;

const StyledExpander = styled<
  React.FC<{ className?: string; collapsed?: boolean }>
>(({ className, collapsed }) => <span className={className} />)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ collapsed }) => (collapsed ? "green" : "gray")};
  color: transparent;
  line-height: 1em;
  border-radius: 100%;
  overflow: hidden;
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const TreeItem = styled(TreeViewItem)`
  padding-left: 10px;
  font-family: monospace;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: ${({ index }) =>
    index % 2 ? "rgba(0,0,0, .05)" : undefined};
`;

const ItemView = styled<TreeViewItemComponent<IMockItem>>(
  ({ item, className }) => {
    return <span className={className}>{item.name}</span>;
  }
)`
  font-weight: ${({ item }) => (item.children.length ? "bold" : undefined)};
`;

const StyledView: React.FC = styled(() => {
  return (
    <TreeView
      width={600}
      height={300}
      itemHeight={ITEM_HEIGHT}
      itemComponent={TreeItem}
      expandIcon={<StyledExpander collapsed />}
      collapseIcon={<StyledExpander />}
      list={mockList}
      idProperty="id"
      childrenProperty="children"
    >
      {ItemView}
    </TreeView>
  );
})`
  border: 1px solid rgba(0, 0, 0, 0.3);
`;

export default StyledView;
