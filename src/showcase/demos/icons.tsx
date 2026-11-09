import { useState } from "react";
import { componentVariants } from "../../kit/appearance";
import { materialIcons } from "../../kit/material-icons";
import {
  AnimatedIcon,
  registerMaterialIcons,
  type IconName,
} from "../../kit/icons";
import { Button, IconButton, Switch } from "../../kit/controls";
import { TextField } from "../../kit/forms";
import { Pagination } from "../../kit/navigation";
import { EmptyState } from "../../kit/feedback";
import { type DemoProps, translate } from "./shared";
registerMaterialIcons(materialIcons);
const icons = Object.keys(materialIcons) as IconName[];
const keywords: Record<string, string> = {
  bell: "زنگ اعلان",
  heart: "قلب علاقه",
  settings: "تنظیمات",
  wifi: "وای فای اینترنت",
  "wifi-off": "وای فای خاموش قطع اینترنت",
  bluetooth: "بلوتوث",
  "bluetooth-off": "بلوتوث خاموش",
  search: "جستجو",
  plus: "افزودن",
  close: "بستن",
  copy: "کپی",
  sun: "خورشید روشن",
  moon: "ماه تاریک",
  menu: "منو",
  eye: "چشم نمایش",
  download: "دانلود",
  check: "تایید تأیید",
  activity: "قطره آب",
};
const title = (name: string) => name.replaceAll("-", " ").replaceAll("_", " ");
export default function IconsDemo({ locale }: DemoProps) {
  const t = translate(locale);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<IconName>("wifi");
  const animated = false;
  const [wifi, setWifi] = useState(false);
  const [bluetooth, setBluetooth] = useState(false);
  const [copyState, setCopyState] = useState("");
  const matches = icons.filter((name) =>
    `${title(name)} ${name} ${keywords[name] ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  const totalPages = Math.max(1, Math.ceil(matches.length / 48));
  const currentPage = Math.min(page, totalPages);
  const visible = matches.slice((currentPage - 1) * 48, currentPage * 48);
  const code = `import { IconButton, AnimatedIcon, registerMaterialIcons } from 'materialfluid';\nimport { materialIcons } from 'materialfluid/icons';\n\nregisterMaterialIcons({ ["${selected}"]: materialIcons["${selected}"] });\n\n<IconButton label="${title(selected)}">\n  <AnimatedIcon name="${selected}" />\n</IconButton>`;
  return (
    <div className="demo-primary icon-gallery">
      <div className="icon-gallery-intro">
        <p>{t("Material Symbols Rounded", "Material Symbols Rounded")}</p>
        <p className="mf-muted">
          {t(
            `${icons.length} icons. Icon animations are temporarily paused.`,
            `${icons.length} آیکون. حرکت آیکن‌ها فعلاً غیرفعال است.`,
          )}
        </p>
      </div>
      <div className="icon-gallery-preview">
        <div className="icon-preview-stage">
          <div className="icon-variant-previews">
            {componentVariants.map((variant) => {
              const label = locale === "fa"
                ? { filled: "پر", tonal: "تونال", outlined: "خطی", ghost: "شفاف", danger: "خطر" }[variant]
                : variant[0].toUpperCase() + variant.slice(1);
              return (
                <div className="icon-variant-preview" key={variant}>
                  <IconButton variant={variant} label={`${label}: ${selected}`} className="icon-preview-button">
                    <AnimatedIcon name={selected} animated={animated} />
                  </IconButton>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
          <code>{selected}</code>
          <div className="demo-wifi">
            <Switch
              label={t("Wi-Fi", "وای‌فای")}
              icon="wifi"
              checked={wifi}
              onCheckedChange={setWifi}
            />
          </div>
          <div className="demo-wifi">
            <Switch
              label={t("Bluetooth", "بلوتوث")}
              icon="bluetooth"
              checked={bluetooth}
              onCheckedChange={setBluetooth}
            />
          </div>
        </div>

      </div>
      <div className="icon-gallery-search">
        <TextField
          type="search"
          label={t("Search icons", "جستجوی آیکون‌ها")}
          placeholder={t("Name or keyword…", "نام یا کلیدواژه…")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <output aria-live="polite">
          {matches.length.toLocaleString(locale)} {t("icons", "آیکون")}
        </output>
      </div>
      {visible.length ? (
        <div className="icon-gallery-grid">
          {visible.map((name) => (
            <Button
              key={name}
              variant="outlined"
              className="icon-gallery-tile"
              aria-label={`${t("Preview", "پیش‌نمایش")} ${name}`}
              aria-pressed={selected === name}
              onClick={() => {
                setSelected(name);
                setCopyState("");
              }}
            >
              <AnimatedIcon
                name={name}
                animated={animated}
              />
              <span>{title(name)}</span>
            </Button>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("No matching icons", "آیکونی پیدا نشد")}
          description={t(
            "Try a different name or clear the search.",
            "نام دیگری را امتحان کنید یا جستجو را پاک کنید.",
          )}
          action={
            <Button variant="text" onClick={() => setQuery("")}>
              {t("Clear search", "پاک کردن جستجو")}
            </Button>
          }
        />
      )}
      {totalPages > 1 && (
        <Pagination
          label={t("Icon gallery pages", "صفحه‌بندی آیکون‌ها")}
          totalPages={totalPages}
          page={currentPage}
          onPageChange={setPage}
        />
      )}
      <div className="icon-gallery-code">
        <Button
          variant="outlined"
          leading={<AnimatedIcon name="copy" />}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopyState(t("Copied", "کپی شد"));
            } catch {
              setCopyState(
                t(
                  "Select and copy the code below.",
                  "کد زیر را انتخاب و کپی کنید.",
                ),
              );
            }
          }}
        >
          {t("Copy selected icon", "کپی آیکون انتخاب‌شده")}
        </Button>
        <span role="status">{copyState}</span>
        <pre tabIndex={0}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
