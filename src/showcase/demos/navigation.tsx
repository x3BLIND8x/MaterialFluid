import { useState } from "react";
import {
  Tabs,
  Breadcrumbs,
  Pagination,
  TopAppBar,
  NavigationRail,
  SideNavigation,
  TableOfContents,
  Stepper,
  Link,
} from "../../kit/navigation";
import { Button, IconButton, ToggleGroup } from "../../kit/controls";
import { AnimatedIcon } from "../../kit/icons";
import { Tree } from "../../kit/tree";
import { type DemoProps, translate } from "./shared";
export default function NavigationDemo({ id, states, locale }: DemoProps) {
  const [treeIcons, setTreeIcons] = useState<"all" | "none" | "parents">("none");
  const t = translate(locale);
  const [message, setMessage] = useState("");
  const items = [
    {
      value: "overview",
      label: t("Overview", "نمای کلی"),
      icon: <AnimatedIcon name="sliders" />,
    },
    {
      value: "projects",
      label: t("Projects", "پروژه‌ها"),
      icon: <AnimatedIcon name="copy" />,
    },
    {
      value: "settings",
      label: t("Settings", "تنظیمات"),
      icon: <AnimatedIcon name="settings" />,
    },
  ];
  let demo;
  switch (id) {
    case "tabs":
      demo = (
        <Tabs
          label={t("Project views", "نماهای پروژه")}
          items={items.map((item) => ({
            ...item,
            content: (
              <div className="demo-tab-panel">
                <h3>{item.label}</h3>
                <p>
                  {item.value === "overview"
                    ? t(
                        "Everything you need to see, all in one place.",
                        "تمام اطلاعات لازم در یک مکان.",
                      )
                    : item.value === "projects"
                      ? t(
                          "Your next idea starts here.",
                          "ایده بعدی شما از اینجا آغاز می‌شود.",
                        )
                      : t(
                          "Make this workspace your own.",
                          "این فضای کاری را شخصی کنید.",
                        )}
                </p>
              </div>
            ),
          }))}
        />
      );
      break;
    case "breadcrumbs":
      demo = (
        <Breadcrumbs
          label={t("Page location", "مسیر صفحه")}
          items={[
            { label: t("Workspace", "فضای کاری"), href: "#button" },
            { label: t("Projects", "پروژه‌ها"), href: "#card" },
            {
              label: states.long
                ? t(
                    "A shared creative workspace for the whole team",
                    "فضای کاری خلاقانه مشترک برای تمام تیم",
                  )
                : t("MaterialFluid", "متریال‌فلوید"),
            },
          ]}
        />
      );
      break;
    case "pagination":
      demo = <Pagination totalPages={8} defaultPage={3} />;
      break;
    case "top-app-bar":
      demo = (
        <TopAppBar
          title={
            states.long
              ? t(
                  "A workspace for your next great idea",
                  "فضایی برای ایده بزرگ بعدی شما",
                )
              : t("Studio", "استودیو")
          }
          leading={
            <IconButton
              variant="ghost"
              label={t("Menu", "منو")}
              onClick={() =>
                setMessage(t("Menu action activated.", "اقدام منو فعال شد."))
              }
            >
              <AnimatedIcon name="menu" />
            </IconButton>
          }
          actions={
            <Button
              variant="primary"
              onClick={() => setMessage(t("Project saved.", "پروژه ذخیره شد."))}
            >
              {t("Save", "ذخیره")}
            </Button>
          }
        />
      );
      break;
    case "navigation-rail":
      demo = (
        <NavigationRail label={t("Workspace", "فضای کاری")} items={items} />
      );
      break;
    case "side-navigation":
      demo = (
        <SideNavigation
          label={t("Workspace", "فضای کاری")}
          items={items.map((item) => ({
            ...item,
            label: states.long
              ? `${item.label} — ${t("team workspace", "فضای تیم")}`
              : item.label,
          }))}
        />
      );
      break;
    case "tree":
      demo = <div className="demo-stack" style={{ width: "min(100%, 420px)" }}><ToggleGroup size="sm" label={t("Tree icons", "آیکن‌های درخت")} value={treeIcons} onValueChange={value => setTreeIcons(value as "all" | "none" | "parents")} options={[{ value:"none", label:t("Iconless", "بدون آیکن") },{ value:"all", label:t("With icons", "با آیکن") },{ value:"parents", label:t("Parent icons", "آیکن والد") }]} /><Tree iconMode={treeIcons} label={t("Workspace", "فضای کاری")}
        defaultExpanded={["projects", "design"]} defaultValue="components"
        items={[
          { value: "projects", icon: <AnimatedIcon name="layers" size={18} />, label: t("Projects", "پروژه‌ها"), children: [
            { value: "design", icon: <AnimatedIcon name="settings" size={18} />, label: t("Design system", "سیستم طراحی"), children: [
              { value: "components", icon: <AnimatedIcon name="category" size={18} />, label: t("Components", "کامپوننت‌ها") },
              { value: "tokens", icon: <AnimatedIcon name="dashboard" size={18} />, label: t("Tokens", "توکن‌ها") },
              { value: "guidelines", icon: <AnimatedIcon name="edit_note" size={18} />, label: t("Guidelines", "راهنما") },
            ] },
            { value: "website", icon: <AnimatedIcon name="dashboard" size={18} />, label: t("Website", "وب‌سایت") },
          ] },
          { value: "team", icon: <AnimatedIcon name="category" size={18} />, label: t("Team", "تیم"), children: [
            { value: "people", icon: <AnimatedIcon name="category" size={18} />, label: t("People", "اعضا") },
            { value: "settings", icon: <AnimatedIcon name="settings" size={18} />, label: t("Settings", "تنظیمات") },
          ] },
        ]} /></div>;
      break;
    case "table-of-contents":
      demo = (
        <div className="demo-stack"><TableOfContents label={t("On this page", "در این صفحه")} items={[
          { value: "toc-demo-introduction", label: t("Introduction", "مقدمه"), children: [
            { value: "toc-demo-overview", label: t("Overview", "نمای کلی") },
            { value: "toc-demo-principles", label: t("Principles", "اصول") },
          ] },
          { value: "toc-demo-details", label: t("Details", "جزئیات"), children: [
            { value: "toc-demo-structure", label: t("Structure", "ساختار") },
          ] },
        ]} />
          <section id="toc-demo-introduction"><h3>{t("Introduction", "مقدمه")}</h3><h4 id="toc-demo-overview">{t("Overview", "نمای کلی")}</h4><p>{t("A document can contain several levels of headings.", "یک سند می‌تواند چند سطح عنوان داشته باشد.")}</p><h4 id="toc-demo-principles">{t("Principles", "اصول")}</h4><p>{t("Nested headings use the same Tree interaction as the component catalogue.", "عنوان‌های تو در تو از همان درخت فهرست کامپوننت‌ها استفاده می‌کنند.")}</p></section>
          <section id="toc-demo-details"><h3>{t("Details", "جزئیات")}</h3><h4 id="toc-demo-structure">{t("Structure", "ساختار")}</h4><p>{t("Choose a heading to navigate to its section.", "برای رفتن به بخش، عنوان را انتخاب کنید.")}</p></section>
        </div>
      );
      break;
    case "stepper":
      demo = (
        <Stepper
          label={t("Setup progress", "مراحل راه‌اندازی")}
          items={[
            { value: "account", label: t("Account", "حساب") },
            { value: "details", label: t("Details", "جزئیات") },
            { value: "finish", label: t("Finish", "پایان") },
          ]}
          defaultValue="details"
        />
      );
      break;
    case "link":
      demo = (
        <div className="demo-stack">
          <Link href="#button">
            {states.long
              ? t(
                  "Explore the full set of actions and button variants",
                  "مشاهده تمام اقدامات و انواع دکمه",
                )
              : t("Explore buttons", "مشاهده دکمه‌ها")}
            <AnimatedIcon name="arrow-right" size={18} />
          </Link>
          <Link
            href="https://github.com/google/material-design-icons"
            target="_blank"
            rel="noreferrer"
          >
            {t("Icon source", "منبع آیکون")}
            <AnimatedIcon name="external" size={16} />
          </Link>
        </div>
      );
      break;
  }
  return (
    <>
      <div className="demo-primary demo-wide">{demo}</div>
      {message && (
        <output className="demo-result" role="status">
          {message}
        </output>
      )}
    </>
  );
}
