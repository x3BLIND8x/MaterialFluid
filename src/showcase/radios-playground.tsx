import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button, RadioGroup, Switch } from "../kit/controls";
import { TextField } from "../kit/forms";
import { ComponentAppearanceProvider } from "../kit/appearance";
import { Choice } from "./foundations/frame";
import {
  radiosDefaults,
  radiosPresets,
  radiosOptions,
  applyRadiosPreset,
  localizeRadios,
  type RadiosExample,
} from "./radios-playground-model";
export default function RadiosPlayground({
  value: input,
  onChange,
  fa,
}: {
  value: RadiosExample;
  onChange: (value: RadiosExample) => void;
  fa: boolean;
}) {
  const value = useMemo(() => localizeRadios(input, fa), [input, fa]),
    latest = useRef(value);
  useLayoutEffect(() => {
    latest.current = value;
  });
  const t = useCallback((en: string, per: string) => (fa ? per : en), [fa]),
    [status, setStatus] = useState(""),
    update = useCallback(
      (patch: Partial<RadiosExample>) =>
        onChange({ ...latest.current, ...patch, preset: "custom" }),
      [onChange],
    );
  const controls = useMemo(
    () => (
      <ComponentAppearanceProvider size="sm" variant="outline">
        <div className="button-configuration radios-configuration">
          <section id="example-presets">
            <div className="section-heading">
              <h2>{t("Configuration", "پیکربندی")}</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onChange({
                    ...radiosDefaults,
                    items: radiosDefaults.items.map((item) => ({ ...item })),
                  });
                  setStatus("");
                }}
              >
                {t("Reset example", "بازنشانی نمونه")}
              </Button>
            </div>
            <Choice
              label={t("Example Presets", "نمونه‌های آماده")}
              value={value.preset}
              onValueChange={(preset) => {
                onChange(applyRadiosPreset(preset, latest.current));
                setStatus("");
              }}
              options={radiosPresets.map(([value, en, per]) => ({
                value,
                label: t(en, per),
              }))}
            />
          </section>
          <section id="radios-appearance">
            <h3>{t("Appearance", "ظاهر")}</h3>
            <div className="button-configuration-fields">
              <Choice
                label={t("Size", "اندازه")}
                value={value.size}
                onValueChange={(size) =>
                  update({ size: size as RadiosExample["size"] })
                }
                options={[
                  ["sm", "Small", "کوچک"],
                  ["md", "Medium", "متوسط"],
                  ["lg", "Large", "بزرگ"],
                ].map(([value, en, per]) => ({ value, label: t(en, per) }))}
              />
              <Choice
                label={t("Direction", "جهت")}
                value={value.direction}
                onValueChange={(direction) =>
                  update({ direction: direction as RadiosExample["direction"] })
                }
                options={[
                  { value: "horizontal", label: t("Horizontal", "افقی") },
                  { value: "vertical", label: t("Vertical", "عمودی") },
                ]}
              />
              <Choice
                label={t("Label position", "موقعیت برچسب")}
                value={value.labelPosition}
                onValueChange={(labelPosition) =>
                  update({
                    labelPosition:
                      labelPosition as RadiosExample["labelPosition"],
                  })
                }
                options={[
                  { value: "start", label: t("Start", "آغاز") },
                  { value: "end", label: t("End", "پایان") },
                ]}
              />
            </div>
          </section>
          <section id="radios-content">
            <h3>{t("Content", "محتوا")}</h3>
            <div className="button-configuration-fields">
              <TextField
                label={t("Accessible group name", "نام دسترس‌پذیر گروه")}
                value={value.label}
                onChange={(event) => update({ label: event.target.value })}
              />
              <TextField
                label={t("Name", "نام")}
                value={value.name}
                onChange={(event) => update({ name: event.target.value })}
              />
              <Choice
                label={t("Options", "گزینه‌ها")}
                value={value.options}
                onValueChange={(options) => {
                  const items = radiosOptions[options].map((item) => ({
                    ...item,
                  }));
                  update({
                    options,
                    items: localizeRadios(
                      { ...latest.current, items, preset: "plans" },
                      fa,
                    ).items,
                    selected: items[1]?.value ?? null,
                  });
                }}
                options={[
                  ["plans", "Plans", "طرح‌ها"],
                  ["delivery", "Delivery", "ارسال"],
                  ["sizes", "Sizes", "اندازه‌ها"],
                ].map(([value, en, per]) => ({ value, label: t(en, per) }))}
              />
            </div>
            {value.items.map((item, index) => (
              <TextField
                key={item.value}
                label={t(
                  `Option ${index + 1} label`,
                  `برچسب گزینه ${index + 1}`,
                )}
                value={item.label}
                onChange={(event) =>
                  update({
                    items: latest.current.items.map((entry, i) =>
                      i === index
                        ? { ...entry, label: event.target.value }
                        : entry,
                    ),
                  })
                }
              />
            ))}
          </section>
          <section id="radios-behavior">
            <h3>{t("Behavior", "رفتار")}</h3>
            <Choice
              label={t("Selected", "انتخاب‌شده")}
              value={value.selected ?? "__none__"}
              onValueChange={(selected) =>
                update({ selected: selected === "__none__" ? null : selected })
              }
              options={[
                { value: "__none__", label: t("None", "بدون انتخاب") },
                ...value.items.map((item) => ({
                  value: item.value,
                  label: item.label,
                })),
              ]}
            />
            <div className="button-behavior-switches">
              <Switch
                label={t("Disable an option", "غیرفعال کردن یک گزینه")}
                checked={!!value.items[1]?.disabled}
                onCheckedChange={(disabled) =>
                  update({
                    items: latest.current.items.map((item, index) =>
                      index === 1 ? { ...item, disabled } : item,
                    ),
                  })
                }
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
              className="demo-stack radios-preview"
              onSubmit={(event) => {
                event.preventDefault();
                setStatus(
                  `${t("Submitted", "ارسال شد")}: ${new FormData(event.currentTarget).get(value.name) ?? t("None", "هیچ‌کدام")}`,
                );
              }}
              onReset={() => {
                onChange({
                  ...input,
                  selected: input.items.some(
                    (item) => item.value === radiosDefaults.selected,
                  )
                    ? radiosDefaults.selected
                    : null,
                });
                setStatus(t("Form reset", "فرم بازنشانی شد"));
              }}
            >
              <RadioGroup
                label={value.label}
                name={value.name}
                options={value.items}
                value={value.selected}
                onValueChange={(selected) =>
                  onChange({ ...input, selected: selected || null })
                }
                direction={value.direction}
                labelPosition={value.labelPosition}
                size={value.size}
                required={value.required}
                disabled={value.disabled}
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
