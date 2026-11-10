export interface SwitchExample {
  preset: string;
  size: "sm" | "md" | "lg";
  labelPosition: "start" | "end";
  label: string;
  ariaLabel: string;
  supportingText: string;
  icon: string;
  unselectedIcon: string;
  glyphs: "default" | "none" | "custom" | "connection" | "language";
  checked: boolean;
  error: boolean;
  required: boolean;
  disabled: boolean;
  name: string;
  value: string;
}
export const switchDefaults: SwitchExample = {
  preset: "notifications",
  size: "md",
  labelPosition: "end",
  label: "Notifications",
  ariaLabel: "",
  supportingText: "",
  icon: "check",
  unselectedIcon: "close",
  glyphs: "default",
  checked: false,
  error: false,
  required: false,
  disabled: false,
  name: "notifications",
  value: "enabled",
};
export const switchPresets = [
  ["notifications", "Notifications", "اعلان‌ها"],
  ["selected", "Selected", "انتخاب‌شده"],
  ["icons", "Both state icons", "آیکون هر دو وضعیت"],
  ["help", "Supporting text", "متن راهنما"],
  ["error", "Error", "خطا"],
  ["required", "Required", "الزامی"],
  ["connection", "Connection", "اتصال"],
  ["language", "Language", "زبان"],
  ["custom", "Custom", "سفارشی"],
] as const;
export function applySwitchPreset(
  preset: string,
  current: SwitchExample,
): SwitchExample {
  if (preset === "custom") return { ...current, preset };
  const additions: Record<string, Partial<SwitchExample>> = {
    selected: { checked: true },
    icons: {
      glyphs: "custom",
      icon: "volume_up",
      unselectedIcon: "volume_off",
    },
    help: { supportingText: "Receive alerts for new messages" },
    error: {
      error: true,
      supportingText: "Connect to the network to enable sync",
    },
    required: { label: "Accept notifications", required: true },
    connection: { label: "Wi-Fi", glyphs: "connection" },
    language: { label: "Persian interface", glyphs: "language" },
  };
  return { ...switchDefaults, ...additions[preset], preset };
}
export function localizeSwitch(v: SwitchExample, fa: boolean): SwitchExample {
  if (!fa || v.preset === "custom") return v;
  const labels: Record<string, string> = {
    Notifications: "اعلان‌ها",
    "Receive alerts for new messages": "دریافت اعلان پیام‌های تازه",
    "Connect to the network to enable sync":
      "برای فعال‌سازی همگام‌سازی به شبکه وصل شوید",
    "Accept notifications": "پذیرش اعلان‌ها",
    "Wi-Fi": "وای‌فای",
    "Persian interface": "رابط فارسی",
  };
  return {
    ...v,
    label: labels[v.label] ?? v.label,
    supportingText: labels[v.supportingText] ?? v.supportingText,
  };
}
const html = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export function switchExampleCode(
  v: SwitchExample,
  framework: "react" | "web",
) {
  const custom = v.glyphs === "custom",
    icons = custom && !!(v.icon || v.unselectedIcon),
    attributes = ` size="${v.size}" label-position="${v.labelPosition}"${v.checked ? " checked" : ""}${v.disabled ? " disabled" : ""}${v.required ? " required" : ""}${v.error ? " error" : ""}${v.ariaLabel ? ` aria-label="${html(v.ariaLabel)}"` : ""}${v.supportingText ? ` supporting-text="${html(v.supportingText)}"` : ""}`;
  if (framework === "web")
    return `<!-- Load materialfluid/styles.css and materialfluid/fonts.css once. -->
<mf-switch id="setting"${attributes} name="${html(v.name)}" value="${html(v.value)}"${v.glyphs === "none" ? ' icon="none"' : custom ? ` icon="${html(v.icon || "none")}" unselected-icon="${html(v.unselectedIcon)}"` : v.glyphs === "connection" ? ' icon="wifi"' : v.glyphs === "language" ? ' language-off="EN" language-on="فا"' : ""}>${html(v.label)}</mf-switch>
<script type="module">
import {defineMaterialFluidSwitch} from 'materialfluid/elements';${icons ? "\nimport {registerMaterialIcons} from 'materialfluid';\nimport {materialIcons} from 'materialfluid/icons';\nregisterMaterialIcons(materialIcons);" : ""}
defineMaterialFluidSwitch();
document.querySelector('#setting').addEventListener('change',event=>console.log(event.detail.checked,event.detail.valueAttribute));
</script>`;
  return `import {useState} from 'react';
import {Switch${custom ? ", AnimatedIcon, registerMaterialIcons" : ""}} from 'materialfluid';${icons ? "\nimport {materialIcons} from 'materialfluid/icons';\nregisterMaterialIcons(materialIcons);" : ""}
import 'materialfluid/styles.css';
import 'materialfluid/fonts.css';
export default function Example(){
 const [checked,setChecked]=useState(${v.checked});
 return <Switch label={${JSON.stringify(v.label)}} size="${v.size}" labelPosition="${v.labelPosition}" checked={checked} onCheckedChange={setChecked} name={${JSON.stringify(v.name)}} value={${JSON.stringify(v.value)}}${v.ariaLabel ? ` ariaLabel={${JSON.stringify(v.ariaLabel)}}` : ""}${v.supportingText ? ` supportingText={${JSON.stringify(v.supportingText)}}` : ""}${v.error ? " error" : ""}${v.required ? " required" : ""}${v.disabled ? " disabled" : ""}${v.glyphs === "none" ? ' icon="none"' : custom ? ` icon={${v.icon ? `<AnimatedIcon name="${v.icon}"/>` : "null"}} unselectedIcon={${v.unselectedIcon ? `<AnimatedIcon name="${v.unselectedIcon}"/>` : "null"}}` : v.glyphs === "connection" ? ' icon="wifi"' : v.glyphs === "language" ? ' languageLabels={{off:"EN",on:"فا"}}' : ""} onChange={event=>console.log(event.checked,event.valueAttribute)}/>;
}`;
}
