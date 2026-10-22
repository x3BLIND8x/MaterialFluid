import { DatePicker } from "../src/kit/dates";
import { materialIcons as controlIcons } from "../src/kit/icon-map";
import { fitNotificationCount, notificationBudget } from "../src/kit/notification-layout";
import { beforeAll, afterAll, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, cleanup, within, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MaterialFluidProvider } from "../src/kit/provider";
import { Avatar, AvatarGroup, Badge, Accordion, DataTable } from "../src/kit/surfaces";
import { NotificationCenter, Toast, Progress, useNotifications } from "../src/kit/feedback";
import { Button } from "../src/kit/controls";
import { Dialog, Menu, BottomSheet } from "../src/kit/overlays";
import type { ColumnDef } from "@tanstack/react-table";

const pointerDescriptors = ["hasPointerCapture", "setPointerCapture", "releasePointerCapture"].map(name => [name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)] as const);
beforeAll(() => {
  vi.stubGlobal("PointerEvent", class extends MouseEvent {
    pointerId: number; isPrimary: boolean; pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId ?? 0; this.isPrimary = init.isPrimary ?? false; this.pointerType = init.pointerType ?? ""; }
  });
  for (const [name] of pointerDescriptors) Object.defineProperty(HTMLElement.prototype, name, { configurable: true, value: name === "hasPointerCapture" ? () => false : () => {} });
  Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
});
afterEach(cleanup);
afterAll(() => {
  vi.unstubAllGlobals();
  for (const [name, descriptor] of pointerDescriptors) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLElement.prototype, name);
  }
});

