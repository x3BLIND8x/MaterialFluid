export interface RadioExampleOption {
  value: string;
  label: string;
  disabled?: boolean;
  labelBefore?: boolean;
}
export interface RadiosExample {
  preset: string;
  size: "sm" | "md" | "lg";
  direction: "vertical" | "horizontal";
  labelPosition: "start" | "end";
  label: string;
  name: string;
  selected: string | null;
  required: boolean;
  disabled: boolean;
  options: string;
  items: RadioExampleOption[];
}
export const radiosOptions: Record<string, RadioExampleOption[]> = {
  plans: [
    { value: "personal", label: "Personal" },
    { value: "team", label: "Team" },
    { value: "enterprise", label: "Enterprise" },
  ],
  delivery: [
    { value: "standard", label: "Standard delivery" },
    { value: "express", label: "Express delivery" },
    { value: "pickup", label: "Collect in store" },
  ],
  sizes: [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ],
};
export const radiosDefaults: RadiosExample = {
  preset: "plans",
  size: "md",
  direction: "horizontal",
  labelPosition: "end",
  label: "Plan",
  name: "plan",
  selected: "team",
  required: false,
  disabled: false,
  options: "plans",
  items: radiosOptions.plans.map((item) => ({ ...item })),
};
export const radiosPresets = [
  ["plans", "Plans", "طرح‌ها"],
  ["vertical", "Vertical", "عمودی"],
  ["before", "Labels before", "برچسب در آغاز"],
  ["empty", "No selection", "بدون انتخاب"],
  ["disabled-option", "Disabled option", "گزینه غیرفعال"],
  ["disabled", "Disabled group", "گروه غیرفعال"],
  ["required", "Required", "الزامی"],
  ["custom", "Custom", "سفارشی"],
] as const;
export function applyRadiosPreset(
  preset: string,
  current: RadiosExample,
): RadiosExample {
  if (preset === "custom") return { ...current, preset };
  const additions: Record<string, Partial<RadiosExample>> = {
    vertical: { direction: "vertical" },
    before: { labelPosition: "start" },
    empty: { selected: null },
    "disabled-option": {
      selected: "personal",
      items: radiosOptions.plans.map((item, index) => ({
        ...item,
        disabled: index === 1,
      })),
    },
    disabled: { disabled: true },
    required: { selected: null, required: true },
  };
  return {
    ...radiosDefaults,
    items: radiosDefaults.items.map((item) => ({ ...item })),
    ...additions[preset],
    preset,
  };
}
export function localizeRadios(
  value: RadiosExample,
  fa: boolean,
): RadiosExample {
  if (!fa || value.preset === "custom") return value;
  const text: Record<string, string> = {
    Plan: "طرح",
    Personal: "شخصی",
    Team: "تیمی",
    Enterprise: "سازمانی",
    "Standard delivery": "ارسال عادی",
    "Express delivery": "ارسال سریع",
    "Collect in store": "دریافت در فروشگاه",
    Small: "کوچک",
    Medium: "متوسط",
    Large: "بزرگ",
  };
  return {
    ...value,
    label: text[value.label] ?? value.label,
    items: value.items.map((item) => ({
      ...item,
      label: text[item.label] ?? item.label,
    })),
  };
}
const html = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export function radiosExampleCode(
  v: RadiosExample,
  framework: "react" | "web",
) {
  if (framework === "web")
    return `<!-- Load materialfluid/styles.css and materialfluid/fonts.css once. -->
<mf-radios id="choices" aria-label="${html(v.label)}" name="${html(v.name)}" direction="${v.direction}" size="${v.size}" label-position="${v.labelPosition}"${v.selected !== null ? ` value="${html(v.selected)}"` : ""}${v.disabled ? " disabled" : ""}${v.required ? " required" : ""}>
${v.items.map((item) => ` <mf-radio value="${html(item.value)}"${item.disabled ? " disabled" : ""}${item.labelBefore !== undefined ? ` label-before="${item.labelBefore}"` : ""}>${html(item.label)}</mf-radio>`).join("\n")}
</mf-radios>
<script type="module">
import {defineMaterialFluidRadios} from 'materialfluid/elements';
defineMaterialFluidRadios();
document.querySelector('#choices').addEventListener('change',event=>console.log(event.detail.value));
</script>`;
  return `import {useState} from 'react';
import {Radios,Radio} from 'materialfluid';
import 'materialfluid/styles.css';
import 'materialfluid/fonts.css';
export default function Example(){
 const [value,setValue]=useState<string|null>(${JSON.stringify(v.selected)});
 return <Radios ariaLabel={${JSON.stringify(v.label)}} name={${JSON.stringify(v.name)}} direction="${v.direction}" size="${v.size}" labelPosition="${v.labelPosition}" value={value} onValueChange={setValue}${v.disabled ? " disabled" : ""}${v.required ? " required" : ""} onChange={event=>console.log(event.value,event.option,event.originalEvent)}>
${v.items.map((item) => `  <Radio value={${JSON.stringify(item.value)}}${item.disabled ? " disabled" : ""}${item.labelBefore !== undefined ? ` labelBefore={${item.labelBefore}}` : ""}>{${JSON.stringify(item.label)}}</Radio>`).join("\n")}
 </Radios>;
}`;
}
