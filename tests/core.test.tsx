import { Tabs, Breadcrumbs, Link, Stepper } from "../src/kit/navigation";
import { describe, it, expect, afterEach, vi, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import FormsDemo from "../src/showcase/demos/forms";
import { fabMotionDefaults } from "../src/showcase/demos/shared";
import {
  createTheme,
  colorBehaviorDefaults,
  normalizeColorBehavior,
} from "../src/kit/theme";
import {
  themeFromSourceColor,
  argbFromHex,
  hexFromArgb,
  lstarFromArgb,
} from "@material/material-color-utilities";
import { Calendar, DatePicker, TimePicker, parseDateOnly, toDateOnly, formatDateOnly } from "../src/kit/dates";
import { Switch, Button, Checkbox, Slider } from "../src/kit/controls";
import { MaterialFluidProvider } from "../src/kit/provider";
import { ComponentAppearanceProvider } from "../src/kit/appearance";
import { TextField, Textarea, NumberField, OTPInput, FileInput, FormField, Combobox, MultiSelect, Select } from "../src/kit/forms";
import { Popover } from "../src/kit/overlays";
import {
  loadPreferences,
  savePreferences,
  preferenceDefaults,
} from "../src/showcase/preferences";
import { catalogue } from "../src/showcase/catalogue";
import { seedFromHue, seedHue } from "../src/showcase/accent-seed";
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
});
afterEach(cleanup);
function luminance(hex: string) {
  const values = hex
    .slice(1)
    .match(/../g)!
    .map((n) => parseInt(n, 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
describe("theme colors", () => {
  it("can reproduce the classic palette with explicit settings", () => {
    const old = themeFromSourceColor(argbFromHex("#eedd96"));
    for (const dark of [false, true]) {
      const actual = createTheme("#eedd96", dark, {
        primarySaturation: 100,
        secondarySaturation: 100,
        tertiarySaturation: 100,
        secondaryHueShift: 0,
        tertiaryHueShift: 60,
        surfaceTint: 100,
        contrast: 0,
        lightBrightness: 40,
        darkBrightness: 80,
        lightInkBrightness: 40,
        darkInkBrightness: 80,
        lightContainerBrightness: 90,
        darkContainerBrightness: 30,
        lightSurfaceBrightness: 96,
        darkSurfaceBrightness: 6,
        lightTextBrightness: 10,
        darkTextBrightness: 90,
        lightBorderBrightness: 50,
        darkBorderBrightness: 60,
      });
      const expected = (dark ? old.schemes.dark : old.schemes.light).toJSON();
      for (const [key, value] of Object.entries(expected)) {
        if (key === "surface") continue; // The kit has always used a custom neutral surface tone.
        const token = `--mf-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
        expect(actual[token]).toBe(hexFromArgb(value));
      }
    }
  });
  it("changes only the requested hue/saturation roles", () => {
    const base = createTheme();
    const changed = createTheme("#eedd96", false, {
      secondaryHueShift: 150,
      secondarySaturation: 250,
    });
    expect(changed["--mf-secondary"]).not.toBe(base["--mf-secondary"]);
    expect(changed["--mf-primary"]).toBe(base["--mf-primary"]);
    expect(changed["--mf-error"]).toBe(base["--mf-error"]);
    expect(changed["--mf-palette-secondary"]).toBe(changed["--mf-secondary"]);
  });
  it("brightens action fills while keeping transparent-action ink readable", () => {
    const base = createTheme("#eedd96", false, { lightBrightness: 40 });
    const bright = createTheme("#eedd96", false, { lightBrightness: 85 });
    expect(bright["--mf-primary-fill"]).not.toBe(base["--mf-primary-fill"]);
    expect(bright["--mf-primary"]).toBe(base["--mf-primary"]);
    expect(bright["--mf-on-primary-fill"]).not.toBe(
      base["--mf-on-primary-fill"],
    );
    expect(
      contrast(bright["--mf-primary-fill"], bright["--mf-on-primary-fill"]),
    ).toBeGreaterThanOrEqual(4.5);
    const tinted = createTheme("#eedd96", false, { surfaceTint: 400 });
    expect(tinted["--mf-surface-container"]).not.toBe(
      base["--mf-surface-container"],
    );
  });
  it.each([false, true])(
    "keeps action fills readable throughout brightness changes (dark=%s)",
    (dark) => {
      for (const seed of ["#eedd96", "#0000ff", "#ff0000"]) {
        for (const brightness of [20, 40, 49, 50, 60, 80, 95]) {
          for (const amount of [0, 100]) {
            const colors = createTheme(seed, dark, {
              lightBrightness: brightness,
              darkBrightness: brightness,
              lightDangerBrightness: brightness,
              darkDangerBrightness: brightness,
              contrast: amount,
            });
            for (const role of ["primary", "secondary", "tertiary", "error"]) {
              expect(
                contrast(
                  colors[`--mf-${role}-fill`],
                  colors[`--mf-on-${role}-fill`],
                ),
              ).toBeGreaterThanOrEqual(4.5);
              expect(
                contrast(
                  colors[`--mf-${role}-fill-hover`],
                  colors[`--mf-on-${role}-fill`],
                ),
              ).toBeGreaterThanOrEqual(4.5);
              expect(
                contrast(
                  colors[`--mf-on-${role}-fill-hover`],
                  colors[`--mf-${role}-fill`],
                ),
              ).toBeGreaterThanOrEqual(4.5);
            }
          }
        }
      }
    },
  );
  it.each([false, true])(
    "keeps extreme palette settings readable (dark=%s)",
    (dark) => {
      for (const seed of [
        "#eedd96",
        "#ff0000",
        "#0000ff",
        "#ffffff",
        "#000000",
      ]) {
        for (const settings of [
          {
            primarySaturation: 0,
            secondarySaturation: 0,
            tertiarySaturation: 0,
            surfaceTint: 0,
            contrast: 0,
          },
          {
            primarySaturation: 200,
            secondarySaturation: 300,
            tertiarySaturation: 300,
            secondaryHueShift: -180,
            tertiaryHueShift: 180,
            surfaceTint: 400,
            contrast: 100,
          },
          {
            primarySaturation: 200,
            secondarySaturation: 300,
            tertiarySaturation: 300,
            secondaryHueShift: 90,
            tertiaryHueShift: -90,
            surfaceTint: 400,
            contrast: 0,
          },
        ]) {
          const theme = createTheme(seed, dark, settings);
          for (const role of ["primary", "secondary", "tertiary", "error"]) {
            expect(
              contrast(theme[`--mf-${role}`], theme[`--mf-on-${role}`]),
            ).toBeGreaterThanOrEqual(4.5);
            expect(
              contrast(
                theme[`--mf-${role}-container`],
                theme[`--mf-on-${role}-container`],
              ),
            ).toBeGreaterThanOrEqual(4.5);
          }
          expect(
            contrast(
              theme["--mf-surface-container"],
              theme["--mf-on-surface-variant"],
            ),
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );
  it.each([false, true])(
    "keeps foreground pairs readable (dark=%s)",
    (dark) => {
      for (const seed of [
        "#eedd96",
        "#4b87c8",
        "#6e54b2",
        "#00aa88",
        "#ff0000",
      ]) {
        const theme = createTheme(seed, dark);
        for (const [background, foreground] of [
          ["primary", "on-primary"],
          ["primary-container", "on-primary-container"],
          ["secondary", "on-secondary"],
          ["secondary-container", "on-secondary-container"],
          ["tertiary", "on-tertiary"],
          ["tertiary-container", "on-tertiary-container"],
          ["surface", "on-surface"],
          ["surface-container", "on-surface-variant"],
          ["error", "on-error"],
        ])
          expect(
            contrast(theme[`--mf-${background}`], theme[`--mf-${foreground}`]),
          ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
  it("rejects malformed seeds", () =>
    expect(() => createTheme("gold")).toThrow());
});

describe("approved palette settings", () => {
  it.each([false, true])(
    "separates colored and plain icon tones and provides solid red Danger (dark=%s)",
    (dark) => {
      const theme = createTheme("#eedd96", dark);
      expect(lstarFromArgb(argbFromHex(theme["--mf-primary-ink"]))).toBeCloseTo(
        dark ? 50 : 40,
        0,
      );
      expect(
        lstarFromArgb(argbFromHex(theme["--mf-primary-plain-ink"])),
      ).toBeCloseTo(dark ? 90 : 40, 0);
      expect(theme["--mf-on-error-fill"]).toBe("#ffffff");
      expect(lstarFromArgb(argbFromHex(theme["--mf-error-fill"]))).toBeCloseTo(
        49,
        0,
      );
      const changed = createTheme("#eedd96", dark, {
        lightPlainInkBrightness: 80,
        darkPlainInkBrightness: 80,
      });
      expect(changed["--mf-primary-ink"]).toBe(theme["--mf-primary-ink"]);
      expect(changed["--mf-primary-plain-ink"]).not.toBe(
        theme["--mf-primary-plain-ink"],
      );
    },
  );
  it("honors icon brightness directly while keeping readable accent text separate", () => {
    const theme = createTheme("#eedd96", false, { lightInkBrightness: 100 });
    expect(theme["--mf-primary-ink"]).toBe("#ffffff");
    expect(theme["--mf-primary"]).not.toBe("#ffffff");
    expect(
      contrast(theme["--mf-primary"], theme["--mf-surface-high"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      createTheme("#eedd96", false, { lightInkBrightness: 80 })[
        "--mf-primary-ink"
      ],
    ).not.toBe("#ffffff");
  });
  it.each([false, true])(
    "controls ink, containers, neutrals and borders independently (dark=%s)",
    (dark) => {
      const base = createTheme("#eedd96", dark);
      for (const [settings, changed, preserved] of [
        [
          { lightInkBrightness: 0, darkInkBrightness: 100 },
          "primary",
          "primary-fill",
        ],
        [
          { lightContainerBrightness: 50, darkContainerBrightness: 50 },
          "primary-container",
          "primary-fill",
        ],
        [
          { lightSurfaceBrightness: 80, darkSurfaceBrightness: 24 },
          "canvas",
          "primary-fill",
        ],
        [
          { lightTextBrightness: 20, darkTextBrightness: 100 },
          "on-surface",
          "primary-container",
        ],
        [
          { lightBorderBrightness: 10, darkBorderBrightness: 10 },
          "outline",
          "primary-fill",
        ],
      ] as const) {
        const tuned = createTheme("#eedd96", dark, settings);
        expect(tuned[`--mf-${changed}`]).not.toBe(base[`--mf-${changed}`]);
        expect(tuned[`--mf-${preserved}`]).toBe(base[`--mf-${preserved}`]);
      }
      for (const level of [0, 30, 49, 50, 60, 90, 100]) {
        const tuned = createTheme("#eedd96", dark, {
          lightContainerBrightness: level,
          darkContainerBrightness: level,
          contrast: 100,
        });
        for (const role of ["primary", "secondary", "tertiary", "error"]) {
          expect(
            contrast(
              tuned[`--mf-${role}-container`],
              tuned[`--mf-on-${role}-container`],
            ),
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );
  it("adds new role defaults to older preferences without losing saved settings", () => {
    const preferences = loadPreferences({
      getItem: () =>
        JSON.stringify({
          colorBehavior: { lightBrightness: 70, primarySaturation: 120 },
        }),
    });
    expect(preferences.colorBehavior).toMatchObject({
      lightBrightness: 70,
      primarySaturation: 120,
      lightInkBrightness: 40,
      darkContainerBrightness: 80,
      lightSurfaceBrightness: 90,
    });
  });
  it("migrates the former global dark ink default but preserves explicit split-role tuning", () => {
    const legacy = loadPreferences({
      getItem: () =>
        JSON.stringify({
          colorBehavior: { darkInkBrightness: 85, primarySaturation: 125 },
        }),
    });
    expect(legacy.colorBehavior).toMatchObject({
      darkInkBrightness: 50,
      lightPlainInkBrightness: 40,
      darkPlainInkBrightness: 90,
      primarySaturation: 125,
    });
    const tuned = loadPreferences({
      getItem: () =>
        JSON.stringify({
          colorBehavior: { darkInkBrightness: 85, darkPlainInkBrightness: 75 },
        }),
    });
    expect(tuned.colorBehavior).toMatchObject({
      darkInkBrightness: 85,
      darkPlainInkBrightness: 75,
    });
  });
  it("uses the confirmed defaults for fresh preferences", () => {
    expect(
      loadPreferences({ getItem: () => null }).colorBehavior,
    ).toMatchObject({
      lightBrightness: 85,
      darkBrightness: 90,
      primarySaturation: 50,
      secondarySaturation: 75,
      tertiarySaturation: 100,
      secondaryHueShift: 0,
      tertiaryHueShift: 30,
      surfaceTint: 75,
      contrast: 0,
      lightInkBrightness: 40,
      darkInkBrightness: 50,
      lightPlainInkBrightness: 40,
      darkPlainInkBrightness: 90,
      lightDangerBrightness: 49,
      darkDangerBrightness: 49,
      lightContainerBrightness: 90,
      darkContainerBrightness: 80,
      lightSurfaceBrightness: 90,
      darkSurfaceBrightness: 5,
      lightTextBrightness: 25,
      darkTextBrightness: 90,
      lightBorderBrightness: 20,
      darkBorderBrightness: 90,
    });
  });
  it("restricts every selectable hue to full saturation and brightness", () => {
    for (let hue = 0; hue < 360; hue++) {
      const seed = seedFromHue(hue);
      const rgb = [1, 3, 5].map((offset) =>
        parseInt(seed.slice(offset, offset + 2), 16),
      );
      expect(Math.max(...rgb)).toBe(255);
      expect(Math.min(...rgb)).toBe(0);
      expect(seedHue(seed)).toBe(hue);
    }
    expect(seedFromHue(360)).toBe("#ff0000");
  });
});
describe("date-only values", () => {
  it.each(["2026-10-14", "2024-02-29", "0099-01-01"])(
    "round-trips %s without timezone conversion",
    (value) => expect(toDateOnly(parseDateOnly(value)!)).toBe(value),
  );
  it.each([
    "2026-02-29",
    "2026-13-01",
    "2026-00-10",
    "2026-01-32",
    "10/14/2026",
  ])("rejects invalid %s", (value) =>
    expect(parseDateOnly(value)).toBeUndefined(),
  );
  it("formats the same day in Persian and Gregorian calendars", () => {
    expect(formatDateOnly("2026-10-14", "en", "gregorian")).toContain("Oct");
    expect(formatDateOnly("2026-10-14", "en", "persian")).toContain("1405");
  });
});
describe("state APIs", () => {
  it("supports controlled switch changes", () => {
    function Example() {
      const [value, set] = useState(false);
      return (
        <MaterialFluidProvider>
          <Switch label="Wi-Fi" checked={value} onCheckedChange={set} />
        </MaterialFluidProvider>
      );
    }
    render(<Example />);
    const control = screen.getByRole("switch");
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });
  it("does not change externally controlled values itself", () => {
    const change = vi.fn();
    render(
      <MaterialFluidProvider>
        <Switch label="Wi-Fi" checked={false} onCheckedChange={change} />
      </MaterialFluidProvider>,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "false",
    );
  });
  it("blocks activation when a button is loading", () => {
    const action = vi.fn();
    render(
      <Button loading onClick={action}>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
  });
  it("uses native form submission for named switch state", () => {
    render(
      <MaterialFluidProvider>
        <form data-testid="form">
          <Switch label="Updates" name="updates" defaultChecked />
        </form>
      </MaterialFluidProvider>,
    );
    expect(
      new FormData(screen.getByTestId("form") as HTMLFormElement).get(
        "updates",
      ),
    ).toBe("on");
  });
  it("supports an indeterminate checkbox", () => {
    render(
      <MaterialFluidProvider>
        <Checkbox label="Select rows" checked="indeterminate" />
      </MaterialFluidProvider>,
    );
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "mixed",
    );
  });
});
describe("preferences and catalogue", () => {
  it("normalizes invalid color settings and restores saved tuning", () => {
    const invalid = normalizeColorBehavior({
      primarySaturation: -10,
      contrast: Infinity,
      tertiaryHueShift: 999,
    });
    expect(invalid.primarySaturation).toBe(0);
    expect(invalid.contrast).toBe(0);
    expect(invalid.tertiaryHueShift).toBe(180);
    let saved = "";
    const colors = {
      ...colorBehaviorDefaults,
      secondaryHueShift: 120,
      surfaceTint: 200,
    };
    savePreferences(
      { ...preferenceDefaults, colorBehavior: colors },
      {
        setItem: (_key, value) => {
          saved = value;
        },
      },
    );
    expect(loadPreferences({ getItem: () => saved }).colorBehavior).toEqual(
      colors,
    );
    expect(normalizeColorBehavior(null)).toEqual(colorBehaviorDefaults);
  });
  it("drops the retired showcase density preference", () => {
    expect(loadPreferences({ getItem: () => '{"density":"compact"}' })).toEqual(
      preferenceDefaults,
    );
  });
  it("has exactly 56 unique component pages", () => {
    expect(catalogue).toHaveLength(56);
    expect(new Set(catalogue.map((c) => c.id)).size).toBe(56);
  });
  it("normalizes malformed stored preferences", () => {
    expect(
      loadPreferences({
        getItem: () => '{"theme":"neon","accentSeed":"bad","locale":"ar"}',
      }),
    ).toEqual(preferenceDefaults);
    expect(loadPreferences({ getItem: () => "null" })).toEqual(
      preferenceDefaults,
    );
  });
  it("keeps working when storage throws", () => {
    expect(
      loadPreferences({
        getItem: () => {
          throw Error("blocked");
        },
      }),
    ).toEqual(preferenceDefaults);
    expect(() =>
      savePreferences(preferenceDefaults, {
        setItem: () => {
          throw Error("blocked");
        },
      }),
    ).not.toThrow();
  });
});
describe("component appearance defaults", () => {
  it("keeps presentation props off native inputs and preserves explicit overrides", () => {
    render(
      <MaterialFluidProvider motion="minimal">
        <ComponentAppearanceProvider variant="secondary" size="sm">
          <TextField label="Project" defaultValue="Fluid" />
          <Button variant="danger" size="lg">
            Delete project
          </Button>
        </ComponentAppearanceProvider>
      </MaterialFluidProvider>,
    );
    const input = screen.getByLabelText("Project");
    expect(input.getAttribute("size")).toBeNull();
    expect(input.getAttribute("variant")).toBeNull();
    expect(input.closest(".mf-field")?.className).toContain(
      "mf-variant--outline",
    );
    expect(input.closest(".mf-field")?.className).toContain("mf-scale--sm");
    expect(
      screen.getByRole("button", { name: "Delete project" }).className,
    ).toContain("mf-variant--danger");
    expect(
      screen.getByRole("button", { name: "Delete project" }).className,
    ).toContain("mf-scale--lg");
  });
  it("keeps the shared overlay treatment, inherited size, and nested button defaults", () => {
    render(
      <MaterialFluidProvider motion="minimal">
        <ComponentAppearanceProvider variant="tertiary" size="sm">
          <Popover
            label="Details"
            defaultOpen
            trigger={<Button>Open details</Button>}
          >
            Portaled detail
          </Popover>
          <ComponentAppearanceProvider variant="outline" size="lg">
            <Button>Separate defaults</Button>
          </ComponentAppearanceProvider>
        </ComponentAppearanceProvider>
      </MaterialFluidProvider>,
    );
    const popup = screen.getByRole("dialog", { name: "Details" });
    expect(popup.className).toContain("mf-variant--outline");
    expect(popup.className).toContain("mf-scale--sm");
    expect(
      screen.getByRole("button", { name: "Separate defaults" }).className,
    ).toContain("mf-variant--outline");
    expect(
      screen.getByRole("button", { name: "Separate defaults" }).className,
    ).toContain("mf-scale--lg");
  });
});

describe("numeric stepping", () => {
  it("steps controlled values with buttons and keys, preserves callbacks, and respects bounds", () => {
    const changed = vi.fn();
    function Example() {
      const [value, setValue] = useState(2);
      return <MaterialFluidProvider motion="minimal"><NumberField label="Count" min={1} max={3} value={value} onChange={event => { changed(event.currentTarget.value); setValue(Number(event.currentTarget.value)); }} /></MaterialFluidProvider>;
    }
    render(<Example />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(input.value).toBe("3");
    expect(changed).toHaveBeenLastCalledWith("3");
    expect((screen.getByRole("button", { name: "Increase" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.value).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input.value).toBe("1");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.value).toBe("1");
  });
  it("keeps typed numbers native and shows the animated value when stepping", () => {
    const { container } = render(<MaterialFluidProvider><NumberField label="Count" defaultValue={6} /></MaterialFluidProvider>);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "12" } });
    expect(input.value).toBe("12");
    expect(container.querySelector(".mf-number-value-content")?.hasAttribute("data-editing")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(input.value).toBe("13");
    expect(container.querySelector(".mf-number-value-content")?.hasAttribute("data-editing")).toBe(false);
  });
});

describe("wheel controls", () => {
  it("steps a number field without scrolling the page and preserves browser zoom", () => {
    const { container } = render(<MaterialFluidProvider motion="minimal"><NumberField label="Count" defaultValue={5} /></MaterialFluidProvider>);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    const wheel = new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true });
    fireEvent(input, wheel);
    expect(input.value).toBe("6");
    expect(wheel.defaultPrevented).toBe(true);
    expect(container.querySelector(".mf-input-value-wrap")?.hasAttribute("data-overlay-active")).toBe(true);
    const zoom = new WheelEvent("wheel", { deltaY: -100, ctrlKey: true, bubbles: true, cancelable: true });
    fireEvent(input, zoom);
    expect(zoom.defaultPrevented).toBe(false);
    expect(input.value).toBe("6");
  });
  it("adjusts the hovered range handle without crossing its neighbour", () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    try {
      render(<MaterialFluidProvider motion="minimal"><Slider label="Range" defaultValue={[25, 75]} step={5} /></MaterialFluidProvider>);
      const [minimum, maximum] = screen.getAllByRole("slider");
      const wheel = new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true });
      fireEvent(maximum, wheel);
      expect(wheel.defaultPrevented).toBe(true);
      expect(maximum.getAttribute("aria-valuenow")).toBe("80");
      expect(minimum.getAttribute("aria-valuenow")).toBe("25");
      for (let i = 0; i < 20; i++) fireEvent.wheel(minimum, { deltaY: -100, cancelable: true });
      expect(Number(minimum.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(80);
    } finally { cleanup(); vi.unstubAllGlobals(); }
  });
});

describe("form feedback and entry", () => {
  it("preserves OTP paste, native values, focus navigation, and validation", () => {
    const changed = vi.fn();
    render(<MaterialFluidProvider><OTPInput label="Code" error="Try another code" onValueChange={changed} /></MaterialFluidProvider>);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: "7" } });
    expect(inputs[0].value).toBe("7");
    expect(document.activeElement).toBe(inputs[1]);
    expect(inputs[0].getAttribute("aria-invalid")).toBe("true");
    fireEvent.paste(inputs[1], { clipboardData: { getData: () => "12345" } });
    expect(inputs.map(input => input.value).join("")).toBe("712345");
    expect(changed).toHaveBeenLastCalledWith("712345");
  });
  it("offers the large numeric presentation without changing native bounds", () => {
    const { container } = render(<MaterialFluidProvider motion="minimal"><NumberField presentation="goal" unit="steps per day" label="Daily goal" defaultValue={1000} min={0} max={1500} step={500} /></MaterialFluidProvider>);
    expect(container.querySelector(".mf-number-field--goal")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("1500");
    expect((screen.getByRole("button", { name: "Increase" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("marks a file drop target and rejects unsupported files", () => {
    const changed = vi.fn();
    const { container } = render(<MaterialFluidProvider motion="minimal"><FileInput label="Attachment" accept=".pdf" onChange={changed} /></MaterialFluidProvider>);
    const target = container.querySelector(".mf-file-drop")!;
    const dataTransfer = { types: ["Files"], files: [new File(["text"], "note.txt", { type: "text/plain" })] };
    fireEvent.dragEnter(target, { dataTransfer });
    expect(target.getAttribute("data-drop-state")).toBe("active");
    fireEvent.drop(target, { dataTransfer });
    expect(screen.getByRole("alert").textContent).toBe("Choose a supported file type.");
    expect(changed).not.toHaveBeenCalled();
  });
  it("keeps native validation events available to generic form fields", () => {
    const invalid = vi.fn();
    render(<MaterialFluidProvider motion="minimal"><FormField label="Name" htmlFor="name-required" onInvalidCapture={invalid}><div className="mf-input-wrap"><input id="name-required" required className="mf-input" /></div></FormField></MaterialFluidProvider>);
    (screen.getByRole("textbox") as HTMLInputElement).checkValidity();
    expect(invalid).toHaveBeenCalledOnce();
  });
});

describe("overlapping slider handles", () => {
  it("uses the pointer side to separate coincident range handles", () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    try {
      const { container } = render(<MaterialFluidProvider motion="minimal"><Slider label="Range" defaultValue={[50, 50]} step={5} /></MaterialFluidProvider>);
      const thumbs = screen.getAllByRole("slider");
      thumbs.forEach(thumb => vi.spyOn(thumb, "getBoundingClientRect").mockReturnValue({ x: 95, y: 0, left: 95, right: 105, top: 0, bottom: 40, width: 10, height: 40, toJSON() {} }));
      const track = container.querySelector(".mf-slider-track")!;
      fireEvent.wheel(track, { deltaY: -100, clientX: 160, cancelable: true });
      expect(thumbs[0].getAttribute("aria-valuenow")).toBe("50");
      expect(thumbs[1].getAttribute("aria-valuenow")).toBe("55");
      fireEvent.wheel(track, { deltaY: 100, clientX: 40, cancelable: true });
      expect(thumbs[0].getAttribute("aria-valuenow")).toBe("45");
      expect(thumbs[1].getAttribute("aria-valuenow")).toBe("55");
    } finally { cleanup(); vi.unstubAllGlobals(); }
  });
});

describe("suggestions, OTP validation, and calendar navigation", () => {
  it("keeps combo suggestions open for input interaction and dismisses outside", async () => {
    const user = userEvent.setup();
    for (const Component of [Combobox]) {
      render(<MaterialFluidProvider motion="minimal"><Component label="Project" options={[{ value: "design", label: "Design" }, { value: "dev", label: "Development" }]} /><button>Outside</button></MaterialFluidProvider>);
      const input = screen.getByRole("combobox") as HTMLInputElement;
      await user.click(input);
      expect(await screen.findByRole("listbox")).not.toBeNull();
      await user.type(input, "Dev");
      await user.click(screen.getByRole("option", { name: "Development" }));
      expect(input.value).toBe("Development");
      expect(screen.queryByRole("listbox")).toBeNull();
      await user.click(input);
      expect(await screen.findByRole("listbox")).not.toBeNull();
      await user.click(screen.getByRole("button", { name: "Outside" }));
      expect(screen.queryByRole("listbox")).toBeNull();
      cleanup();
    }
  });
  it("advances OTP entry through filled slots even when retyping the same digit", () => {
    render(<MaterialFluidProvider motion="minimal"><OTPInput label="Code" defaultValue="123654" /></MaterialFluidProvider>);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();
    fireEvent.keyDown(inputs[0], { key: "1" });
    expect(document.activeElement).toBe(inputs[1]);
    fireEvent.keyDown(inputs[1], { key: "2" });
    expect(document.activeElement).toBe(inputs[2]);
    expect(inputs.map(input => input.value).join("")).toBe("123654");
  });
  it("accepts only 123654 in the OTP showcase", () => {
    render(<MaterialFluidProvider motion="minimal"><FormsDemo id="otp-input" locale="en" states={{}} fabMotion={fabMotionDefaults} onFabMotionChange={() => {}} /></MaterialFluidProvider>);
    const first = screen.getAllByRole("textbox")[0];
    fireEvent.paste(first, { clipboardData: { getData: () => "123456" } });
    expect(screen.getByRole("alert").textContent).toBe("Incorrect code. Try again.");
    fireEvent.paste(first, { clipboardData: { getData: () => "123654" } });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Code accepted.");
    expect(screen.getByRole("group", { name: "Verification code" }).getAttribute("data-success")).toBe("true");
  });
  it("navigates calendar months by wheel, month grid, and large year field", async () => {
    const user = userEvent.setup();
    const { container } = render(<MaterialFluidProvider motion="expressive"><Calendar defaultValue="2026-10-14" /></MaterialFluidProvider>);
    await user.click(screen.getByRole("button", { name: "October" }));
    expect(screen.getByRole("group", { name: "Choose month" })).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "November, 11" }));
    expect(screen.getByRole("button", { name: "November" })).not.toBeNull();
    const wheel = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
    fireEvent(container.querySelector(".mf-calendar-wrap")!, wheel);
    expect(wheel.defaultPrevented).toBe(true);
    expect(screen.getByRole("button", { name: "December" })).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "2026" }));
    const year = screen.getByRole("spinbutton");
    fireEvent.change(year, { target: { value: "2028" } });
    await user.click(screen.getByRole("button", { name: "Apply year" }));
    expect(screen.getByRole("button", { name: "2028" })).not.toBeNull();
  });
});

describe("invalid subtitle feedback", () => {
  it("animates only the subtitle in Expressive mode and stays still in Minimal mode", () => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "animate");
    const targets: HTMLElement[] = [];
    Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, value: function(this: HTMLElement) { targets.push(this); return { cancel() {} }; } });
    try {
      render(<MaterialFluidProvider><TextField label="Name" error="Please enter your name" /></MaterialFluidProvider>);
      expect(targets.length).toBeGreaterThan(0);
      expect(targets.every(target => target.classList.contains("mf-field-hint"))).toBe(true);
      const count = targets.length;
      cleanup();
      render(<MaterialFluidProvider motion="minimal"><TextField label="Name" error="Please enter your name" /></MaterialFluidProvider>);
      expect(targets.length).toBe(count);
    } finally {
      cleanup();
      if (descriptor) Object.defineProperty(HTMLElement.prototype, "animate", descriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, "animate");
    }
  });
});

describe("selection lists and wrapping values", () => {
  it("keeps MultiSelect search and highlights selections without check icons", async () => {
    const user = userEvent.setup();
    render(<MaterialFluidProvider motion="minimal"><MultiSelect label="Skills" defaultValue={["design"]} options={[{ value: "design", label: "Design" }, { value: "research", label: "Research" }]} /></MaterialFluidProvider>);
    await user.click(screen.getByRole("button", { name: "Skills: Choose options" }));
    const search = screen.getByRole("textbox", { name: "Search options" });
    expect(search.closest(".mf-multi-search")).not.toBeNull();
    const design = screen.getByRole("option", { name: "Design" });
    expect(design.getAttribute("aria-selected")).toBe("true");
    expect(design.querySelector("svg")).toBeNull();
    const research = screen.getByRole("option", { name: "Research" });
    await user.click(research);
    expect(research.getAttribute("aria-selected")).toBe("true");
    expect(research.querySelector("svg")).toBeNull();
    expect(screen.getByRole("button", { name: "Remove Design" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Remove Research" })).not.toBeNull();
    await user.click(research);
    expect(research.getAttribute("aria-selected")).toBe("false");
    await user.type(search, "rese");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: "Research" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Remove Design" })).not.toBeNull();
  });
  it("explains custom-value policy and exposes an explicit custom option", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { rerender } = render(<MaterialFluidProvider motion="minimal"><Combobox label="Skill" options={[{ value: "design", label: "Design" }]} onValueChange={changed} /></MaterialFluidProvider>);
    expect(screen.getByText("Choose from the listed options only.")).not.toBeNull();
    await user.type(screen.getByRole("combobox"), "Other");
    await user.keyboard("{Enter}");
    expect(changed).not.toHaveBeenCalled();
    rerender(<MaterialFluidProvider motion="minimal"><Combobox label="Skill" allowCustom options={[{ value: "design", label: "Design" }]} onValueChange={changed} /></MaterialFluidProvider>);
    expect(screen.getByText("Choose an option or add your own value.")).not.toBeNull();
    await user.click(screen.getByRole("option", { name: "Add “Other”" }));
    expect(changed).toHaveBeenLastCalledWith("Other");
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Other");
  });
  it("allows custom combo values without a separate Autocomplete component", async () => {
    const user = userEvent.setup();
    render(<MaterialFluidProvider motion="minimal"><Combobox label="Tag" allowCustom options={[{ value: "design", label: "Design" }]} /></MaterialFluidProvider>);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.type(input, "New tag");
    await user.keyboard("{Enter}");
    expect(input.value).toBe("New tag");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("adds and removes Primary multi-select chips while retaining list state", async () => {
    const user = userEvent.setup();
    render(<MaterialFluidProvider motion="minimal"><MultiSelect label="Skills" defaultValue={["design"]} options={[{ value: "design", label: "Design" }, { value: "research", label: "Research" }]} /></MaterialFluidProvider>);
    expect(screen.getByRole("button", { name: "Remove Design" }).className).toContain("mf-variant--primary");
    await user.click(screen.getByRole("button", { name: "Skills: Choose options" }));
    await user.click(screen.getByRole("option", { name: "Research" }));
    expect(screen.getByRole("button", { name: "Remove Research" })).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Remove Design" }));
    expect(screen.getByRole("option", { name: "Design" }).getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("button", { name: "Remove Research" })).not.toBeNull();
  });
  it("retains Select keyboard choice and closing behavior", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    try {
      const user = userEvent.setup();
      render(<MaterialFluidProvider motion="minimal"><Select label="Role" defaultValue="design" options={[{ value: "design", label: "Design" }, { value: "research", label: "Research" }]} /></MaterialFluidProvider>);
      await user.tab();
      await user.keyboard("{Enter}");
      expect(await screen.findByRole("listbox")).not.toBeNull();
      await user.keyboard("{ArrowDown}{Enter}");
      expect(screen.getByRole("combobox").textContent).toContain("Research");
      expect(screen.queryByRole("listbox")).toBeNull();
    } finally {
      cleanup();
      if (descriptor) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", descriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
    }
  });
  it("uses Persian month arithmetic for calendar wheel navigation", () => {
    const { container } = render(<MaterialFluidProvider motion="minimal"><Calendar calendar="persian" defaultValue="2026-10-14" /></MaterialFluidProvider>);
    expect(screen.getByRole("button", { name: "Mehr" })).not.toBeNull();
    fireEvent.wheel(container.querySelector(".mf-calendar-wrap")!, { deltaY: 100, cancelable: true });
    expect(screen.getByRole("button", { name: "Aban" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Aban" }));
    expect(screen.getByRole("group", { name: "Choose month" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Mehr, 7" }));
    expect(screen.getByRole("button", { name: "Mehr" })).not.toBeNull();
    expect(screen.queryByRole("group", { name: "Choose month" })).toBeNull();
  });
});

describe("range, time, and file selection", () => {
  it.each(["gregorian", "persian"] as const)("hides adjacent-month dates in the %s calendar by default", calendar => {
    const { container } = render(<MaterialFluidProvider motion="minimal"><Calendar calendar={calendar} defaultValue="2026-10-14" /></MaterialFluidProvider>);
    expect(container.querySelectorAll(".rdp-outside button")).toHaveLength(0);
    expect(container.querySelectorAll(".rdp-day_button").length).toBeGreaterThanOrEqual(29);
  });
  it("restarts a range instead of completing it backwards", async () => {
    const changed = vi.fn();
    function Example() {
      const [range, setRange] = useState<{ from?: string; to?: string }>({ from: "2026-10-14", to: "2026-10-20" });
      return <MaterialFluidProvider motion="minimal"><Calendar selection="range" range={range} onRangeChange={next => { changed(next); setRange(next); }} /></MaterialFluidProvider>;
    }
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: /October 12/ }));
    expect(changed).toHaveBeenLastCalledWith({ from: "2026-10-12", to: undefined });
    await user.click(screen.getByRole("button", { name: /October 16/ }));
    expect(changed).toHaveBeenLastCalledWith({ from: "2026-10-12", to: "2026-10-16" });
  });
  it("hides adjacent-month dates in the date picker", async () => {
    render(<MaterialFluidProvider motion="minimal"><DatePicker label="Date" defaultValue="2026-10-14" /></MaterialFluidProvider>);
    await userEvent.setup().click(screen.getByRole("button", { name: "Choose date" }));
    expect(document.querySelectorAll(".mf-date-popover .rdp-outside button")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "October" })).not.toBeNull();
  });
  it("fills the date mask one digit at a time and commits only after editing", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(<MaterialFluidProvider motion="minimal"><DatePicker label="Date" onValueChange={changed} /></MaterialFluidProvider>);
    const field = screen.getByRole("textbox", { name: "Date" }) as HTMLInputElement;
    expect(field.placeholder).toBe("----/--/--");
    expect(field.value).toBe("");
    await user.type(field, "20261115");
    expect(field.value).toBe("2026/11/15");
    expect(changed).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(changed).toHaveBeenLastCalledWith("2026-11-15");
    field.setSelectionRange(0, 4);
    await user.keyboard("2027");
    expect(field.value).toBe("2027/11/15");
    expect(changed).toHaveBeenCalledTimes(1);
    await user.keyboard("{Enter}");
    expect(changed).toHaveBeenLastCalledWith("2027-11-15");
    await user.clear(field);
    await user.tab();
    expect(changed).toHaveBeenLastCalledWith(undefined);
  });
  it.each([
    ["00:30", "12", "AM", "PM", "12:30"],
    ["12:30", "12", "PM", "AM", "00:30"],
    ["23:30", "11", "PM", "AM", "11:30"],
  ])("converts 12-hour input from %s with the selected period", async (initial, hour, period, nextPeriod, expected) => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(<MaterialFluidProvider motion="minimal"><TimePicker label="Meeting" hourFormat={12} defaultValue={initial} onChange={event => changed(event.currentTarget.value)} /></MaterialFluidProvider>);
    await user.click(screen.getByRole("button", { name: "Choose time" }));
    const hours = screen.getByRole("spinbutton", { name: "Hours" }) as HTMLInputElement;
    expect(hours.value).toBe(hour);
    expect(screen.getByRole("button", { name: period }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.change(hours, { target: { value: "13" } });
    expect(hours.value).toBe(hour);
    fireEvent.change(hours, { target: { value: "0" } });
    expect(hours.value).toBe(hour);
    screen.getByRole("button", { name: nextPeriod }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: nextPeriod }).getAttribute("aria-pressed")).toBe("true");
    await user.click(screen.getByRole("button", { name: "Apply time" }));
    expect(changed).toHaveBeenLastCalledWith(expected);
  });
  it("edits numeric dates, rejects impossible or out-of-range dates, and keeps the calendar usable", async () => {
    const changed = vi.fn();
    render(<MaterialFluidProvider motion="minimal"><DatePicker label="Start date" defaultValue="2026-10-14" min="2026-10-01" max="2026-12-31" onValueChange={changed} /></MaterialFluidProvider>);
    const field = screen.getByRole("textbox", { name: "Start date" }) as HTMLInputElement;
    expect(field.value).toBe("2026/10/14");
    fireEvent.change(field, { target: { value: "2026/11/15" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(changed).toHaveBeenLastCalledWith("2026-11-15");
    for (const value of ["2026/11/31", "2026/09/15", "2026/13/01"]) {
      changed.mockClear();
      fireEvent.change(field, { target: { value } });
      fireEvent.blur(field);
      expect(field.getAttribute("aria-invalid")).toBe("true");
      expect(changed).not.toHaveBeenCalled();
    }
    fireEvent.keyDown(field, { key: "Escape" });
    expect(field.value).toBe("2026/11/15");
    await userEvent.setup().click(screen.getByRole("button", { name: "Choose date" }));
    expect(screen.getByRole("button", { name: "November" })).not.toBeNull();
  });
  it("accepts Persian numeric dates and Persian digits while emitting Gregorian date-only values", () => {
    const changed = vi.fn();
    render(<MaterialFluidProvider motion="minimal"><DatePicker calendar="persian" label="Date" defaultValue="2026-10-14" onValueChange={changed} /></MaterialFluidProvider>);
    const field = screen.getByRole("textbox", { name: "Date" }) as HTMLInputElement;
    expect(field.value).toBe("1405/07/22");
    fireEvent.change(field, { target: { value: "۱۴۰۵/۰۷/۲۳" } });
    fireEvent.blur(field);
    expect(changed).toHaveBeenLastCalledWith("2026-10-15");
    expect(field.value).toBe("1405/07/23");
    changed.mockClear();
    fireEvent.change(field, { target: { value: "1405/07/31" } });
    fireEvent.blur(field);
    expect(changed).not.toHaveBeenCalled();
    expect(field.getAttribute("aria-invalid")).toBe("true");
  });
  it("edits time through goal controls and preserves controlled changes and submission", async () => {
    const changed = vi.fn();
    function Example() {
      const [value, setValue] = useState("09:30");
      return <MaterialFluidProvider motion="minimal"><form data-testid="time-form"><TimePicker label="Meeting" name="meeting" value={value} onChange={event => { changed(event.currentTarget.value); setValue(event.currentTarget.value); }} /></form></MaterialFluidProvider>;
    }
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Choose time" }));
    expect(await screen.findByRole("dialog", { name: "Set time" })).not.toBeNull();
    const hours = screen.getByRole("spinbutton", { name: "Hours" }) as HTMLInputElement;
    for (const value of ["24", "25", "0000", "-1"]) {
      fireEvent.change(hours, { target: { value } });
      expect(Number(hours.value)).toBe(9);
    }
    const minutes = screen.getByRole("spinbutton", { name: "Minutes" }) as HTMLInputElement;
    fireEvent.change(minutes, { target: { value: "60" } });
    expect(minutes.value).toBe("30");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Hours" }), { target: { value: "10" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minutes" }), { target: { value: "45" } });
    await user.click(screen.getByRole("button", { name: "Apply time" }));
    expect(changed).toHaveBeenLastCalledWith("10:45");
    expect(new FormData(screen.getByTestId("time-form") as HTMLFormElement).get("meeting")).toBe("10:45");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("shows shortened multiple-file chips and removes the actual selected files", async () => {
    class Transfer { files: File[] = []; items = { add: (file: File) => this.files.push(file) }; }
    vi.stubGlobal("DataTransfer", Transfer);
    try {
      const changed = vi.fn();
      const user = userEvent.setup();
      render(<MaterialFluidProvider motion="minimal"><FileInput multiple label="Attachments" onChange={changed} /></MaterialFluidProvider>);
      const input = screen.getByLabelText("Attachments") as HTMLInputElement;
      const pdf = new File(["pdf"], "averyverylong-document-name-that-needs-shortening.pdf", { type: "application/pdf" });
      const image = new File(["image"], "photo.png", { type: "image/png" });
      Object.defineProperty(input, "files", { configurable: true, writable: true, value: [pdf, image] });
      fireEvent.change(input);
      const remove = screen.getByRole("button", { name: `Remove ${pdf.name}` });
      expect(remove.textContent).toContain("…");
      expect(remove.textContent).toContain(".pdf");
      await user.click(remove);
      expect(Array.from(input.files ?? []).map(file => file.name)).toEqual(["photo.png"]);
      await user.click(screen.getByRole("button", { name: "Remove photo.png" }));
      expect(Array.from(input.files ?? [])).toHaveLength(0);
      expect(changed).toHaveBeenCalledTimes(3);
    } finally { cleanup(); vi.unstubAllGlobals(); }
  });
});

describe("character count limits", () => {
  it("limits typed text and textarea input and updates their counters", async () => {
    const user = userEvent.setup();
    render(<MaterialFluidProvider motion="minimal"><TextField label="Title" maxLength={5} defaultValue="Hi" /><Textarea label="Description" maxLength={8} /></MaterialFluidProvider>);
    const title = screen.getByRole("textbox", { name: "Title" }) as HTMLInputElement;
    await user.type(title, " there");
    expect(title.value).toBe("Hi th");
    expect(screen.getByLabelText("5 of 5 characters")).not.toBeNull();
    const description = screen.getByRole("textbox", { name: "Description" }) as HTMLTextAreaElement;
    await user.type(description, "123456789");
    expect(description.value).toBe("12345678");
    expect(screen.getByLabelText("8 of 8 characters")).not.toBeNull();
    await user.clear(description);
    expect(screen.getByLabelText("0 of 8 characters")).not.toBeNull();
  });
  it("supports controlled counter updates and hides the counter on request", () => {
    const { rerender } = render(<MaterialFluidProvider motion="minimal"><TextField label="Title" value="A" maxLength={10} readOnly /></MaterialFluidProvider>);
    expect(screen.getByLabelText("1 of 10 characters")).not.toBeNull();
    rerender(<MaterialFluidProvider motion="minimal"><TextField label="Title" value="Hello" maxLength={10} readOnly /></MaterialFluidProvider>);
    expect(screen.getByLabelText("5 of 10 characters")).not.toBeNull();
    rerender(<MaterialFluidProvider motion="minimal"><TextField label="Title" value="Hello" maxLength={10} showCount={false} readOnly /></MaterialFluidProvider>);
    expect(screen.queryByLabelText("5 of 10 characters")).toBeNull();
    expect((screen.getByRole("textbox") as HTMLInputElement).maxLength).toBe(10);
  });
  it("limits a custom combo value while still allowing longer listed options", async () => {
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<MaterialFluidProvider motion="minimal"><Combobox label="Skill" allowCustom maxLength={5} options={[{ value: "development", label: "Development" }]} onValueChange={changed} /></MaterialFluidProvider>);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await user.type(input, "Custom long");
    expect(input.value).toBe("Custo");
    expect(screen.getByLabelText("5 of 5 characters")).not.toBeNull();
    await user.click(screen.getByRole("option", { name: "Add “Custo”" }));
    expect(changed).toHaveBeenLastCalledWith("Custo");
    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Development" }));
    expect(input.value).toBe("Development");
    expect(changed).toHaveBeenLastCalledWith("development");
  });
});

describe("form polish interactions", () => {
  it("provides a useful empty state for a Select without options", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    try {
      render(<MaterialFluidProvider motion="minimal"><Select label="Role" options={[]} placeholder="Choose a role" /></MaterialFluidProvider>);
      screen.getByRole("combobox", { name: "Role" }).focus();
      await userEvent.setup().keyboard("{Enter}");
      expect(screen.getByRole("status").textContent).toBe("No options available");
    } finally {
      cleanup();
      if (descriptor) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", descriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
    }
  });

  it("skips disabled combo options and respects read-only inputs", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const options = [{ value: "design", label: "Design", disabled: true }, { value: "research", label: "Research" }, { value: "writing", label: "Writing", disabled: true }, { value: "development", label: "Development" }];
    const { rerender } = render(<MaterialFluidProvider motion="minimal"><Combobox label="Skill" options={options} onValueChange={changed} /></MaterialFluidProvider>);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(changed).toHaveBeenLastCalledWith("research");
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(changed).toHaveBeenLastCalledWith("development");
    rerender(<MaterialFluidProvider motion="minimal"><Combobox label="Skill" options={options} readOnly onValueChange={changed} /></MaterialFluidProvider>);
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(changed).toHaveBeenCalledTimes(2);
  });
  it("supports entering a multiselect list from either end through search", async () => {
    const user = userEvent.setup();
    render(<MaterialFluidProvider motion="minimal"><MultiSelect label="Skills" options={[{ value: "design", label: "Design" }, { value: "research", label: "Research", disabled: true }, { value: "writing", label: "Writing" }]} /></MaterialFluidProvider>);
    await user.click(screen.getByRole("button", { name: "Skills: Choose options" }));
    const search = screen.getByRole("textbox", { name: "Search options" });
    await user.click(search);
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(screen.getByRole("option", { name: "Writing" }));
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(screen.getByRole("option", { name: "Design" }));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Remove Design" })).not.toBeNull();
  });
  it("resets both uncontrolled counters with their native form values", async () => {
    const user = userEvent.setup();
    render(<MaterialFluidProvider motion="minimal"><form><TextField label="Title" defaultValue="Seed" maxLength={10} /><Textarea label="Notes" defaultValue="Note" maxLength={10} /><button type="reset">Reset form</button></form></MaterialFluidProvider>);
    await user.type(screen.getByRole("textbox", { name: "Title" }), "more");
    await user.type(screen.getByRole("textbox", { name: "Notes" }), "more");
    expect(screen.getAllByLabelText("8 of 10 characters")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Reset form" }));
    expect((screen.getByRole("textbox", { name: "Title" }) as HTMLInputElement).value).toBe("Seed");
    expect((screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement).value).toBe("Note");
    expect(screen.getAllByLabelText("4 of 10 characters")).toHaveLength(2);
  });
  it("clears selected file chips when the containing form is reset", async () => {
    const user = userEvent.setup();
    render(<MaterialFluidProvider motion="minimal"><form><FileInput label="Attachment" /><button type="reset">Reset files</button></form></MaterialFluidProvider>);
    await user.upload(screen.getByLabelText("Attachment"), new File(["report"], "report.pdf", { type: "application/pdf" }));
    expect(screen.getByRole("button", { name: "Remove report.pdf" })).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Reset files" }));
    expect(screen.queryByRole("button", { name: "Remove report.pdf" })).toBeNull();
    expect(screen.getByRole("button", { name: "Attachment: Choose file" })).not.toBeNull();
  });
  it("associates the file action with its field and helper", () => {
    render(<MaterialFluidProvider motion="minimal"><FileInput label="Attachments" hint="PDF files only" accept=".pdf" multiple /></MaterialFluidProvider>);
    const action = screen.getByRole("button", { name: "Attachments: Choose files" });
    const hintId = action.getAttribute("aria-describedby")!;
    expect(document.getElementById(hintId)?.textContent).toBe("PDF files only");
  });
});


describe("navigation treatments", () => {
  it("keeps tabs Primary and supports keyboard selection", async () => {
    render(<MaterialFluidProvider motion="minimal"><Tabs label="Views" variant="danger" items={[{value:"one",label:"First",content:"First view"},{value:"two",label:"Second",content:"Second view"}]} /></MaterialFluidProvider>);
    expect(screen.getByRole("tablist").closest(".mf-tabs")?.classList.contains("mf-variant--primary")).toBe(true);
    screen.getByRole("tab", {name:"First"}).focus();
    await userEvent.setup().keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", {name:"Second"}).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Second view");
  });
  it("keeps breadcrumb links native and gives each item Ghost behavior", () => {
    render(<MaterialFluidProvider motion="minimal"><Breadcrumbs items={[{label:"Home",href:"#/"},{label:"Components"}]} /><Link href="https://example.com" target="_blank">Documentation</Link></MaterialFluidProvider>);
    expect(screen.getByRole("link", {name:"Home"}).getAttribute("href")).toBe("#/");
    expect(screen.getByRole("link", {name:"Home"}).classList.contains("mf-button--ghost")).toBe(true);
    expect(screen.getByRole("button", {name:"Components"}).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", {name:"Documentation"}).getAttribute("target")).toBe("_blank");
  });
});


describe("stepper progress", () => {
  it("updates the current step and completed steps in both directions", async () => {
    const changed = vi.fn();
    render(<MaterialFluidProvider motion="minimal"><Stepper label="Setup" onValueChange={changed} items={[{value:"account",label:"Account"},{value:"details",label:"Details"},{value:"finish",label:"Finish"}]} /></MaterialFluidProvider>);
    const account = screen.getByRole("button", {name:"Account"});
    const finish = screen.getByRole("button", {name:"Finish"});
    expect(account.getAttribute("aria-current")).toBe("step");
    await userEvent.setup().click(finish);
    expect(finish.getAttribute("aria-current")).toBe("step");
    expect(account.querySelector("[data-complete]")).not.toBeNull();
    expect(changed).toHaveBeenLastCalledWith("finish");
    await userEvent.setup().click(account);
    expect(account.getAttribute("aria-current")).toBe("step");
    expect(account.querySelector("[data-complete]")).toBeNull();
    expect(changed).toHaveBeenLastCalledWith("account");
  });
});
