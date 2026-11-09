import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createFoundationTheme, foundationThemeToCss } from "../src/kit/foundations/theme";
import { foundationCorners, foundationDepth, foundationTypeScale } from "../src/kit/foundations/owner-tokens";
import { generateScheme, schemeVariants } from "../src/kit/foundations/color-engine";
import { foundationMotion, foundationMotionCurve, foundationSpring } from "../src/kit/foundations/motion";
import { shapeNames, shapePaths } from "../src/kit/foundations/material-shapes";
import { align, lerpPoints, signedArea, smoothPath, samplePath } from "../src/kit/foundations/shape-morph";
import { contrastRatio, foregroundForColor } from "../src/kit/foundations/accessibility";
import { typeRoles } from "../src/kit/foundations/typography";

describe("reference architecture with owner foundation defaults", () => {
  it("settles after exactly two target crossings, or three for Press, with a monotone fast tail", () => {
    for(const purpose of ["press","resize","dialog","popup"] as const){
      const curve=foundationMotionCurve(purpose);let previous=-1,crossings=0;
      for(let i=1;i<10000;i++){
        const side=Math.sign(curve.at(i/10000*curve.duration)-1);
        if(side&&side!==previous){crossings++;previous=side;}
      }
      expect(crossings,purpose).toBe(purpose==="press"?3:2);
      let distance=Math.abs(curve.at(curve.settleAt)-1);
      for(let ms=curve.settleAt;ms<=curve.duration;ms+=1){const next=Math.abs(curve.at(ms)-1);expect(next).toBeLessThanOrEqual(distance+1e-12);distance=next;}
      expect(curve.at(curve.duration)).toBe(1);expect(curve.at(curve.duration+100)).toBe(1);
      expect(curve.duration-curve.settleAt).toBeCloseTo(120);
    }
  });
  it("preserves every pre-migration color token in both presets across six seeds and both modes", () => {
    const baseline = JSON.parse(readFileSync("reports/foundations-2026-11-08/owner-color-baseline.json", "utf8")) as {seed:string; dark:boolean; preset:"standard"|"neutral"; tokens:Record<string,string>}[];
    expect(baseline).toHaveLength(24);
    for (const {seed,dark,preset,tokens} of baseline) {
      const current=createFoundationTheme({seed,dark,colorPreset:preset});
      for (const [role,value] of Object.entries(tokens)) expect(current[role], `${seed} ${dark} ${preset} ${role}`).toBe(value);
    }
  });
  it("generates all nine complete light/dark schemes and rejects invalid seeds", () => {
    for (const variant of Object.keys(schemeVariants) as (keyof typeof schemeVariants)[]) {
      const scheme=generateScheme({seed:"#7d9dff",variant});
      expect(Object.keys(scheme.light).length).toBeGreaterThan(45);
      expect(Object.keys(scheme.light)).toEqual(Object.keys(scheme.dark));
      expect(contrastRatio(scheme.light.onSurface,scheme.light.surface)).toBeGreaterThan(7);
      expect(contrastRatio(scheme.dark.onSurface,scheme.dark.surface)).toBeGreaterThan(7);
      expect(Object.keys(scheme.palettes.primary)).toHaveLength(24);
      for(const palette of Object.values(scheme.palettes))for(const color of Object.values(palette))expect(contrastRatio(foregroundForColor(color),color)).toBeGreaterThanOrEqual(4.5);
    }
    expect(()=>generateScheme({seed:"invalid"})).toThrow(/six-digit/);
    expect(generateScheme({seed:"#eedd96",contrast:NaN}).contrast).toBe(0);
  });
  it("keeps authored curves, mass, radii, flat depth and all semantic type roles", () => {
    expect(foundationMotion.press).toEqual({stiffness:700,damping:20,mass:1.5});
    expect(foundationMotion.resize).toEqual({stiffness:700,damping:30,mass:1.5});
    const normalized=foundationSpring("press");
    expect(normalized.stiffness).toBeCloseTo(700/1.5);
    expect(normalized.dampingRatio).toBeCloseTo(20/(2*Math.sqrt(700*1.5)));
    expect(foundationMotionCurve("press").points.at(-1)![1]).toBeCloseTo(1,2);
    expect(foundationCorners).toMatchObject({sm:14,md:24,lg:29});expect(foundationDepth.shadow).toBe("none");
    expect(typeRoles).toHaveLength(15);expect(Object.keys(foundationTypeScale)).toHaveLength(30);
    expect(foundationTypeScale["body-large"]).toMatchObject({size:15,lineHeight:23.25});
  });
  it("retains 35 distinct shape paths and aligns/interpolates closed outlines", () => {
    expect(shapeNames).toHaveLength(35);expect(new Set(shapeNames.map(name=>shapePaths[name])).size).toBe(35);
    const from: [number,number][]=[[0,0],[10,0],[10,10],[0,10]];
    const shifted=[...from.slice(2),...from.slice(0,2)];expect(align(from,shifted)).toEqual(from);
    expect(lerpPoints(from,from,.5)).toEqual(from);expect(signedArea(from)).toBe(100);expect(smoothPath(from)).toMatch(/^M .* Z$/);
    expect(samplePath(shapePaths.circle)).toBeNull();
  });
  it("serializes scoped CSS with owner fonts and no elevation API", () => {
    const css=foundationThemeToCss({colorPreset:"neutral"});
    expect(css).toContain('.mf-root[data-theme="light"]');expect(css).toContain('.mf-root[data-theme="dark"]');
    expect(css).toContain("Nunito Variable");expect(css).toContain("Vazirmatn RD");expect(css).toContain("--mf-depth-shadow: none");
    expect(css).not.toContain("--ex-");expect(css).not.toContain("--mf-elevation");
    expect(()=>foundationThemeToCss({},".x { color: red }")).toThrow(/selector/);
  });
});
