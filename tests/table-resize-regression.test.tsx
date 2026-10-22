import { Component, Profiler, type ReactNode } from "react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { MaterialFluidProvider } from "../src/kit/provider";
import { DataTable } from "../src/kit/surfaces";
import type { ColumnDef } from "@tanstack/react-table";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
});
afterEach(cleanup);
class RenderLimit extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div role="alert">Unbounded table updates</div> : this.props.children; }
}
const rows = [{ name: "Nora", role: "Designer" }, { name: "Arman", role: "Developer" }];
const columns: ColumnDef<(typeof rows)[number]>[] = [{ accessorKey: "name", header: "Name" }, { accessorKey: "role", header: "Role" }];
it("settles after resizing with column filters disabled", async () => {
  let commits = 0;
  render(<MaterialFluidProvider motion="minimal"><RenderLimit><Profiler id="table" onRender={() => { if (++commits > 25) throw new Error("Unbounded table updates"); }}><DataTable caption="Team" data={rows} columns={columns} /></Profiler></RenderLimit></MaterialFluidProvider>);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
  const handle = screen.getByRole("separator", { name: "Resize Role" });
  fireEvent.keyDown(handle, { key: "ArrowLeft" });
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 150)); });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(commits).toBeLessThan(25);
  expect(handle.getAttribute("aria-valuenow")).toBe("230");
});

function pointer(element: HTMLElement, type: string, x: number, id = 1) {
  const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x });
  Object.defineProperty(event, "pointerId", { value: id });
  fireEvent(element, event);
}

it.each([false, true])("settles after pointer resizing with filters enabled=%s", async filterable => {
  let commits = 0;
  render(<MaterialFluidProvider motion="minimal"><RenderLimit><Profiler id="table" onRender={() => { if (++commits > 25) throw new Error("Unbounded table updates"); }}><DataTable caption="Team" data={rows} columns={columns} filterable={filterable} /></Profiler></RenderLimit></MaterialFluidProvider>);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
  const handle = screen.getByRole("separator", { name: "Resize Role" });
  const release = vi.fn();
  Object.defineProperties(handle, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => true }, releasePointerCapture: { value: release } });
  pointer(handle, "pointerdown", 100);
  pointer(handle, "pointermove", 130);
  // Releasing another touch must not end the active drag.
  pointer(handle, "pointerup", 130, 2);
  pointer(handle, "pointermove", 150);
  pointer(handle, "pointerup", 150);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 150)); });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(handle.getAttribute("aria-valuenow")).toBe("170");
  expect(release).toHaveBeenCalledExactlyOnceWith(1);
  pointer(handle, "pointermove", 180);
  expect(handle.getAttribute("aria-valuenow")).toBe("170");
  pointer(handle, "pointerdown", 150);
  pointer(handle, "pointercancel", 150);
  pointer(handle, "pointermove", 200);
  expect(handle.getAttribute("aria-valuenow")).toBe("170");
  expect(commits).toBeLessThan(25);
});

it("settles after double-click auto-fit and retains pagination", async () => {
  let commits = 0;
  render(<MaterialFluidProvider motion="minimal"><RenderLimit><Profiler id="table" onRender={() => { if (++commits > 25) throw new Error("Unbounded table updates"); }}><DataTable caption="Team" data={rows} columns={columns} pageSize={1} /></Profiler></RenderLimit></MaterialFluidProvider>);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
  const handle = screen.getByRole("separator", { name: "Resize Role" });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.doubleClick(handle);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 150)); });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(handle.getAttribute("aria-valuenow")).toBe("120");
  expect(screen.getByRole("cell", { name: "Arman" })).not.toBeNull();
  expect(commits).toBeLessThan(25);
});

it("keeps the leading column flexible while a trailing column grows from its left edge", () => {
  const extraColumns: ColumnDef<(typeof rows)[number]>[] = [...columns, {id:"status",header:"Status",accessorFn:() => "Active"}];
  const {container} = render(<MaterialFluidProvider motion="minimal"><DataTable caption="Team" data={rows} columns={extraColumns} /></MaterialFluidProvider>);
  const cols = container.querySelectorAll<HTMLTableColElement>("col[data-anchor]");
  expect(cols[0].style.width).toBe("");
  expect(cols[1].style.width).toBe("220px");
  const handle = screen.getByRole("separator", {name:"Resize Role"});
  Object.defineProperties(handle, {setPointerCapture:{value:vi.fn()},hasPointerCapture:{value:() => false}});
  pointer(handle,"pointerdown",100);
  pointer(handle,"pointermove",70);
  pointer(handle,"pointerup",70);
  expect(cols[1].style.width).toBe("250px");
  expect(cols[2].style.width).toBe("220px");
  expect(cols[0].style.width).toBe("");
  expect(screen.queryByRole("separator", {name:"Resize Name"})).toBeNull();
});
