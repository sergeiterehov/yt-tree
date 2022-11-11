import classNames from "classnames";
import React from "react";

/**
 * FC type for items body.
 */
export type TreeViewItemComponent<T = any> = React.FC<{
  /** Node ID. */
  id: any;
  /** Node. */
  item: T;
  /** Depth level of element. */
  depth: number;
  className?: string;
}>;

export const ItemViewContext = React.createContext<
  | undefined
  | {
      flatList: any[];
      idProperty: string;
      childrenProperty: string;
      depthMap: Map<any, number>;
      focusId: any;
      itemClassName?: string;
      collapsedIds: any[];
      toggleCollapsedId(id: any): void;
      focusById(id: any): void;
      collapseIcon: React.ReactNode;
      expandIcon: React.ReactNode;
      itemHeight: number;
      width: number;
      childrenComponent?: TreeViewItemComponent;
      itemComponent: typeof TreeViewItem;
    }
>(undefined);

export const ItemViewWrapper: React.FC<{
  index: number;
  style: React.CSSProperties;
}> = ({ index, style }) => {
  const context = React.useContext(ItemViewContext);

  if (!context) return null;

  const {
    childrenProperty,
    collapsedIds,
    depthMap,
    flatList,
    focusId,
    idProperty,
    toggleCollapsedId,
    focusById,
    itemClassName,
    itemHeight,
    width,
    collapseIcon,
    expandIcon,
    childrenComponent: Children,
    itemComponent: Item,
  } = context;

  const id = flatList[index][idProperty];
  const children = flatList[index][childrenProperty];
  const depth = depthMap.get(id) || 0;
  const focused = id === focusId;

  return (
    <Item
      className={itemClassName}
      hasChildren={Boolean(children.length)}
      collapsed={collapsedIds.includes(id)}
      focused={focused}
      onToggleCollapse={() => toggleCollapsedId(id)}
      onFocus={() => focusById(id)}
      collapseIcon={collapseIcon}
      expandIcon={expandIcon}
      index={index}
      id={id}
      item={flatList[index]}
      depth={depth}
      style={style}
      itemHeight={itemHeight}
      width={width}
    >
      {Children ? (
        <Children id={id} item={flatList[index]} depth={depth} />
      ) : null}
    </Item>
  );
};

/**
 * Default TreeViewItem component.
 */
export const TreeViewItem: React.FC<{
  className?: string;
  style: React.CSSProperties;
  index: number;
  id: any;
  item: any;
  depth: number;
  hasChildren: boolean;
  collapsed: boolean;
  focused: boolean;
  onToggleCollapse(): void;
  onFocus(): void;
  itemHeight: number;
  width: number;
  collapseIcon: React.ReactNode;
  expandIcon: React.ReactNode;
  children: React.ReactNode;
}> = ({
  className,
  style,
  hasChildren,
  depth,
  collapsed,
  focused,
  onToggleCollapse,
  onFocus,
  children,
  collapseIcon,
  expandIcon,
  width,
  itemHeight,
}) => {
  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? !collapseIcon : undefined}
      className={classNames("TreeView-Item", className, {
        "TreeView-Item__Parent": hasChildren,
        focused,
      })}
      style={{
        ...style,
        overflow: "hidden",
        paddingLeft: 20 * depth,
        height: itemHeight,
        width,
        boxSizing: "border-box"
      }}
      onClick={
        hasChildren
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();

              onToggleCollapse();
            }
          : undefined
      }
      onMouseDown={() => {
        if (!focused) {
          onFocus();
        }
      }}
    >
      {hasChildren ? (
        <div className="TreeView-Item-Control">
          {collapsed ? expandIcon : collapseIcon}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default TreeViewItem;
