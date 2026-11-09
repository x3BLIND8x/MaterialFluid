import { useState } from "react";
import { Button, IconButton } from "../../kit/controls";
import { AnimatedIcon } from "../../kit/icons";
import { NavigationBar } from "../../kit/navigation";
import { Chips, FABMenu, Shape, SideSheet, SplitButton, Toolbar, type ShapeForm } from "../../kit/compositions";
import { Carousel, CodeBlock, Sidebar } from "../../kit/shadcn/patterns";
import "../../kit/shadcn/patterns.css";
import { Select } from "../../kit/forms";
import { type DemoProps, translate } from "./shared";
export default function CatalogueDemo({ id, locale }: DemoProps) {
  const t = translate(locale);
  const [message, setMessage] = useState("");
  const [shape, setShape] = useState<ShapeForm>("flower");
  const actions = [{ id: "document", label: t("Document", "سند"), onSelect: () => setMessage(t("Document created", "سند ساخته شد")) }, { id: "folder", label: t("Folder", "پوشه"), onSelect: () => setMessage(t("Folder created", "پوشه ساخته شد")) }];
  let demo;
  switch (id) {
    case "split-button": demo = <SplitButton label={t("Save", "ذخیره")} menuLabel={t("Save options", "گزینه‌های ذخیره")} onClick={() => setMessage(t("Saved", "ذخیره شد"))} items={[{id:"copy", label:t("Save a copy", "ذخیره یک نسخه"), onSelect:() => setMessage(t("Copy saved", "نسخه ذخیره شد"))}]} />; break;
    case "fab-menu": demo = <FABMenu label={t("Create", "ایجاد")} items={actions} />; break;
    case "chips": demo = <Chips label={t("Interests", "علاقه‌ها")} defaultValue={["design"]} options={[{value:"design",label:t("Design", "طراحی")},{value:"music",label:t("Music", "موسیقی")},{value:"travel",label:t("Travel", "سفر")}]} />; break;
    case "navigation-bar": demo = <NavigationBar label={t("Destinations", "مقصدها")} items={[{value:"home", label:t("Home", "خانه"),icon:<AnimatedIcon name="home"/>},{value:"favorites",label:t("Favorites", "علاقه‌مندی‌ها"),icon:<AnimatedIcon name="heart"/>},{value:"settings",label:t("Settings", "تنظیمات"),icon:<AnimatedIcon name="settings"/>}]} />; break;
    case "sidebar": demo = <Sidebar label={t("Workspace navigation", "پیمایش فضای کار")} title={t("Workspace", "فضای کار")} items={[{id:"overview",label:t("Overview", "نمای کلی")},{id:"projects",label:t("Projects", "پروژه‌ها")},{id:"settings",label:t("Settings", "تنظیمات") }]}><p>{t("Choose a destination from the sidebar.", "یک مقصد از نوار کناری انتخاب کنید.")}</p></Sidebar>; break;
    case "toolbar": demo = <Toolbar label={t("Document tools", "ابزارهای سند")}><IconButton label={t("Undo", "واگرد")} onClick={() => setMessage(t("Undone", "واگرد شد"))}><AnimatedIcon name="arrow-left" /></IconButton><IconButton label={t("Redo", "از نو")} onClick={() => setMessage(t("Redone", "دوباره انجام شد"))}><AnimatedIcon name="arrow-right" /></IconButton><Button onClick={() => setMessage(t("Saved", "ذخیره شد"))}>{t("Save", "ذخیره")}</Button></Toolbar>; break;
    case "carousel": demo = <Carousel label={t("Highlights", "برگزیده‌ها")} slides={[t("A place for your next idea.", "جایی برای ایده بعدی شما."),t("Make room for something new.", "برای چیز تازه‌ای جا باز کنید."),t("Build something together.", "چیزی را با هم بسازید.")].map((text,index) => <div key={index} className="demo-tab-panel"><h3>{t("Highlight", "برگزیده")} {(index+1).toLocaleString(locale)}</h3><p>{text}</p></div>)} />; break;
    case "code-block": demo = <CodeBlock code={'const message = "Hello, MaterialFluid";\nconsole.log(message);'} language="typescript" lineNumbers wrap />; break;
    case "shape": demo = <div className="demo-stack"><Shape form={shape} label={t("Selected shape", "شکل انتخاب‌شده")} /><Select label={t("Shape", "شکل")} value={shape} onValueChange={value => setShape(value as ShapeForm)} options={(["circle","square","flower","star","diamond","oval"] as const).map((value,index)=>({value,label:locale==="fa"?["دایره","مربع","گل","ستاره","لوزی","بیضی"][index]:value}))}/></div>; break;
    case "side-sheet": demo = <SideSheet title={t("Details", "جزئیات")} trigger={<Button>{t("Open details", "باز کردن جزئیات")}</Button>}><p>{t("Supporting information beside your workspace.", "اطلاعات تکمیلی در کنار فضای کار شما.")}</p></SideSheet>; break;
  }
  return <div className="demo-primary"><div className="demo-stack">{demo}{message && <p role="status">{message}</p>}</div></div>;
}
