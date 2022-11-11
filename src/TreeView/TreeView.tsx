import classNames from "classnames";
import React from "react";
import { FixedSizeList } from "react-window";
import TreeViewItem, {
  ItemViewContext,
  ItemViewWrapper,
  TreeViewItemComponent,
} from "./TreeViewtem";
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
  scrollTo(id: any, expand?: boolean, focus?: boolean): void;
};

const TreeView = React.forwardRef<
  TreeViewRef,
  Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    /** Root-level items. */
    list: any[];
    /** Property name of item with uniq id. */
    idProperty: string;
    /** Property name of item with children array. Array is required. */
    childrenProperty: string;

    height: number;
    width: number;

    itemHeight?: number;

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
    itemHeight = 20,
    children: Children,
    itemComponent: Item = TreeViewItem,
    collapseIcon = defaultCollapseIcon,
    expandIcon = defaultExpandIcon,
    className,
    itemClassName,
    style,
    ...otherProps
  } = props;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<FixedSizeList>(null);
  const scrollToRef = React.useRef<any>();

  const [focusId, setFocusId] = React.useState<any>();
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
        if (item[idProperty] === id) return [...path, item];

        const found = findPathToId(id, item[childrenProperty], [...path, item]);

        if (found) return found;
      }
    },
    [childrenProperty, idProperty]
  );

  // Focus

  const focusById = React.useCallback((id: any) => {
    scrollToRef.current = id;
    containerRef.current?.focus({ preventScroll: true });
    setFocusId(id);
  }, []);

  const onFocus = React.useCallback<
    React.FocusEventHandler<HTMLDivElement>
  >(() => {
    if (flatList.length) {
      setFocusId(flatList[0][idProperty]);
    }
  }, [flatList, idProperty]);

  const onBlur = React.useCallback<
    React.FocusEventHandler<HTMLDivElement>
  >(() => {
    setFocusId(undefined);
  }, []);

  // Keyboard

  const onKeyDown = React.useCallback<
    React.KeyboardEventHandler<HTMLDivElement>
  >(
    (e) => {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/

      if (e.altKey || e.currentTarget !== e.target || !flatList.length) return;

      let processed = false;

      const focusIndex = flatList.findIndex(
        (item) => item[idProperty] === focusId
      );

      switch (e.key) {
        case "Enter": {
          toggleCollapsedId(focusId);
          processed = true;

          break;
        }
        case "ArrowDown": {
          if (focusIndex < flatList.length - 1) {
            focusById(flatList[focusIndex + 1][idProperty]);
            processed = true;
          }

          break;
        }
        case "ArrowUp": {
          if (focusIndex > 0) {
            focusById(flatList[focusIndex - 1][idProperty]);
            processed = true;
          }

          break;
        }
        case "ArrowRight": {
          const children: any[] = flatList[focusIndex][childrenProperty];

          if (children.length) {
            if (collapsedIds.includes(focusId)) {
              toggleCollapsedId(focusId);
            } else if (children.length) {
              focusById(children[0][idProperty]);
            }
          }

          processed = true;

          break;
        }
        case "ArrowLeft": {
          const children: any[] = flatList[focusIndex][childrenProperty];

          if (!children.length || collapsedIds.includes(focusId)) {
            const path = findPathToId(focusId, list);

            if (path && path.length > 1) {
              focusById(path.at(-2)[idProperty]);
            }
          } else if (children.length) {
            toggleCollapsedId(focusId);
          }

          processed = true;

          break;
        }
        case "Home": {
          focusById(flatList.at(0)[idProperty]);
          processed = true;

          break;
        }
        case "End": {
          focusById(flatList.at(-1)[idProperty]);
          processed = true;

          break;
        }
      }

      if (processed) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [
      childrenProperty,
      collapsedIds,
      findPathToId,
      flatList,
      focusById,
      focusId,
      idProperty,
      list,
      toggleCollapsedId,
    ]
  );

  // Self ref

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
              if (!collapse && index !== -1) {
                next.splice(index, 1);
              } else if (collapse && index === -1) {
                next.push(itemId);
              }
            }

            return next;
          });
        },
        scrollTo(id, expand = false, focus = false) {
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

              if (focus) {
                focusById(id);
              } else {
                scrollToRef.current = id;
              }
            }
          } else if (scrollRef.current) {
            scrollRef.current.scrollToItem(index);
          }
        },
      };
    },
    [collapsedIds, findPathToId, flatList, focusById, idProperty, list]
  );

  // Effects

  React.useLayoutEffect(() => {
    if (!scrollRef.current || !scrollToRef.current) return;

    const indexToScroll = flatList.findIndex(
      (item) => item[idProperty] === scrollToRef.current
    );

    if (indexToScroll !== -1) {
      scrollRef.current.scrollToItem(indexToScroll);
    }

    scrollToRef.current = undefined;
  });

  return (
    <div
      ref={containerRef}
      role="tree"
      tabIndex={0}
      className={classNames("TreeView", className)}
      style={{ ...style, width, height }}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      {...otherProps}
    >
      <ItemViewContext.Provider
        value={{
          childrenProperty,
          collapsedIds,
          collapseIcon,
          depthMap,
          expandIcon,
          flatList,
          focusId,
          idProperty,
          itemComponent: Item,
          toggleCollapsedId,
          itemClassName,
          childrenComponent: Children,
          focusById,
          width,
          itemHeight,
        }}
      >
        <FixedSizeList
          ref={scrollRef}
          className="TreeView-Scroll"
          layout="vertical"
          height={height}
          itemCount={flatList.length}
          itemSize={itemHeight}
          width={width}
        >
          {ItemViewWrapper}
        </FixedSizeList>
      </ItemViewContext.Provider>
    </div>
  );
});

export default TreeView;
