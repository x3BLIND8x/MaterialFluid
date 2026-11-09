import { useEffect, useState } from "react";
import { Button, IconButton } from "../kit/controls";
import { Dialog } from "../kit/overlays";
import { AnimatedIcon, registerMaterialIcons, type IconName } from "../kit/icons";
import { SearchField } from "../kit/forms";
import { Pagination } from "../kit/navigation";
import { Spinner } from "../kit/feedback";
let pack: Promise<typeof import("../kit/material-icons")> | undefined;
export function loadIconChoices() {
  return pack ??= import("../kit/material-icons").then(result => { registerMaterialIcons(result.materialIcons); return result; }).catch(error => { pack = undefined; throw error; });
}
export function IconPicker({ value, onChange, fa }: { value: string; onChange: (name: string) => void; fa: boolean }) {
  const [open, setOpen] = useState(false), [names, setNames] = useState<string[]>([]), [error, setError] = useState(false);
  const [query, setQuery] = useState(""), [page, setPage] = useState(1);
  const t = (en: string, persian: string) => fa ? persian : en;
  const load = () => { setError(false); void loadIconChoices().then(module => setNames(Object.keys(module.materialIcons))).catch(() => setError(true)); };
  useEffect(() => { if (open && !names.length) { let live = true; void loadIconChoices().then(module => { if (live) setNames(Object.keys(module.materialIcons)); }).catch(() => { if (live) setError(true); }); return () => { live = false; }; } }, [open, names.length]);
  const matches = names.filter(name => name.replaceAll("_", " ").includes(query.toLowerCase().replaceAll("_", " ")));
  const pages = Math.max(1, Math.ceil(matches.length / 48));
  return <Dialog className="button-icon-picker" title={t("Choose an icon", "انتخاب آیکون")} open={open} onOpenChange={setOpen} trigger={<Button variant="outlined" size="sm" leading={value ? <AnimatedIcon name={value as IconName} /> : undefined}>{value || t("Choose icon", "انتخاب آیکون")}</Button>}>
    <SearchField label={t("Search all icons", "جستجوی همه آیکون‌ها")} value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} />
    <div className="button-icon-picker-toolbar"><Button size="sm" variant="ghost" onClick={() => { onChange(""); setOpen(false); }}>{t("None", "بدون آیکون")}</Button><span>{matches.length.toLocaleString(fa ? "fa" : "en")} {t("icons", "آیکون")}</span></div>
    {error ? <Button onClick={load}>{t("Retry loading icons", "تلاش دوباره برای بارگیری")}</Button> : !names.length ? <Spinner label={t("Loading icons", "بارگیری آیکون‌ها")} /> : <>
      <div className="button-icon-picker-grid">{matches.slice((Math.min(page, pages) - 1) * 48, Math.min(page, pages) * 48).map(name => <IconButton key={name} size="sm" label={name} title={name} aria-pressed={value === name} onClick={() => { onChange(name); setOpen(false); }}><AnimatedIcon name={name as IconName} /></IconButton>)}</div>
      {!matches.length && <p role="status">{t("No matching icons. Try another search.", "آیکونی پیدا نشد. جستجوی دیگری امتحان کنید.")}</p>}
      {pages > 1 && <Pagination label={t("Icon pages", "صفحه‌های آیکون")} page={Math.min(page, pages)} totalPages={pages} onPageChange={setPage} size="sm" />}
    </>}
  </Dialog>;
}
