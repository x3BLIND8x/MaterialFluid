import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  createMiscColorTokens,
  miscColors,
  identityColor,
} from "../src/kit/misc-colors";
import { ComponentAppearanceProvider } from "../src/kit/appearance";
import { MaterialFluidProvider } from "../src/kit/provider";
import { OTPInput, FileInput } from "../src/kit/forms";
import { Calendar } from "../src/kit/dates";
import { Progress } from "../src/kit/feedback";
import { Badge } from "../src/kit/surfaces";
import { sizesForComponent } from "../src/kit/component-policy";
afterEach(cleanup);
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});
function luminance(hex: string) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
describe("shared design policy", () => {
  it("pairs every miscellaneous identity/status color with readable ink in both themes", () => {
    for (const dark of [false, true]) {
      const colors = createMiscColorTokens(dark);
      for (const name of miscColors) {
        const a = luminance(colors[`--mf-misc-${name}`]),
          b = luminance(colors[`--mf-on-misc-${name}`]);
        expect(
          (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(identityColor("Café")).toBe(identityColor("Cafe\u0301"));
    expect(
      new Set(
        [
          "Nora Chen",
          "Arman Rezaei",
          "Sara Wilson",
          "Mina Park",
          "Sam Reed",
        ].map(identityColor),
      ).size,
    ).toBeGreaterThan(2);
  });
  it("keeps unsupported group sizes out of OTP and badge presentation", () => {
    render(
      <MaterialFluidProvider>
        <ComponentAppearanceProvider size="lg">
          <OTPInput label="Code" />
          <Badge>Ready</Badge>
          <FileInput label="Attachment" />
        </ComponentAppearanceProvider>
      </MaterialFluidProvider>,
    );
    expect(screen.getByRole("group", { name: "Code" }).className).toContain(
      "mf-scale--md",
    );
    expect(screen.getByRole("group", { name: "Code" }).className).not.toContain(
      "mf-scale--lg",
    );
    expect(screen.getByText("Ready").className).toContain("mf-scale--md");
    expect(sizesForComponent("otp-input")).toEqual(["sm", "md"]);
    expect(sizesForComponent("progress")).toEqual(["md"]);
    expect(sizesForComponent("file-input")).toEqual(["sm", "md"]);
    expect(
      screen.getByLabelText("Attachment").closest(".mf-field")?.className,
    ).toContain("mf-scale--md");
  });
  it("renders four weeks for February 2026 without adding a blank row", () => {
    const { container } = render(
      <MaterialFluidProvider motion="minimal">
        <Calendar calendar="gregorian" defaultValue="2026-02-14" />
      </MaterialFluidProvider>,
    );
    expect(container.querySelectorAll(".rdp-week")).toHaveLength(4);
    expect(
      container.querySelectorAll(".rdp-day:not(.rdp-outside)"),
    ).toHaveLength(28);
  });
  it("fills separated progress segments proportionally", () => {
    const { container } = render(
      <MaterialFluidProvider motion="minimal">
        <Progress
          label="Upload"
          value={50}
          presentation="segmented"
          segments={7}
        />
      </MaterialFluidProvider>,
    );
    const fills = Array.from(
      container.querySelectorAll<HTMLElement>(".mf-progress-segment > span"),
      (el) => el.style.width,
    );
    expect(fills).toEqual(["100%", "100%", "100%", "50%", "0%", "0%", "0%"]);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "50",
    );
  });
  it("exposes status and remaining time with the actual percentage", () => {
    render(
      <MaterialFluidProvider motion="minimal">
        <Progress
          label="Update"
          value={30}
          presentation="status"
          status="Update in progress"
          remaining="8s left"
        />
      </MaterialFluidProvider>,
    );
    expect(screen.getByText("30%")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe(
      "30%, Update in progress, 8s left",
    );
  });
});
