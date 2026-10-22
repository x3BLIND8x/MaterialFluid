import { beforeAll, afterEach, afterAll, it, expect, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import App from "../src/showcase/App";

const initialWidth = window.innerWidth;
beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({matches:false, addEventListener:vi.fn(), removeEventListener:vi.fn()})) });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => { cleanup(); localStorage.clear(); });
afterAll(() => { Object.defineProperty(window, "innerWidth", {configurable:true, value:initialWidth}); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("collapses the desktop menu while leaving its family links accessible", async () => {
  window.history.replaceState({}, "", "/#/components/avatar");
  render(<App />);
  await screen.findByRole("heading", {name:"Avatar", level:1});
  const collapse = screen.getByRole("button", {name:"Collapse navigation"});
  fireEvent.click(collapse);
  expect(screen.getByRole("button", {name:"Expand navigation"}).getAttribute("aria-expanded")).toBe("false");
  expect(screen.getByRole("navigation", {name:"Component families"})).not.toBeNull();
  expect(document.getElementById("desktop-component-menu")?.hidden).toBe(true);
  fireEvent.click(screen.getByRole("button", {name:"Expand navigation"}));
  expect(document.getElementById("desktop-component-menu")?.hidden).toBe(false);
});

it("moves global actions into a three-dot popover on narrow screens", async () => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value:375 });
  window.history.replaceState({}, "", "/#/components/badge");
  render(<App />);
  await screen.findByRole("heading", {name:"Badge", level:1});
  expect(screen.queryByRole("button", {name:"Change appearance"})).toBeNull();
  fireEvent.click(screen.getByRole("button", {name:"More options"}));
  const menu = screen.getByRole("dialog", {name:"Quick settings"});
  expect(within(menu).getByRole("button", {name:"Change appearance"})).not.toBeNull();
  expect(within(menu).getByRole("button", {name:"Showcase preferences"})).not.toBeNull();
});

it.each(["card", "list", "avatar", "badge", "accordion", "divider", "data-table", "toast", "notification-center", "progress", "dialog", "alert-dialog", "drawer", "bottom-sheet", "popover", "menu", "tooltip"])("renders the %s page once instead of a six-variant grid", async route => {
  window.history.replaceState({}, "", `/#/components/${route}`);
  const { container } = render(<App />);
  await screen.findByRole("heading", {level:1});
  // Wait for the lazy example rather than merely the page shell.
  await vi.waitFor(() => expect(container.querySelector(".demo-primary")).not.toBeNull());
  expect(container.querySelectorAll(".demo-primary")).toHaveLength(1);
  expect(screen.queryByRole("alert")).toBeNull();
});