describe("surface behavior", () => {
  it("keeps avatar sizes explicit and stacks excess teammates behind a count", () => {
    render(<MaterialFluidProvider motion="minimal"><Avatar name="Nora Chen" size="sm" /><AvatarGroup label="Project team" max={2} size="lg"><Avatar name="Arman Rezaei" /><Avatar name="Sara Wilson" /><Avatar name="Mina Park" /></AvatarGroup><Badge>New</Badge><Badge tone="success">Active</Badge></MaterialFluidProvider>);
    expect(screen.getByRole("img", { name: "Nora Chen" }).classList.contains("mf-avatar--sm")).toBe(true);
    expect(screen.getByRole("group", {name:"Project team"}).classList.contains("mf-scale--lg")).toBe(true);
    expect(screen.getByRole("img", {name:"1 Project team"}).textContent).toBe("+1");
    expect(screen.queryByRole("img", {name:"Mina Park"})).toBeNull();
    expect(screen.getByText("New").classList.contains("mf-tone--primary")).toBe(true);
    expect(screen.getByText("Active").classList.contains("mf-tone--success")).toBe(true);
  });
  it("opens and closes an accordion using the keyboard", async () => {
    render(<MaterialFluidProvider motion="minimal"><Accordion items={[{value:"details", title:"Details", content:"Project information"}]} /></MaterialFluidProvider>);
    const trigger = screen.getByRole("button", {name:"Details"});
    trigger.focus();
    const user = userEvent.setup();
    await user.keyboard("{Enter}");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region", {name:"Details"}).textContent).toBe("Project information");
    await user.keyboard(" ");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
  it("shows a partial table selection as a minus and selects all from that state", async () => {
    type Row = { id: string; name: string };
    const data: Row[] = [{id:"1",name:"Nora"},{id:"2",name:"Arman"}];
    const columns: ColumnDef<Row>[] = [{accessorKey:"name",header:"Name"}];
    render(<MaterialFluidProvider motion="minimal"><DataTable caption="Team" data={data} columns={columns} getRowId={row => row.id} /></MaterialFluidProvider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox", {name:"Select row 1"}));
    const header = screen.getByRole("checkbox", {name:"Select all rows"});
    expect(header.getAttribute("aria-checked")).toBe("mixed");
    expect(header.querySelector('[data-icon-name="minus"]')).not.toBeNull();
    await user.click(header);
    expect(header.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("checkbox", {name:"Select row 2"}).getAttribute("aria-checked")).toBe("true");
  });
});

describe("notification queue and history", () => {
  it("fits toast height, queues overflow, and closes overlays when history opens", async () => {
    function Demo() {
      const { notify } = useNotifications();
      return <><Button onClick={() => { for (let index = 1; index <= 8; index++) notify({title:`Update ${index}`,duration:60000}); }}>Notify</Button><NotificationCenter trigger={<Button>History</Button>} /></>;
    }
    render(<MaterialFluidProvider motion="minimal"><Demo /></MaterialFluidProvider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", {name:"Notify"}));
    await waitFor(() => expect(document.querySelectorAll(".mf-toast").length).toBeGreaterThan(3));
    const visibleCount = document.querySelectorAll(".mf-toast").length;
    expect(visibleCount).toBeLessThan(8);
    expect(screen.queryByText(`Update ${visibleCount + 1}`)).toBeNull();
    expect(screen.getByRole("button", {name:/more notifications/})).not.toBeNull();
    await user.click(screen.getAllByRole("button", {name:"Dismiss notification"})[0]);
    await waitFor(() => expect(screen.getByText(`Update ${visibleCount + 1}`)).not.toBeNull());
    expect(document.querySelectorAll(".mf-toast")).toHaveLength(visibleCount);
    await user.click(screen.getByRole("button", {name:"History"}));
    const center = screen.getByRole("dialog", {name:"Notification center"});
    expect(within(center).getByText("Update 1")).not.toBeNull();
    expect(within(center).getAllByRole("listitem")).toHaveLength(8);
    expect(document.querySelectorAll(".mf-toast")).toHaveLength(0);
    await user.click(within(center).getByRole("button", {name:"Clear all"}));
    expect(within(center).getByText("You're all caught up")).not.toBeNull();
    expect(document.querySelectorAll(".mf-toast")).toHaveLength(0);
  });
  it("supports image previews, copy actions, and a reply composer", async () => {
    const copied = vi.fn();
    const replied = vi.fn();
    function Demo() {
      const { notify } = useNotifications();
      return <><Button onClick={() => notify({title:"Design review",image:{src:"/preview.svg",alt:"Design preview"},actions:[{label:"Copy code",onClick:copied}],onReply:replied,duration:60000})}>Notify</Button><NotificationCenter trigger={<Button>History</Button>} /></>;
    }
    render(<MaterialFluidProvider motion="minimal"><Demo /></MaterialFluidProvider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", {name:"Notify"}));
    await user.click(screen.getByRole("button", {name:"History"}));
    const center = within(screen.getByRole("dialog", {name:"Notification center"}));
    expect(center.getByRole("img", {name:"Design preview"}).getAttribute("src")).toBe("/preview.svg");
    await user.click(center.getByRole("button", {name:"Copy code"}));
    expect(copied).toHaveBeenCalledOnce();
    await user.click(center.getByRole("button", {name:"Reply"}));
    await user.type(center.getByRole("textbox", {name:"Your reply"}), "Looks good");
    await user.click(center.getByRole("button", {name:"Send reply"}));
    expect(replied).toHaveBeenCalledWith("Looks good");
  });
  it("preserves the controlled Toast dismissal callback", async () => {
    const changed = vi.fn();
    render(<MaterialFluidProvider motion="minimal"><Toast open onOpenChange={changed} title="Saved" duration={60000} /></MaterialFluidProvider>);
    await userEvent.setup().click(await screen.findByRole("button", {name:"Dismiss notification"}));
    expect(changed).toHaveBeenCalledWith(false);
  });
});

describe("single overlay treatment", () => {
  it("uses a Ghost close button and returns focus to the dialog trigger", async () => {
    render(<MaterialFluidProvider motion="minimal"><Dialog title="Edit project" description="Project settings" variant="danger" trigger={<Button>Edit</Button>}>Details</Dialog></MaterialFluidProvider>);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", {name:"Edit"});
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", {name:"Edit project"});
    expect(dialog.classList.contains("mf-variant--outline")).toBe(true);
    expect(within(dialog).getByRole("button", {name:"Close"}).classList.contains("mf-variant--ghost")).toBe(true);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
  it("opens a keyboard menu with the single neutral treatment", async () => {
    const selected = vi.fn();
    render(<MaterialFluidProvider motion="minimal"><Menu variant="danger" trigger={<Button>Actions</Button>} items={[{id:"copy",label:"Copy",onSelect:selected}]} /></MaterialFluidProvider>);
    const trigger = screen.getByRole("button", {name:"Actions"});
    trigger.focus();
    const user = userEvent.setup();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menu").classList.contains("mf-variant--outline")).toBe(true);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("menuitem", {name:"Copy"})));
    await user.keyboard("{Enter}");
    expect(selected).toHaveBeenCalledOnce();
  });
});


describe("height budget and progress timeline", () => {
  it("fits more compact notifications than tall notifications into the same space", () => {
    const budget = notificationBudget(768);
    expect(fitNotificationCount(Array(8).fill(80), budget)).toBe(5);
    expect(fitNotificationCount(Array(8).fill(240), budget)).toBe(1);
    expect(fitNotificationCount([], budget)).toBe(0);
    expect(fitNotificationCount([600], 160)).toBe(1);
  });
  it("keeps the timed droplet mounted across progress updates", () => {
    const {container, rerender} = render(<MaterialFluidProvider motion="expressive"><Progress label="Upload" value={20} /></MaterialFluidProvider>);
    const droplet = container.querySelector(".mf-progress-droplet");
    expect(droplet).not.toBeNull();
    rerender(<MaterialFluidProvider motion="expressive"><Progress label="Upload" value={40} /></MaterialFluidProvider>);
    expect(container.querySelector(".mf-progress-droplet")).toBe(droplet);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("40");
  });
});

describe("table sorting, filtering, and column sizing", () => {
  const data = [{id:"1",name:"Nora",role:"Designer"},{id:"2",name:"Arman",role:"Developer"},{id:"3",name:"Sara",role:"Designer"}];
  const columns: ColumnDef<(typeof data)[number]>[] = [{accessorKey:"name",header:"Name"},{accessorKey:"role",header:"Role"}];
  it("changes the sort glyph and preserves widths across pagination", async () => {
    const {container} = render(<MaterialFluidProvider motion="minimal"><DataTable caption="Team" data={data} columns={columns} pageSize={1} /></MaterialFluidProvider>);
    const user = userEvent.setup();
    const sort = screen.getByRole("button", {name:"Name"});
    await user.click(sort);
    expect(sort.closest("th")?.getAttribute("aria-sort")).toBe("ascending");
    expect(sort.querySelector('[data-icon-name="arrow_upward"]')).not.toBeNull();
    await user.click(sort);
    expect(sort.closest("th")?.getAttribute("aria-sort")).toBe("descending");
    expect(sort.querySelector('[data-icon-name="arrow_downward"]')).not.toBeNull();
    const width = container.querySelector("colgroup")?.innerHTML;
    await user.click(screen.getByRole("button", {name:"Next"}));
    expect(container.querySelector("colgroup")?.innerHTML).toBe(width);
    const handle = screen.getByRole("separator", {name:"Resize Role"});
    handle.focus();
    const originalWidth = Number(handle.getAttribute("aria-valuenow"));
    await user.keyboard("{ArrowLeft}");
    expect(Number(handle.getAttribute("aria-valuenow"))).toBe(originalWidth + 10);
    await user.dblClick(handle);
    expect(Number(handle.getAttribute("aria-valuenow"))).toBeLessThan(originalWidth);
  });
  it("filters individual columns by text or selected values", async () => {
    render(<MaterialFluidProvider motion="minimal"><DataTable caption="Team" data={data} columns={columns} filterable /></MaterialFluidProvider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", {name:"Filter Name"}));
    const popup = within(screen.getByRole("dialog", {name:"Filter Name"}));
    await user.type(popup.getByRole("searchbox", {name:"Search Name"}), "Nora");
    expect(screen.getByRole("cell", {name:"Nora"})).not.toBeNull();
    expect(screen.queryByRole("cell", {name:"Arman"})).toBeNull();
    await user.click(popup.getByRole("button", {name:"Clear filter"}));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", {name:"Filter Role"}));
    await user.click(screen.getByRole("option", {name:"Designer"}));
    expect(screen.getByRole("cell", {name:"Nora"})).not.toBeNull();
    expect(screen.getByRole("cell", {name:"Sara"})).not.toBeNull();
    expect(screen.queryByRole("cell", {name:"Arman"})).toBeNull();
  });
});


describe("picker and control glyph regressions", () => {
  it("includes overflow, rail, sort, and filter glyphs in the startup pack", () => {
    for (const name of ["more_vert", "touch_app", "edit_note", "tab", "dashboard", "notifications", "layers", "category", "arrow_upward", "arrow_downward", "unfold_more", "filter_list"]) {
      expect(controlIcons[name]?.symbol).toBe(name);
    }
  });
  it("navigates date overlay month and year views and restores field focus", async () => {
    render(<MaterialFluidProvider motion="minimal"><DatePicker label="Start date" calendar="gregorian" defaultValue="2026-10-14" /></MaterialFluidProvider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", {name:"Choose date"}));
    const overlay = within(screen.getByRole("dialog", {name:"Start date"}));
    await user.click(overlay.getByRole("button", {name:"October"}));
    expect(overlay.getByRole("group", {name:"Choose month"})).not.toBeNull();
    await user.click(overlay.getByRole("button", {name:"November, 11"}));
    expect(overlay.getByRole("button", {name:"November"})).not.toBeNull();
    await user.click(overlay.getByRole("button", {name:"2026"}));
    fireEvent.change(overlay.getByRole("spinbutton"), {target:{value:"2028"}});
    await user.click(overlay.getByRole("button", {name:"Apply year"}));
    expect(overlay.getByRole("button", {name:"2028"})).not.toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", {name:"Start date"})).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("textbox", {name:"Start date"}));
  });
  it("keeps incoming notifications in history while the center is open", async () => {
    const changed = vi.fn();
    const {rerender} = render(<MaterialFluidProvider motion="minimal"><Toast open={false} title="Incoming" onOpenChange={changed} /><NotificationCenter defaultOpen /></MaterialFluidProvider>);
    rerender(<MaterialFluidProvider motion="minimal"><Toast open title="Incoming" onOpenChange={changed} /><NotificationCenter defaultOpen /></MaterialFluidProvider>);
    expect(await within(screen.getByRole("dialog", {name:"Notification center"})).findByText("Incoming")).not.toBeNull();
    expect(document.querySelectorAll(".mf-toast")).toHaveLength(0);
    expect(changed).toHaveBeenCalledWith(false);
  });
});


describe("avatar names and notification read marks", () => {
  it("shows the avatar name in a keyboard tooltip", async () => {
    render(<MaterialFluidProvider motion="minimal"><Avatar name="Nora Chen" /></MaterialFluidProvider>);
    screen.getByRole("img", {name:"Nora Chen"}).focus();
    expect((await screen.findByRole("tooltip")).textContent).toBe("Nora Chen");
  });
  it("changes an individual notification from the unread icon to a read icon", async () => {
    function Demo() { const {notify} = useNotifications(); return <><Button onClick={() => notify({title:"A message"})}>Notify</Button><NotificationCenter trigger={<Button>History</Button>} /></>; }
    render(<MaterialFluidProvider motion="minimal"><Demo /></MaterialFluidProvider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", {name:"Notify"}));
    await user.click(screen.getByRole("button", {name:"History"}));
    const center = within(screen.getByRole("dialog", {name:"Notification center"}));
    await user.click(center.getByRole("button", {name:"Mark as read"}));
    expect(center.getByRole("img", {name:"Read"}).querySelector('[data-icon-name="check-check"]')).not.toBeNull();
  });
});

describe("bottom sheet dragging", () => {
  const pointer = (element: HTMLElement, type: string, y: number, kind = "mouse") => fireEvent(element, new PointerEvent(type, {bubbles:true,button:0,clientY:y,pointerId:1,pointerType:kind}));
  it.each(["mouse", "touch"])("follows a %s drag and dismisses on release", async kind => {
    render(<MaterialFluidProvider motion="minimal"><BottomSheet title="Project" description="Settings" defaultOpen>Content</BottomSheet></MaterialFluidProvider>);
    const sheet = screen.getByRole("dialog", {name:"Project"});
    const grip = screen.getByRole("button", {name:"Resize sheet"});
    pointer(grip,"pointerdown",100,kind);
    pointer(sheet,"pointermove",200,kind);
    expect(sheet.style.translate).toBe("0 100px");
    pointer(sheet,"pointerup",200,kind);
    await waitFor(() => expect(screen.queryByRole("dialog", {name:"Project"})).toBeNull());
  });
  it("expands upward, collapses with the keyboard, and survives cancellation", async () => {
    render(<MaterialFluidProvider motion="minimal"><BottomSheet title="Project" description="Settings" defaultOpen>Content</BottomSheet></MaterialFluidProvider>);
    const sheet = screen.getByRole("dialog", {name:"Project"});
    const grip = screen.getByRole("button", {name:"Resize sheet"});
    pointer(grip,"pointerdown",200);
    pointer(sheet,"pointermove",120);
    pointer(sheet,"pointerup",120);
    expect(grip.getAttribute("aria-expanded")).toBe("true");
    grip.focus();
    await userEvent.setup().keyboard("{ArrowDown}");
    expect(grip.getAttribute("aria-expanded")).toBe("false");
    pointer(grip,"pointerdown",100);
    pointer(sheet,"pointermove",150);
    pointer(sheet,"pointercancel",150);
    expect(screen.getByRole("dialog", {name:"Project"})).not.toBeNull();
  });
});
