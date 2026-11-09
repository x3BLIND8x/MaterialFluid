import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { catalogue } from "../src/showcase/catalogue.ts";
import { usageFor } from "../src/showcase/usage.ts";
import { buttonExampleDefaults, applyButtonPreset, buttonPresetNames, buttonExampleCode } from "../src/showcase/button-playground-model.ts";
import { iconButtonExampleDefaults, applyIconButtonPreset, iconButtonPresetNames, iconButtonExampleCode } from "../src/showcase/icon-button-playground-model.ts";
import { spawnSync } from "node:child_process";
const folder = ".cache/package-smoke/examples";
await rm(folder, { recursive: true, force: true });
await mkdir(folder, { recursive: true });
for (const entry of catalogue) {
  await writeFile(`${folder}/${entry.id}.tsx`, usageFor(entry));
  await writeFile(`${folder}/${entry.id}-appearance.tsx`, usageFor(entry, {variant:"tertiary", size:"sm"}));
}
const buttonExamples = [
  ...buttonPresetNames.map(([preset]) => applyButtonPreset(preset, buttonExampleDefaults)),
  ...["xs", "sm", "md", "lg", "xl"].map(size => ({ ...buttonExampleDefaults, size })),
  { ...buttonExampleDefaults, toggle: true, selected: true, progressMode: "determinate", progress: 75 },
  { ...buttonExampleDefaults, icon: "rocket_launch", iconPosition: "end", loading: true, loadingText: "Launching", progressMode: "indeterminate" },
  { ...buttonExampleDefaults, type: "submit", name: 'action "name"', value: '<save & "confirm">', loadingText: 'Saving "draft"' }, { ...buttonExampleDefaults, type: "reset" },
];
for (const [index, example] of buttonExamples.entries()) {
  await writeFile(`${folder}/button-api-${index}.tsx`, buttonExampleCode(example, "react"));
  await writeFile(`${folder}/button-api-${index}.html`, buttonExampleCode(example, "web"));
}
const iconButtonExamples=[
  ...iconButtonPresetNames.map(([preset])=>applyIconButtonPreset(preset,iconButtonExampleDefaults)),
  ...["xs","sm","md","lg","xl"].flatMap(size=>["narrow","default","wide"].map(width=>({...iconButtonExampleDefaults,size,width}))),
  {...applyIconButtonPreset("favorite",iconButtonExampleDefaults),selected:true},
  {...iconButtonExampleDefaults,label:'Save "draft" <now>',preset:"custom",icon:"rocket_launch",type:"submit",name:'action "name"'},
  {...iconButtonExampleDefaults,type:"reset",progressMode:"determinate",progress:42},
  {...applyIconButtonPreset("emphasize",iconButtonExampleDefaults),selected:true},
];
for(const [index,example] of iconButtonExamples.entries()){
  await writeFile(`${folder}/icon-button-api-${index}.tsx`,iconButtonExampleCode(example,"react"));
  await writeFile(`${folder}/icon-button-api-${index}.html`,iconButtonExampleCode(example,"web"));
}
await writeFile(`${folder}/icon-button-element-api.tsx`, `
import { IconButton } from "materialfluid";
import { defineMaterialFluidIconButton, MaterialFluidIconButtonElement } from "materialfluid/elements";
defineMaterialFluidIconButton();
const button: MaterialFluidIconButtonElement = document.createElement("mf-icon-button");
button.toggle = true;
button.setIcon("heart").setSelectedIcon("check").setAriaLabel("Favorite").setVariant("tonal").setSize("xl").setWidth("wide").select();
button.toggleSelected().deselect().removeClass("example");
button.getSelectedIcon(); button.getWidth(); button.getAriaLabel(); button.isToggle();
void button.updateComplete;
const alternate = <IconButton ariaLabel="Edit" icon="edit" width="narrow" size="xs" />;
// @ts-expect-error An accessible name is required.
const unnamed = <IconButton icon="edit" />;
// @ts-expect-error Square is excluded.
const square = <IconButton label="Edit" shape="square" />;
// @ts-expect-error Elevated is excluded.
const elevated = <IconButton label="Edit" variant="elevated" />;
// @ts-expect-error Authored ripple is not a public tuning option.
const ripple = <IconButton label="Edit" ripple={false} />;
`);
await writeFile(`${folder}/button-element-api.tsx`, `
import { defineMaterialFluidButton, MaterialFluidButtonElement } from "materialfluid/elements";
defineMaterialFluidButton();
const button: MaterialFluidButtonElement = document.createElement("mf-button");
button.setText("Save").setIcon("check").setSize("xl").setVariant("tonal").setSelected(true);
void button.setLoading(true, "Saving");
void button.setProgress(60);
void button.updateComplete;
`);
await writeFile(`${folder}/foundation-api.tsx`, `
import { Foundations, MaterialFluidProvider } from "materialfluid";
const css = Foundations.foundationThemeToCss({colorPreset:"neutral",colorScheme:"expressive"});
const theme = Foundations.createFoundationTheme({seed:"#eedd96",colorScheme:"tonalSpot"});
const palette = Foundations.generateScheme({seed:"#7d9dff",variant:"fidelity"});
const image = <svg viewBox="0 0 100 100"><path d={Foundations.shapePaths.flower}/></svg>;
const screen = <MaterialFluidProvider colorScheme="vibrant"><p className="mf-type-body-large">Foundation</p>{image}</MaterialFluidProvider>;
void [css,theme,palette,screen];
`);
const shadcnExamples = JSON.parse(await readFile("src/showcase/shadcn/usage.json", "utf8"));
for (const [id, source] of Object.entries(shadcnExamples)) await writeFile(`${folder}/shadcn-${id}.tsx`, source);
await writeFile(`${folder}/presentation-policy.tsx`, `
import { Accordion, Dialog, AlertDialog, Menu, AnimatedIcon, Switch, Button, Progress, FileInput, MaterialFluidProvider, Badge, createNeutralTheme, type NeutralColorSettings, type ProgressWaveOptions } from "materialfluid";
// @ts-expect-error Button icons follow the appearance size.
const iconSizeOverride = <Button iconSize={30} />;
// @ts-expect-error Ripple is fixed to the authored default.
const rippleOverride = <Button ripple={false} />;
// @ts-expect-error Button tuning is internal.
const pressOverride = <Button pressMotion={{ scale: .8 }} />;
// @ts-expect-error Button tuning is internal.
const sizeOverride = <Button sizeMotion={false} />;
// @ts-expect-error Button tuning is internal.
const colorOverride = <Button colorMotion={false} />;
// @ts-expect-error Provider tuning is internal.
const providerOverride = <MaterialFluidProvider buttonMotion={{ pressDepth: 20 }} />;
// @ts-expect-error Shared text morph uses its authored defaults.
const textOverride = <MaterialFluidProvider textMorph={{ duration: 500 }} />;
void [iconSizeOverride, rippleOverride, pressOverride, sizeOverride, colorOverride, providerOverride, textOverride];
// @ts-expect-error Icon timing uses authored defaults.
const iconTimingOverride = <AnimatedIcon duration={2} />;
// @ts-expect-error Switch glyph timing uses authored defaults.
const switchTimingOverride = <Switch label="Connection" iconMotion={{ duration: 2 }} />;
void [iconTimingOverride, switchTimingOverride];
// @ts-expect-error Accordion physics are fixed defaults.
const accordionOverride = <Accordion items={[]} motionSettings={{ stiffness: 900 }} />;
// @ts-expect-error Dialog physics are fixed defaults.
const dialogOverride = <Dialog title="Details" motionSettings={{ stiffness: 900 }} />;
// @ts-expect-error AlertDialog physics are fixed defaults.
const alertOverride = <AlertDialog title="Confirm" motionSettings={{ stiffness: 900 }} />;
// @ts-expect-error Menu motion is fixed to the authored defaults.
const menuOverride = <Menu label="Actions" items={[]} motionSettings={{ scale: .8 }} />;
void [accordionOverride, dialogOverride, alertOverride, menuOverride];
const neutral: NeutralColorSettings = { surfaceTint: 0, accentStrength: 100 };
void createNeutralTheme("#7d9dff", false, undefined, neutral);
const palettePreview = <MaterialFluidProvider colorPreset="neutral" neutralColors={neutral}><Badge presentation="dot" size="sm" aria-label="Unread messages" /></MaterialFluidProvider>;
void palettePreview;
const wave: ProgressWaveOptions = { waveLength: 60, waveHeight: 20, waveVelocity: 31, direction: "tail", waveThickness: 5, trackThickness: 20, incremental: true };
// @ts-expect-error FileInput intentionally has no Large variant.
const unsupported = <FileInput label="Attachment" size="lg" />;
void unsupported;
export default function Presentations() { return <>
  <Progress label="Upload" value={65} wave={wave} />
  <Progress label="Upload" value={30} presentation="segmented" segments={8} />
  <Progress label="Update" value={30} presentation="wavy" showStatus status="Updating" remaining="8s left" />
  <FileInput label="Attachment" size="sm" />
  <FileInput label="Attachment" size="md" />
</>; }
`);
await writeFile(
  ".cache/package-smoke/tsconfig.examples.json",
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
    },
    include: ["examples/*.tsx"],
  }),
);
const result = spawnSync(
  process.execPath,
  [
    "node_modules/typescript/bin/tsc",
    "-p",
    ".cache/package-smoke/tsconfig.examples.json",
  ],
  { encoding: "utf8" },
);
if (result.status !== 0) throw Error(result.stdout || result.stderr);
console.log(
  `All ${catalogue.length} default and ${catalogue.length} size examples, ${buttonExamples.length} Button and ${iconButtonExamples.length} IconButton React examples, plus ${Object.keys(shadcnExamples).length} shadcn examples, Progress presentations and the FileInput size policy typecheck against the installed package. Matching Button Web Component HTML recipes were generated; browser checks validate the adapter.`,
);
