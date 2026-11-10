import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Switch } from "../kit/controls";
import { AnimatedIcon, type IconName } from "../kit/icons";
import { materialIcons as coreIcons } from "../kit/icon-map";
import { loadIconChoices } from "./icon-picker";
import { TextField } from "../kit/forms";
import { ComponentAppearanceProvider } from "../kit/appearance";
import { Choice } from "./foundations/frame";
import {
  switchDefaults,
  switchPresets,
  applySwitchPreset,
  localizeSwitch,
  type SwitchExample,
} from "./switch-playground-model";
const IconPicker = lazy(() =>
  import("./icon-picker").then((module) => ({ default: module.IconPicker })),
);
export default function SwitchPlayground({
  value: input,
  onChange,
  fa,
}: {
  value: SwitchExample;
  onChange: (value: SwitchExample) => void;
  fa: boolean;
}) {
  const value = useMemo(() => localizeSwitch(input, fa), [input, fa]),
    latest = useRef(value);
  useLayoutEffect(() => {
    latest.current = value;
  });
  const t = useCallback((en: string, per: string) => (fa ? per : en), [fa]),
    [status, setStatus] = useState(""),
    update = useCallback(
      (patch: Partial<SwitchExample>) =>
        onChange({ ...latest.current, ...patch, preset: "custom" }),
      [onChange],
    );
  const [iconsReady,setIconsReady]=useState(false);
  useEffect(()=>{
    if(value.glyphs!=="custom"||iconsReady||[value.icon,value.unselectedIcon].every(name=>!name||coreIcons[name]))return;
    let live=true;
    void loadIconChoices().then(()=>{if(live)setIconsReady(true);}).catch(()=>{if(live)setStatus(t("Icons could not load. Open the icon picker to retry.","بارگیری آیکون‌ها ناموفق بود؛ برای تلاش دوباره انتخاب‌گر آیکون را باز کنید."));});
    return()=>{live=false;};
  },[value.glyphs,value.icon,value.unselectedIcon,iconsReady,t]);
  const controls = useMemo(
    () => (
      <ComponentAppearanceProvider size="sm" variant="outline">
        <div className="button-configuration switch-configuration">
          <section id="example-presets">
            <div className="section-heading">
              <h2>{t("Configuration", "پیکربندی")}</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onChange({ ...switchDefaults });
                  setStatus("");
                }}
              >
                {t("Reset example", "بازنشانی نمونه")}
              </Button>
            </div>
            <Choice
              label={t("Example Presets", "نمونه‌های آماده")}
              value={value.preset}
              onValueChange={(preset) =>
                onChange(applySwitchPreset(preset, latest.current))
              }
              options={switchPresets.map(([value, en, per]) => ({
                value,
                label: t(en, per),
              }))}
            />
          </section>
          <section id="switch-appearance">
            <h3>{t("Appearance", "ظاهر")}</h3>
            <div className="button-configuration-fields">
              <Choice
                label={t("Size", "اندازه")}
                value={value.size}
                onValueChange={(size) =>
                  update({ size: size as SwitchExample["size"] })
                }
                options={[
                  ["sm", "Small", "کوچک"],
                  ["md", "Medium", "متوسط"],
                  ["lg", "Large", "بزرگ"],
                ].map(([value, en, per]) => ({ value, label: t(en, per) }))}
              />
              <Choice
                label={t("Label position", "موقعیت برچسب")}
                value={value.labelPosition}
                onValueChange={(labelPosition) =>
                  update({ labelPosition: labelPosition as "start" | "end" })
                }
                options={[
                  ["start", "Start", "آغاز"],
                  ["end", "End", "پایان"],
                ].map(([value, en, per]) => ({ value, label: t(en, per) }))}
              />
            </div>
          </section>
          <section id="switch-content">
            <h3>{t("Content", "محتوا")}</h3>
            <div className="button-configuration-fields">
              <TextField
                label={t("Label", "برچسب")}
                value={value.label}
                onChange={(event) => update({ label: event.target.value })}
              />
              <TextField
                label={t("Accessible name", "نام دسترس‌پذیر")}
                value={value.ariaLabel}
                onChange={(event) => update({ ariaLabel: event.target.value })}
              />
              <TextField
                label={t("Supporting text", "متن راهنما")}
                value={value.supportingText}
                onChange={(event) =>
                  update({ supportingText: event.target.value })
                }
              />
              <Choice
                label={t("Handle content", "محتوای دستگیره")}
                value={value.glyphs}
                onValueChange={(glyphs) =>
                  update({ glyphs: glyphs as SwitchExample["glyphs"] })
                }
                options={[
                  ["default", "Default", "پیش‌فرض"],
                  ["none", "None", "بدون آیکون"],
                  ["custom", "State icons", "آیکون وضعیت"],
                  ["connection", "Connection", "اتصال"],
                  ["language", "Language", "زبان"],
                ].map(([value, en, per]) => ({ value, label: t(en, per) }))}
              />
              {value.glyphs === "custom" && (
                <Suspense fallback={null}>
                  <div
                    role="group"
                    aria-label={t("Selected icon", "آیکون انتخاب‌شده")}
                  >
                    <span>{t("Selected icon", "آیکون انتخاب‌شده")}</span>
                    <IconPicker
                      value={value.icon}
                      onChange={(icon) => update({ icon })}
                      fa={fa}
                    />
                  </div>
                  <div
                    role="group"
                    aria-label={t("Unselected icon", "آیکون انتخاب‌نشده")}
                  >
                    <span>{t("Unselected icon", "آیکون انتخاب‌نشده")}</span>
                    <IconPicker
                      value={value.unselectedIcon}
                      onChange={(unselectedIcon) => update({ unselectedIcon })}
                      fa={fa}
                    />
                  </div>
                </Suspense>
              )}
              <TextField
                label={t("Name", "نام")}
                value={value.name}
                onChange={(event) => update({ name: event.target.value })}
              />
              <TextField
                label={t("Value", "مقدار")}
                value={value.value}
                onChange={(event) => update({ value: event.target.value })}
              />
            </div>
          </section>
          <section id="switch-behavior">
            <h3>{t("Behavior", "رفتار")}</h3>
            <div className="button-behavior-switches">
              <Switch
                label={t("Selected", "انتخاب‌شده")}
                checked={value.checked}
                onCheckedChange={(checked) => update({ checked })}
              />
              <Switch
                label={t("Error", "خطا")}
                checked={value.error}
                onCheckedChange={(error) => update({ error })}
              />
              <Switch
                label={t("Required", "الزامی")}
                checked={value.required}
                onCheckedChange={(required) => update({ required })}
              />
              <Switch
                label={t("Disabled", "غیرفعال")}
                checked={value.disabled}
                onCheckedChange={(disabled) => update({ disabled })}
              />
            </div>
          </section>
        </div>
      </ComponentAppearanceProvider>
    ),
    [value, fa, t, onChange, update],
  );
  return (
    <section id="examples" aria-label={t("Live examples", "نمونه‌های زنده")}>
      <div className="live-stage">
        <div className="showcase-canvas">
          <div className="demo-primary">
            <form
              className="demo-stack switch-preview"
              onSubmit={(event) => {
                event.preventDefault();
                setStatus(
                  `${t("Submitted", "ارسال شد")}: ${new FormData(event.currentTarget).get(value.name) || t("None", "هیچ‌کدام")}`,
                );
              }}
              onReset={() => {
                onChange({ ...input, checked: false });
                setStatus(t("Form reset", "فرم بازنشانی شد"));
              }}
            >
              <Switch
                label={value.label || undefined}
                ariaLabel={value.ariaLabel || undefined}
                size={value.size}
                labelPosition={value.labelPosition}
                supportingText={value.supportingText}
                checked={value.checked}
                onCheckedChange={(checked) => onChange({ ...input, checked })}
                error={value.error}
                required={value.required}
                disabled={value.disabled}
                name={value.name}
                value={value.value}
                icon={
                  value.glyphs === "none" ? (
                    "none"
                  ) : value.glyphs === "connection" ? (
                    "wifi"
                  ) : value.glyphs === "custom" ? (
                    value.icon ? (
                      <AnimatedIcon name={value.icon as IconName} />
                    ) : null
                  ) : undefined
                }
                unselectedIcon={
                  value.glyphs === "custom" && value.unselectedIcon ? (
                    <AnimatedIcon name={value.unselectedIcon as IconName} />
                  ) : undefined
                }
                languageLabels={
                  value.glyphs === "language"
                    ? { off: "EN", on: "فا" }
                    : undefined
                }
              />
              <div className="demo-row">
                <Button type="submit" size="sm">
                  {t("Submit", "ارسال")}
                </Button>
                <Button type="reset" size="sm" variant="ghost">
                  {t("Reset form", "بازنشانی فرم")}
                </Button>
              </div>
              <output role="status" className="button-preview-status">
                {status}
              </output>
            </form>
          </div>
        </div>
      </div>
      {controls}
    </section>
  );
}
