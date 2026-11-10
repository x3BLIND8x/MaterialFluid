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
  RadioGroup,
  Radios,
  Radio,
  Checkbox,
  Switch,
  type CheckboxHandle,
  type SwitchHandle,
  type RadioGroupHandle,
  type RadiosChangePayload,
} from "../src/kit/controls";
import { MaterialFluidProvider } from "../src/kit/provider";
import {
  radiosDefaults,
  radiosPresets,
  applyRadiosPreset,
  radiosExampleCode,
} from "../src/showcase/radios-playground-model";
beforeAll(() =>
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  }),
);
afterEach(cleanup);
const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Gamma", disabled: true },
  ],
  wrap = (children: ReactNode) => (
    <MaterialFluidProvider motion="minimal">{children}</MaterialFluidProvider>
  );
describe("Radio source API", () => {
  it("stops native change callbacks immediately when checkable handles are destroyed", () => {
    const group = createRef<RadioGroupHandle>(),
      checkbox = createRef<CheckboxHandle>(),
      toggle = createRef<SwitchHandle>(),
      changed = vi.fn();
    render(
      wrap(
        <>
          <RadioGroup
            ref={group}
            label="Group"
            options={options}
            onChange={changed}
          />
          <Checkbox ref={checkbox} label="Check" onChange={changed} />
          <Switch ref={toggle} label="Switch" onChange={changed} />
        </>,
      ),
    );
    const inputs = [
      group.current!.radios[0].input,
      checkbox.current!.input!,
      toggle.current!.input!,
    ];
    act(() => {
      group.current!.destroy();
      checkbox.current!.destroy();
      toggle.current!.destroy();
      for (const input of inputs) {
        input.checked = true;
        fireEvent.change(input);
        fireEvent.click(input);
      }
    });
    expect(changed).not.toHaveBeenCalled();
  });
  it("keeps native Enter form submission separate from selection in the reference alias", () => {
    let action: FormDataEntryValue | null = null;
    const changed = vi.fn(),
      submit = vi.fn((event: React.FormEvent) => {
        event.preventDefault();
        action = new FormData(
          event.currentTarget as HTMLFormElement,
          (event.nativeEvent as SubmitEvent).submitter,
        ).get("action");
      });
    render(
      wrap(
        <form onSubmit={submit}>
          <Radios
            label="Choice"
            options={options}
            defaultValue="a"
            onChange={changed}
          />
          <button type="submit" name="action" value="go">
            Save
          </button>
        </form>,
      ),
    );
    fireEvent.keyDown(screen.getByRole("radio", { name: "Beta" }), {
      key: "Enter",
    });
    expect(submit).toHaveBeenCalledTimes(1);
    expect(action).toBe("go");
    expect(
      screen.getByRole("radio", { name: "Alpha" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(changed).not.toHaveBeenCalled();
  });
  it("keeps nullable source model updates distinct from a blank option", () => {
    const ref = createRef<RadioGroupHandle>(),
      changed = vi.fn();
    function Example() {
      const [value, set] = useState<string | null>("a");
      return (
        <Radios
          ref={ref}
          label="Choice"
          options={[{ value: "", label: "None" }, ...options]}
          value={value}
          onValueChange={set}
          onChange={changed}
        />
      );
    }
    render(wrap(<Example />));
    act(() => ref.current!.setValue(null));
    expect(
      screen
        .getAllByRole("radio")
        .every((item) => item.getAttribute("aria-checked") === "false"),
    ).toBe(true);
    expect(changed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("None"));
    expect(
      screen.getByRole("radio", { name: "None" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(changed.mock.calls[0][0].value).toBeNull();
  });
  it("generates both recipes for each preset and escapes author content", () => {
    for (const [preset] of radiosPresets) {
      const example = applyRadiosPreset(preset, radiosDefaults);
      expect(radiosExampleCode(example, "react")).toContain("Radios");
      expect(radiosExampleCode(example, "web")).toContain(
        "defineMaterialFluidRadios",
      );
    }
    expect(
      radiosExampleCode({ ...radiosDefaults, label: 'A "B" <C>' }, "web"),
    ).toContain("&quot;B&quot; &lt;C&gt;");
  });
  it("preserves native group refs, native inputs and exact single change metadata", () => {
    const ref = createRef<RadioGroupHandle>(),
      changed = vi.fn<(event: RadiosChangePayload) => void>();
    render(
      wrap(
        <RadioGroup
          ref={ref}
          label="Choice"
          name="choice"
          options={options}
          onChange={changed}
        />,
      ),
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current!.radios).toHaveLength(3);
    const item = ref.current!.radios[1];
    fireEvent.click(screen.getByText("Beta"));
    expect(ref.current!.getValue()).toBe("b");
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][0]).toEqual({
      value: "b",
      option: expect.objectContaining({ value: "b", label: "Beta" }),
      originalEvent: expect.objectContaining({
        type: "change",
        target: item.input,
      }),
    });
    fireEvent.click(screen.getByText("Beta"));
    expect(changed).toHaveBeenCalledTimes(1);
  });
  it("keeps selection, clearing and unknown setters silent and round-trips null", () => {
    const ref = createRef<RadioGroupHandle>(),
      changed = vi.fn();
    render(
      wrap(
        <RadioGroup
          ref={ref}
          label="Choice"
          options={options}
          defaultValue="a"
        />,
      ),
    );
    ref.current!.on("change", changed);
    act(() => ref.current!.setValue("b"));
    expect(ref.current!.getValue()).toBe("b");
    expect(ref.current!.getSelected()?.label).toBe("Beta");
    act(() => ref.current!.setValue("unknown"));
    expect(ref.current!.getValue()).toBeNull();
    expect(ref.current!.radios.every((item) => !item.input.checked)).toBe(true);
    act(() => ref.current!.setValue(null));
    expect(changed).not.toHaveBeenCalled();
  });
  it("adds/removes options, clears removed selection and preserves per-option disable state", () => {
    const ref = createRef<RadioGroupHandle>();
    render(wrap(<RadioGroup ref={ref} label="Choice" options={options} />));
    act(() =>
      ref
        .current!.addOption({ value: "d", label: "Delta" })
        .setValue("d")
        .disable()
        .enableOption("c"),
    );
    expect(ref.current!.isDisabled()).toBe(true);
    expect(ref.current!.radios.every((item) => item.input.disabled)).toBe(true);
    act(() => ref.current!.enable().disableOption("b"));
    expect(ref.current!.radios.map((item) => item.input.disabled)).toEqual([
      false,
      true,
      false,
      false,
    ]);
    act(() => ref.current!.removeOption("d"));
    expect(ref.current!.getValue()).toBeNull();
    expect(screen.queryByRole("radio", { name: "Delta" })).toBeNull();
  });
  it("supports reference declarations, label placement and source versus compatibility orientation defaults", () => {
    const { rerender } = render(
      wrap(
        <Radios ariaLabel="Choice" name="choice">
          <>
            <Radio value="a" labelBefore>
              Alpha
            </Radio>
            <Radio value="b" label="Beta" disabled />
          </>
        </Radios>,
      ),
    );
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-orientation")).toBe("vertical");
    expect(
      screen.getByRole("radio", { name: "Alpha" }).closest("label")?.dataset
        .labelPosition,
    ).toBe("start");
    rerender(wrap(<RadioGroup label="Choice" options={options} />));
    expect(
      screen.getByRole("radiogroup").getAttribute("aria-orientation"),
    ).toBe("horizontal");
  });
  it("uses required native form values, external ownership and initial-state reset", () => {
    const ref = createRef<RadioGroupHandle>();
    render(
      wrap(
        <>
          <form id="choice-form" />
          <RadioGroup
            ref={ref}
            label="Choice"
            name="choice"
            form="choice-form"
            options={options}
            required
            defaultValue="a"
          />
        </>,
      ),
    );
    const form = document.querySelector("form")!;
    expect(new FormData(form).get("choice")).toBe("a");
    act(() => ref.current!.setValue(null));
    expect(form.checkValidity()).toBe(false);
    act(() => form.reset());
    expect(ref.current!.getValue()).toBe("a");
    expect(new FormData(form).get("choice")).toBe("a");
  });
  it("keeps one keyboard stop, skips disabled options and supports Home/End and RTL direction", () => {
    render(
      wrap(
        <RadioGroup
          label="Choice"
          options={options}
          dir="rtl"
          defaultValue="a"
        />,
      ),
    );
    const a = screen.getByRole("radio", { name: "Alpha" }),
      b = screen.getByRole("radio", { name: "Beta" });
    expect(a.tabIndex).toBe(0);
    expect(b.tabIndex).toBe(-1);
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(b.getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, { key: "End" });
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, { key: "Home" });
    expect(a.getAttribute("aria-checked")).toBe("true");
  });
  it("reflects controlled updates and reports returning to the initial value", () => {
    const changed = vi.fn();
    function Example() {
      const [value, set] = useState("a");
      return (
        <RadioGroup
          label="Choice"
          options={options}
          value={value}
          onValueChange={(value) => {
            changed(value);
            set(value);
          }}
        />
      );
    }
    render(wrap(<Example />));
    fireEvent.click(screen.getByText("Beta"));
    fireEvent.click(screen.getByText("Alpha"));
    expect(changed.mock.calls.map((call) => call[0])).toEqual(["b", "a"]);
    expect(
      screen.getByRole("radio", { name: "Alpha" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
  it("reports a blank option as null with its selected config and unsubscribes/destroys retained inputs", () => {
    const ref = createRef<RadioGroupHandle>(),
      changed = vi.fn();
    render(
      wrap(
        <RadioGroup
          ref={ref}
          label="Choice"
          options={[{ value: "", label: "None" }, ...options]}
          defaultValue="a"
        />,
      ),
    );
    ref.current!.on("change", changed);
    fireEvent.click(screen.getByText("None"));
    expect(changed.mock.calls[0][0].value).toBeNull();
    expect(ref.current!.getSelected()?.label).toBe("None");
    ref.current!.off("change", changed);
    fireEvent.click(screen.getByText("Beta"));
    expect(changed).toHaveBeenCalledTimes(1);
    const handle = ref.current!,
      input = handle.radios[0].input;
    handle.on("change", changed);
    act(() => handle.lifecycle.destroy());
    input.checked = true;
    fireEvent.change(input);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("radiogroup")).toBeNull();
  });
});
