import { describe, it, expect } from "vitest";
import { materialIcons } from "../src/kit/material-icons";
import {
  getMaterialIcon,
  registerMaterialIcons,
} from "../src/kit/icon-registry";
import { isStrokeIcon } from "../src/kit/icon-strokes";
import report from "../src/kit/icon-generation-report.json";

describe("generated Material icon pack", () => {
  it("covers every source symbol and retains valid vector and reveal geometry", () => {
    expect(report.canonicalCount).toBe(4301);
    expect(Object.keys(materialIcons)).toHaveLength(
      report.canonicalCount + report.aliasCount,
    );
    for (const entry of report.icons) {
      const glyph = materialIcons[entry.name];
      expect(glyph, entry.name).toBeDefined();
      expect(glyph.symbol, entry.name).toBe(entry.name);
      expect(glyph.paths[0].length, entry.name).toBeGreaterThan(0);
      expect(glyph.paths[0], entry.name).not.toMatch(/NaN|Infinity/);
      expect(!!glyph.strokes, entry.name).toBe(entry.animation === "stroke");
      if (glyph.strokes) {
        expect(glyph.revealWidth, entry.name).toBeGreaterThan(0);
        expect(glyph.strokes.length, entry.name).toBeLessThanOrEqual(48);
      }
    }
  });
  it("registers optional icons without changing compatibility alias artwork", () => {
    registerMaterialIcons(materialIcons);
    expect(getMaterialIcon("rocket_launch").symbol).toBe("rocket_launch");
    expect(getMaterialIcon("plus")).toEqual(getMaterialIcon("add"));
    for (const name of [
      "menu",
      "check",
      "close",
      "download",
      "external",
    ] as const)
      expect(isStrokeIcon(name), name).toBe(true);
    for (const name of ["heart", "bell", "activity"] as const)
      expect(isStrokeIcon(name), name).toBe(false);
  });
});
