import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { createRef, useState, type ReactNode } from "react";
import {
  Switch,
  type SwitchHandle,
  type SwitchChangePayload,
} from "../src/kit/switch";
import { MaterialFluidProvider } from "../src/kit/provider";
import {
  switchDefaults,
  switchPresets,
  applySwitchPreset,
  switchExampleCode,
} from "../src/showcase/switch-playground-model";
beforeAll(() =>
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi
      .fn()
      .mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
  }),
);
afterEach(cleanup);
const wrap = (children: ReactNode) => (
  <MaterialFluidProvider motion="minimal">{children}</MaterialFluidProvider>
);
describe("Switch reference additions", () => {
  it("retains native button refs, a real form input and label activation without double SVG changes", () => {
    const ref = createRef<SwitchHandle>(),
      changed = vi.fn();
    render(wrap(<Switch ref={ref} label="Sync" onChange={changed} />));
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current!.input).toBeInstanceOf(HTMLInputElement);
    fireEvent.click(screen.getByText("Sync"));
    expect(ref.current!.isChecked()).toBe(true);
    const glyph = ref.current!.querySelector("svg")!;
    fireEvent.click(glyph);
    expect(ref.current!.isChecked()).toBe(false);
    expect(changed).toHaveBeenCalledTimes(2);
  });
  it("keeps programmatic methods silent, chainable and immediately current", () => {
    const ref = createRef<SwitchHandle>(),
      changed = vi.fn<(event: SwitchChangePayload) => void>();
    render(wrap(<Switch ref={ref} label="Sync" onChange={changed} />));
    ref.current!.on("change", changed);
    act(() =>
      ref
        .current!.check()
        .uncheck()
        .toggle()
        .setValue("1")
        .setValueAttribute("yes"),
    );
    expect(ref.current!.getValue()).toBe(true);
    expect(ref.current!.getValueAttribute()).toBe("yes");
    expect(changed).not.toHaveBeenCalled();
    fireEvent.click(ref.current!);
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        checked: false,
        value: false,
        valueAttribute: "yes",
        nativeEvent: expect.objectContaining({ type: "change" }),
      }),
    );
  });
  it("activates Space and Enter once each, blocks repeats and honors prevented clicks", () => {
    const changed = vi.fn();
    render(wrap(<Switch label="Sync" onChange={changed} />));
    const box = screen.getByRole("switch");
    fireEvent.keyDown(box, { key: " " });
    expect(box.getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(box, { key: "Enter", repeat: true });
    expect(changed).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(box, { key: "Enter" });
    expect(box.getAttribute("aria-checked")).toBe("false");
    expect(changed).toHaveBeenCalledTimes(2);
  });
  it("keeps descriptions separate from names and preserves error when text is changed or removed", () => {
    const ref = createRef<SwitchHandle>();
    render(
      wrap(
        <Switch
          ref={ref}
          label="Sync"
          supportingText="Uses data"
          labelPosition="start"
        />,
      ),
    );
    expect(screen.getByRole("switch", { name: "Sync" })).toBeTruthy();
    expect(ref.current!.getAttribute("aria-describedby")).toBe(
      ref.current!.supportingTextElement!.id,
    );
    expect(ref.current!.element!.dataset.labelPosition).toBe("start");
    act(() => ref.current!.setError(true).setSupportingText("Offline"));
    expect(ref.current!.isError()).toBe(true);
    act(() => ref.current!.removeSupportingText());
    expect(ref.current!.supportingTextElement).toBeNull();
    expect(ref.current!.getAttribute("aria-describedby")).toBeNull();
    expect(ref.current!.getAttribute("aria-invalid")).toBe("true");
    act(() => ref.current!.setLabel("Renamed").setError(false));
    expect(screen.getByRole("switch", { name: "Renamed" })).toBeTruthy();
  });
  it("supports required validation, external forms and reset defaults", () => {
    const ref = createRef<SwitchHandle>();
    render(
      wrap(
        <>
          <form id="preferences" />
          <Switch
            ref={ref}
            label="Sync"
            name="sync"
            value="enabled"
            form="preferences"
            required
            defaultChecked
          />
        </>,
      ),
    );
    const form = document.querySelector("form")!;
    expect(new FormData(form).get("sync")).toBe("enabled");
    act(() => ref.current!.uncheck());
    expect(ref.current!.input!.checkValidity()).toBe(false);
    act(() => form.reset());
    expect(ref.current!.getValue()).toBe(true);
    expect(ref.current!.input!.checked).toBe(true);
  });
  it("reflects controlled state and supports both glyph slots and rich labels", () => {
    function Example() {
      const [checked, set] = useState(false);
      return (
        <Switch
          checked={checked}
          onCheckedChange={set}
          label={<strong>Sync</strong>}
          icon={<span data-testid="on">ON</span>}
          unselectedIcon={<span data-testid="off">OFF</span>}
        />
      );
    }
    render(wrap(<Example />));
    expect(screen.getByTestId("off")).toBeTruthy();
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "true",
    );
    expect(screen.getByTestId("on")).toBeTruthy();
  });
  it("subscribes focus/blur, unsubscribes, disables immediately and cleans up on destroy", () => {
    const ref = createRef<SwitchHandle>(),
      focused = vi.fn(),
      changed = vi.fn();
    render(wrap(<Switch ref={ref} ariaLabel="Sync" />));
    ref
      .current!.on("focus", focused)
      .on("change", changed)
      .off("change", changed);
    act(() => ref.current!.focus());
    expect(focused).toHaveBeenCalledTimes(1);
    act(() => ref.current!.disable());
    expect(ref.current!.input!.disabled).toBe(true);
    fireEvent.click(ref.current!);
    expect(ref.current!.getValue()).toBe(false);
    act(() => ref.current!.enable());
    fireEvent.click(ref.current!);
    expect(changed).not.toHaveBeenCalled();
    const handle = ref.current!;
    act(() => handle.destroy());
    expect(screen.queryByRole("switch")).toBeNull();
    act(() => handle.toggle());
  });
  it("generates both recipe formats, preserves escaping and all presets", () => {
    for (const [preset] of switchPresets) {
      const v = applySwitchPreset(preset, switchDefaults);
      expect(switchExampleCode(v, "react")).toContain("Switch");
      expect(switchExampleCode(v, "web")).toContain(
        "defineMaterialFluidSwitch",
      );
    }
    expect(
      switchExampleCode({ ...switchDefaults, label: 'A "B" <C>' }, "web"),
    ).toContain("&quot;B&quot; &lt;C&gt;");
  });
});
