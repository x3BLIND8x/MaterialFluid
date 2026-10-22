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
import { Button, IconButton } from "../../kit/controls";
import { AnimatedIcon } from "../../kit/icons";
import { type DemoProps, translate } from "./shared";
export default function NavigationDemo({ id, states, locale }: DemoProps) {
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
    case "table-of-contents":
      demo = (
        <div className="demo-stack"><TableOfContents label={t("On this page", "در این صفحه")} items={items.map(item => ({ ...item, value: `toc-demo-${item.value}` }))} />
          {items.map(item => <section key={item.value} id={`toc-demo-${item.value}`} style={{ scrollMarginTop: 96 }}><h3>{item.label}</h3><p>{t("A section of your document. Choose a heading above to jump here.", "بخشی از سند شما. برای رفتن به این بخش، عنوان بالا را انتخاب کنید.")}</p></section>)}
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
