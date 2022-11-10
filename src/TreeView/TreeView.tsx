import React from "react";
import { FixedSizeList } from "react-window";
import classnames from "classnames";
import "./TreeView.css";

const defaultCollapseIcon = <span style={{ marginRight: 7 }}>[-]</span>;
const defaultExpandIcon = <span style={{ marginRight: 7 }}>[+]</span>;

export type TreeViewRef = {
  /**
   * Sets new collapse state for item.
   *
   * @param id Node ID
   * @param collapse New collapsed state
   * @param fullPath Set for node and ancestors
   */
  setCollapsed(id: any, collapse: boolean, fullPath?: boolean): void;
  /**
   * Returns current collapse state.
   *
   * @param id Node ID
   */
  getCollapsed(id: any): boolean;

  /**
   * Scroll to element by ID.
   *
   * @param id Node ID
   * @param expand If true, all parents will be expanded.
   */
  scrollTo(id: any, expand?: boolean): void;
};

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
}>;

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
  onToggleCollapse(): void;
  collapseIcon: React.ReactNode;
  expandIcon: React.ReactNode;
  children: React.ReactNode;
}> = ({
  className,
  style,
  hasChildren,
  depth,
  collapsed,
  onToggleCollapse,
  children,
  collapseIcon,
  expandIcon,
}) => {
  return (
    <div
      className={classnames("TreeView-Item", className, {
        "TreeView-Item__Parent": hasChildren,
      })}
      style={Object.assign(
        {
          paddingLeft: 20 * depth,
        } as React.CSSProperties,
        style
      )}
      onClick={
        hasChildren
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();

              onToggleCollapse();
            }
          : undefined
      }
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

const TreeView = React.forwardRef<
  TreeViewRef,
  {
    /** Root-level items. */
    list: any[];
    /** Property name of item with uniq id. */
    idProperty: string;
    /** Property name of item with children array. Array is required. */
    childrenProperty: string;

    height: number;
    width: number;

    itemHeight: number;

    children?: TreeViewItemComponent;
    itemComponent?: typeof TreeViewItem;

    collapseIcon?: React.ReactNode;
    expandIcon?: React.ReactNode;

    className?: string;
    itemClassName?: string;
  }
>((props, ref) => {
  const {
    list,
    idProperty,
    childrenProperty,
    width,
    height,
    itemHeight,
    children: Children,
    itemComponent: Item = TreeViewItem,
    collapseIcon = defaultCollapseIcon,
    expandIcon = defaultExpandIcon,
    className,
    itemClassName,
  } = props;

  const scrollRef = React.useRef<FixedSizeList>(null);
  const scrollToRef = React.useRef<any>();

  const [collapsedIds, setCollapsedIds] = React.useState<any[]>([]);

  const { flatList, depthMap } = React.useMemo(() => {
    const newFlatList: any[] = [];
    const newDepthMap = new Map<any, number>();

    const dive = (items: any[], depth = 0) => {
      for (const item of items) {
        newFlatList.push(item);
        newDepthMap.set(item[idProperty], depth);

        if (!collapsedIds.includes(item[idProperty])) {
          dive(item[childrenProperty], depth + 1);
        }
      }
    };

    dive(list);

    return { flatList: newFlatList, depthMap: newDepthMap };
  }, [childrenProperty, collapsedIds, idProperty, list]);

  const toggleCollapsedId = React.useCallback((id: any) => {
    setCollapsedIds((prev) => {
      const next = [...prev];
      const index = next.indexOf(id);

      if (index === -1) {
        next.push(id);
      } else {
        next.splice(index, 1);
      }

      return next;
    });
  }, []);

  const findPathToId = React.useCallback(
    (id: any, list: any[], path: any[] = []): any[] | void => {
      for (const item of list) {
        if (item[idProperty] === id) return path;

        const found = findPathToId(id, item[childrenProperty], [...path, item]);

        if (found) return found;
      }
    },
    [childrenProperty, idProperty]
  );

  React.useImperativeHandle(
    ref,
    () => {
      return {
        getCollapsed(id) {
          return collapsedIds.includes(id);
        },
        setCollapsed(id, collapse, fullPath = false) {
          setCollapsedIds((prev) => {
            const next = [...prev];
            const index = next.indexOf(id);

            const ids = fullPath
              ? findPathToId(id, list)?.map((item) => item[idProperty]) || []
              : [id];

            for (const itemId of ids) {
              if (collapse && index !== -1) {
                next.splice(index, 1);
              } else if (!collapse && index === -1) {
                next.push(itemId);
              }
            }

            return next;
          });
        },
        scrollTo(id, expand = false) {
          const index = flatList.findIndex((item) => item[idProperty] === id);

          if (index === -1) {
            if (!expand) return;

            const path = findPathToId(id, list);

            if (path) {
              setCollapsedIds((prev) => {
                const next = [...prev];

                for (const node of path) {
                  const index = next.indexOf(node[idProperty]);

                  if (index !== -1) {
                    next.splice(index, 1);
                  }
                }

                return next;
              });

              scrollToRef.current = id;
            }
          } else if (scrollRef.current) {
            scrollRef.current.scrollToItem(index);
          }
        },
      };
    },
    [collapsedIds, findPathToId, flatList, idProperty, list]
  );

  React.useLayoutEffect(() => {
    if (!scrollRef.current || !scrollToRef.current) return;

    const indexToScroll = flatList.findIndex(
      (item) => item[idProperty] === scrollToRef.current
    );

    if (indexToScroll !== -1) {
      scrollRef.current.scrollToItem(indexToScroll);
    }

    scrollToRef.current = undefined;
  }, [flatList, idProperty]);

  return (
    <FixedSizeList
      ref={scrollRef}
      className={classnames("TreeView", className)}
      layout="vertical"
      height={height}
      itemCount={flatList.length}
      itemSize={itemHeight}
      width={width}
    >
      {({ index, style }) => {
        const id = flatList[index][idProperty];
        const children = flatList[index][childrenProperty];
        const depth = depthMap.get(id) || 0;

        return (
          <Item
            className={itemClassName}
            hasChildren={Boolean(children.length)}
            collapsed={collapsedIds.includes(id)}
            onToggleCollapse={() => toggleCollapsedId(id)}
            collapseIcon={collapseIcon}
            expandIcon={expandIcon}
            index={index}
            id={id}
            item={flatList[index]}
            depth={depth}
            style={style}
          >
            {Children ? (
              <Children id={id} item={flatList[index]} depth={depth} />
            ) : null}
          </Item>
        );
      }}
    </FixedSizeList>
  );
});

export default TreeView;
