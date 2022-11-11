import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import TreeView from "./TreeView";

describe("<TreeView />", () => {
  it("should receive focus", () => {
    render(
      <TreeView
        width={300}
        height={400}
        list={[]}
        childrenProperty=""
        idProperty=""
      />
    );

    const focusFn = jest.fn();

    screen.getByRole("tree").addEventListener("focus", focusFn);

    act(() => {
      screen.getByRole("tree").focus();
    });

    expect(focusFn).toHaveBeenCalled();
  });

  it("should have controlled by keyboard", () => {
    cleanup();

    render(
      <TreeView
        width={300}
        height={400}
        list={[
          { i: 1, c: [] },
          {
            i: 2,
            c: [
              { i: 3, c: [{ i: 4, c: [] }] },
              { i: 5, c: [] },
              { i: 6, c: [] },
            ],
          },
        ]}
        idProperty="i"
        childrenProperty="c"
      >
        {({ item }) => <>item:{item.i}</>}
      </TreeView>
    );

    const tree = screen.getByRole("tree");

    act(() => {
      tree.focus();
    });

    fireEvent.keyDown(tree, { key: "ArrowDown" });

    expect(screen.getByText("item:2")).toHaveClass("focused");

    fireEvent.keyDown(tree, { key: "ArrowDown" });

    expect(screen.getByText("item:3")).toHaveClass("focused");

    fireEvent.keyDown(tree, { key: "ArrowRight" });

    expect(screen.getByText("item:4")).toHaveClass("focused");

    fireEvent.keyDown(tree, { key: "ArrowDown" });

    expect(screen.getByText("item:5")).toHaveClass("focused");

    fireEvent.keyDown(tree, { key: "ArrowLeft" });

    expect(screen.getByText("item:2")).toHaveClass("focused");

    fireEvent.keyDown(tree, { key: "ArrowLeft" });

    expect(screen.getByText("item:2")).toHaveClass("focused");

    expect(screen.getAllByRole("treeitem")).toHaveLength(2);
  });
});
