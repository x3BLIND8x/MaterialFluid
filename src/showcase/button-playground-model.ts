import type { ComponentVariant } from "../kit/appearance";
import { isButtonToggleVariant, type ButtonSize } from "../kit/component-policy.ts";
export type ButtonPreset = "default" | "save" | "download" | "secondary" | "cancel" | "favorite" | "large" | "custom";
export interface ButtonExample {
  preset: ButtonPreset; variant: ComponentVariant; size: ButtonSize; text: string; icon: string;
  iconPosition: "start" | "end";
  selectedIcon: string | null;
  toggle: boolean; selected: boolean; emphasize: boolean; toggleOnClick: boolean; disabled: boolean; active: boolean;
  loading: boolean; loadingText: string;
  progressMode: "off" | "determinate" | "indeterminate"; progress: number;
  type: "button" | "submit" | "reset"; name: string; value: string;
}
export const buttonExampleDefaults: ButtonExample = {
  preset: "default", variant: "filled", size: "md", text: "Filled", icon: "", selectedIcon: null, iconPosition: "start",
  toggle: false, selected: false, emphasize: false, toggleOnClick: true, disabled: false, active: false, loading: false,
  loadingText: "", progressMode: "off", progress: 60, type: "button", name: "action", value: "save",
};
export const buttonPresetNames: [ButtonPreset, string, string][] = [
  ["default", "Default", "پیش‌فرض"], ["save", "Save", "ذخیره"], ["download", "Download", "دانلود"],
  ["secondary", "Secondary", "ثانویه"], ["cancel", "Cancel", "لغو"], ["favorite", "Favorite", "علاقه‌مندی"],
  ["large", "Large", "بزرگ"], ["custom", "Custom", "سفارشی"],
];
export function applyButtonPreset(preset: ButtonPreset, current: ButtonExample): ButtonExample {
  if (preset === "custom") return { ...current, preset };
  const values: Partial<Record<ButtonPreset, Partial<ButtonExample>>> = {
    save: { text: "Save", icon: "check" }, download: { text: "Download", icon: "download" },
    secondary: { variant: "tonal", text: "Learn more" }, cancel: { variant: "ghost", text: "Cancel" },
    favorite: { variant: "tonal", text: "Favorite", icon: "favorite", toggle: true },
    large: { size: "lg", text: "Get started", icon: "arrow_forward" },
  };
  return { ...buttonExampleDefaults, ...values[preset], preset };
}
export function buttonExampleText(value: ButtonExample, fa: boolean) {
  if (!fa || value.preset === "custom") return value.text;
  return ({ default: "پر", save: "ذخیره", download: "دانلود", secondary: "بیشتر بدانید", cancel: "لغو", favorite: "علاقه‌مندی", large: "شروع کنید" } as const)[value.preset];
}
const html = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
export function buttonExampleCode(input: ButtonExample, framework: "react" | "web") {
  const toggle = input.toggle && isButtonToggleVariant(input.variant,input.emphasize);
  const value = { ...input, toggle, selected: toggle && input.selected };
  const iconNames=[...new Set([value.icon,value.selectedIcon].filter((name):name is string=>!!name))];
  const iconImports = iconNames.length ? '\nimport { materialIcons } from "materialfluid/icons";' : "";
  const registration = iconNames.length ? `\nregisterMaterialIcons({ ${iconNames.map(name=>`[${JSON.stringify(name)}]: materialIcons[${JSON.stringify(name)}]`).join(", ")} });\n` : "";
  if (framework === "web") {
    const attrs = [`variant="${html(value.variant)}"`, `size="${value.size}"`];
    if (toggle && value.emphasize) attrs.push("emphasize");
  if (value.icon) { attrs.push(`icon="${html(value.icon)}"`, `icon-position="${value.iconPosition}"`); }
    if (value.selectedIcon) attrs.push(`selected-icon="${html(value.selectedIcon)}"`);
    if (!value.text) attrs.push('aria-label="Action"');
    for (const key of ["toggle", "selected", "disabled", "active", "loading"] as const) if (value[key]) attrs.push(key);
    if (!value.toggleOnClick) attrs.push('toggle-on-click="false"');
    if (value.loadingText) attrs.push(`loading-text="${html(value.loadingText)}"`);
    if (value.progressMode !== "off") attrs.push(`progress="${value.progressMode === "indeterminate" ? "indeterminate" : value.progress}"`);
    if (value.type !== "button") attrs.push(`type="${value.type}"`, `name="${html(value.name)}"`, `value="${html(value.value)}"`);
    const markup = `<mf-button ${attrs.join(" ")}>${html(value.text)}</mf-button>`;
    return `<script type="module">\nimport { defineMaterialFluidButton } from "materialfluid/elements";${iconNames.length ? '\nimport { registerMaterialIcons } from "materialfluid";' : ""}${iconImports}\nimport "materialfluid/styles.css";\nimport "materialfluid/fonts.css";\n${registration}\ndefineMaterialFluidButton();\n</script>\n\n${value.type === "button" ? markup : `<form id="example-form">\n  <input name="project" value="MaterialFluid" aria-label="Project" />\n  ${markup}\n</form>`}\n\n<script type="module">\nconst button = document.querySelector("mf-button");\nbutton.addEventListener("${value.toggle ? "change" : "click"}", event => console.log(${value.toggle ? "event.detail" : '"Action activated"'}));${value.type === "submit" ? '\ndocument.querySelector("#example-form").addEventListener("submit", event => {\n  event.preventDefault();\n  console.log(new FormData(event.currentTarget, event.submitter));\n});' : ""}\n</script>`;
  }
  const attrs = [`variant="${value.variant}"`, `size="${value.size}"`];
  if(toggle && value.emphasize) attrs.push("emphasize");
  if (value.icon) { attrs.push(`icon=${JSON.stringify(value.icon)}`, `iconPosition="${value.iconPosition}"`); }
  if (value.toggle) attrs.push(value.selectedIcon ? `selectedIcon=${JSON.stringify(value.selectedIcon)}` : "selectedIcon={null}");
  if (!value.text) attrs.push('aria-label="Action"');
  if (value.toggle) attrs.push("toggle", "selected={selected}", "onSelectedChange={setSelected}");
  if (!value.toggleOnClick) attrs.push("toggleOnClick={false}");
  for (const key of ["disabled", "active", "loading"] as const) if (value[key]) attrs.push(key);
  if (value.loadingText) attrs.push(`loadingText={${JSON.stringify(value.loadingText)}}`);
  if (value.progressMode !== "off") attrs.push(`progress={${value.progressMode === "indeterminate" ? "null" : value.progress}}`);
  if (value.type !== "button") attrs.push(`type="${value.type}"`, `name={${JSON.stringify(value.name)}}`, `value={${JSON.stringify(value.value)}}`);
  else attrs.push('onClick={() => console.log("Action activated")}');
  const button = `<Button ${attrs.join(" ")}>{${JSON.stringify(value.text)}}</Button>`;
  return `${value.toggle ? 'import { useState } from "react";\n' : ""}import { Button, MaterialFluidProvider${iconNames.length ? ", registerMaterialIcons" : ""} } from "materialfluid";${iconImports}\nimport "materialfluid/styles.css";\nimport "materialfluid/fonts.css";\n${registration}\nexport default function Example() {\n${value.toggle ? `  const [selected, setSelected] = useState(${value.selected});\n` : ""}  return (\n    <MaterialFluidProvider>\n      ${value.type === "button" ? button : `<form${value.type === "submit" ? ' onSubmit={event => { event.preventDefault(); console.log(new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter)); }}' : ""}>\n        <input name="project" defaultValue="MaterialFluid" aria-label="Project" />\n        ${button}\n      </form>`}\n    </MaterialFluidProvider>\n  );\n}`;
}
