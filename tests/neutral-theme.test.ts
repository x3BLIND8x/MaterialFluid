import { describe, it, expect } from 'vitest';
import { argbFromHex, Hct, Contrast, lstarFromArgb } from '@material/material-color-utilities';
import { createNeutralTheme, normalizeNeutralColors } from '../src/kit/theme-neutral';
import { colorSchemes } from '../src/kit/theme';
import { loadPreferences, savePreferences, preferenceDefaults } from '../src/showcase/preferences';
const ratio=(a:string,b:string)=>Contrast.ratioOfTones(lstarFromArgb(argbFromHex(a)),lstarFromArgb(argbFromHex(b)));
describe('neutral seed palette',()=>{
 it('applies selected algorithms to component color families while retaining neutral surfaces and readable light fills',()=>{
  for(const seed of ['#eedd96','#0000ff'])for(const dark of [false,true]) {
   const original=createNeutralTheme(seed,dark);
   for(const scheme of colorSchemes)for(const strength of [0,100]) {
    const tokens=createNeutralTheme(seed,dark,undefined,{accentStrength:strength},scheme);
    expect(tokens['--mf-canvas']).toBe(original['--mf-canvas']);
    for(const role of ['primary','secondary','tertiary']) {
     const fill=tokens[`--mf-${role}-fill`],ink=tokens[`--mf-on-${role}-fill`];
     expect(Hct.fromInt(argbFromHex(fill)).tone).toBeGreaterThan(84);
     expect(ratio(fill,ink)).toBeGreaterThanOrEqual(7);
     for(const surface of ['canvas','surface-container','surface-high'])expect(ratio(tokens[`--mf-${role}-plain-ink`],tokens[`--mf-${surface}`])).toBeGreaterThanOrEqual(7);
     expect(tokens[`--mf-palette-${role}-fill`]).toBe(fill);
     if(strength===0||scheme==='monochrome')expect(Hct.fromInt(argbFromHex(fill)).chroma).toBeLessThan(3);
    }
    expect(tokens['--mf-action-filled']).toBe(tokens['--mf-primary-fill']);
    expect(tokens['--mf-action-tonal']).toBe(tokens['--mf-secondary-container']);
   }
   const expressive=createNeutralTheme(seed,dark,undefined,undefined,'expressive');
   // Different algorithms may share a primary after the owner's chroma cap;
   // their complete accent families must still reach components.
   if(seed==='#eedd96')expect(expressive['--mf-primary-fill']).not.toBe(original['--mf-primary-fill']);
   expect(expressive['--mf-secondary-container']).not.toBe(original['--mf-secondary-container']);
  }
 });
 it('keeps light primary fills and readable paired ink across seeds, modes and control extremes',()=>{
  for(const seed of ['#eedd96','#0000ff','#ff0000','#00ff00','#000000','#ffffff'])for(const dark of [false,true])for(const strength of [0,100])for(const tint of [0,100]){
   const p=createNeutralTheme(seed,dark,undefined,{accentStrength:strength,surfaceTint:tint});
   expect(Hct.fromInt(argbFromHex(p['--mf-primary'])).tone).toBeGreaterThan(84);
   expect(ratio(p['--mf-primary'],p['--mf-on-primary'])).toBeGreaterThanOrEqual(7);
   for(const bg of ['canvas','surface-container','surface-high']){
    expect(ratio(p['--mf-'+bg],p['--mf-on-surface'])).toBeGreaterThanOrEqual(7);
    expect(ratio(p['--mf-'+bg],p['--mf-on-surface-variant'])).toBeGreaterThanOrEqual(7);
    expect(ratio(p['--mf-'+bg],p['--mf-primary-plain-ink'])).toBeGreaterThanOrEqual(7);
    expect(ratio(p['--mf-'+bg],p['--mf-outline'])).toBeGreaterThanOrEqual(3);
   }
   expect(p['--mf-palette-primary']).toBe(p['--mf-primary']);
  }
 });
 it('keeps untinted neutrals independent of the seed and changes only the requested color families',()=>{
  const a=createNeutralTheme('#ff0000'),b=createNeutralTheme('#0000ff');expect(a['--mf-canvas']).toBe(b['--mf-canvas']);expect(a['--mf-primary']).not.toBe(b['--mf-primary']);
  const muted=createNeutralTheme('#ff0000',false,undefined,{accentStrength:0});expect(Hct.fromInt(argbFromHex(muted['--mf-primary'])).chroma).toBeLessThan(3);
  const tinted=createNeutralTheme('#ff0000',false,undefined,{surfaceTint:100});expect(tinted['--mf-surface-high']).not.toBe(a['--mf-surface-high']);expect(tinted['--mf-primary']).toBe(a['--mf-primary']);
 });
 it('normalizes and persists the preset without losing original palette tuning',()=>{
  expect(normalizeNeutralColors({surfaceTint:-5,accentStrength:Infinity})).toEqual({surfaceTint:0,accentStrength:100});
  let saved='';const prefs={...preferenceDefaults,colorPreset:'neutral' as const,neutralColors:{surfaceTint:12,accentStrength:70}};savePreferences(prefs,{setItem:(_,value)=>{saved=value;}});expect(loadPreferences({getItem:()=>saved})).toEqual(prefs);
 });
});
