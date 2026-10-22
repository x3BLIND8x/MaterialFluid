import { LayoutGroup } from "motion/react";
import { Component, useState, useEffect, lazy, Suspense, useRef, type ReactNode } from "react";
import { MaterialFluidProvider } from "../kit/provider";
import {
  ComponentAppearanceProvider,
  componentVariants,
  type ComponentVariant,
  type ComponentSize,
} from "../kit/appearance";
import { Button, IconButton, Switch, Toggle, ToggleGroup } from "../kit/controls";
import { AnimatedIcon } from "../kit/icons";
import { Drawer, Popover, Tooltip } from "../kit/overlays";
import { Link, SideNavigation, NavigationRail, TableOfContents, TopAppBar, Breadcrumbs } from "../kit/navigation";
import { SearchField, Select } from "../kit/forms";
import { Spinner } from "../kit/feedback";
import { catalogue, families, text, type DemoState } from "./catalogue";
import {
  loadPreferences,
  savePreferences,
  type Preferences,
} from "./preferences";
import { usageFor } from "./usage";
import { ColorSettings } from "./color-settings";
import { AccentSeed } from "./accent-seed";
import { fabMotionDefaults, type FABMotionSettings } from "./demos/shared";
import { FABTuning } from "./fab-tuning";
import { ButtonTuning } from "./button-tuning";
import { TextMorphTuning } from "./text-morph-tuning";
const demos = {
  controls: lazy(() => import("./demos/controls")),
  forms: lazy(() => import("./demos/forms")),
  navigation: lazy(() => import("./demos/navigation")),
  surfaces: lazy(() => import("./demos/surfaces")),
  feedback: lazy(() => import("./demos/feedback")),
  overlays: lazy(() => import("./demos/overlays")),
  icons: lazy(() => import("./demos/icons")),
};
const displayName = (name: string) =>
  (name === "AnimatedIcon" ? "Icons" : name)
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
const routeId = () => {
  const id = window.location.hash.replace(/^#\/?(?:components\/)?/, "") || "button";
  return id === "snackbar" ? "toast" : id;
};
class DemoBoundary extends Component<{ children: ReactNode; fa: boolean }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div role="alert" className="demo-stack">
      <p>{this.props.fa ? "نمونه بارگیری نشد. برای تلاش دوباره صفحه را بازخوانی کنید." : "This example could not load. Reload to try again."}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>{this.props.fa ? "بارگیری دوباره" : "Reload example"}</Button>
    </div>;
  }
}
export default function App() {
  const [prefs, setPrefs] = useState<Preferences>(() => loadPreferences());
  const [route, setRoute] = useState(routeId);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [compactActions, setCompactActions] = useState(() => window.innerWidth < 600);
  const topbar = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [states, setStates] = useState<Partial<Record<DemoState, boolean>>>({});
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const variant: ComponentVariant = "primary";
  const [size, setSize] = useState<ComponentSize>("md");
  const fixedControls = ["button-group", "toggle", "toggle-group", "checkbox", "radio-group", "switch", "slider", "text-field", "textarea"];
  const [fabMotion, setFabMotion] = useState<FABMotionSettings>(
    () => ({ ...fabMotionDefaults }),
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState("examples");
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const html = document.documentElement;
    const names = ["--mf-scrollbar-thumb", "--mf-scrollbar-track", "--mf-scrollbar-hover", "--mf-scrollbar-gutter"];
    const previous = names.map(name => html.style.getPropertyValue(name));
    const canvas = [html.style.backgroundColor, document.body.style.backgroundColor, html.style.colorScheme];
    const update = () => {
      const style = getComputedStyle(element);
      ["--mf-primary-fill", "--mf-surface-container", "--mf-primary", "--mf-surface"].forEach((token, index) => html.style.setProperty(names[index], style.getPropertyValue(token)));
      const background = style.getPropertyValue("--mf-surface").trim();
      html.style.backgroundColor = background;
      document.body.style.backgroundColor = background;
      html.style.colorScheme = element.dataset.theme === "dark" ? "dark" : "light";
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { attributes: true, attributeFilter: ["style", "data-theme"] });
    return () => { observer.disconnect(); html.style.backgroundColor = canvas[0]; document.body.style.backgroundColor = canvas[1]; html.style.colorScheme = canvas[2]; names.forEach((name, index) => { if (previous[index]) html.style.setProperty(name, previous[index]); else html.style.removeProperty(name); }); };
  }, []);
  useEffect(() => {
    const element = topbar.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setCompactActions(entry.contentRect.width < 560));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const firstRoute = useRef(true);
  const locale = prefs.locale,
    fa = locale === "fa";
  const t = (en: string, persian: string) => (fa ? persian : en);
  const entry = catalogue.find((c) => c.id === route) ?? catalogue[0];
  const family = families.find((f) => f.id === entry.family)!;
  const Demo = demos[entry.family];
  const change = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));
  const changeFabMotion = (patch: Partial<FABMotionSettings>) =>
    setFabMotion((current) => ({ ...current, ...patch }));
  useEffect(() => {
    const update = () => {
      setRoute(routeId());
      setStates({});
      setCopied(false);
      setCopyError(false);
      setMobileOpen(false);
      setSection("examples");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
  }, [entry.id]);
  useEffect(() => savePreferences(prefs), [prefs]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = fa ? "rtl" : "ltr";
    document.title = `${fa ? entry.fa : displayName(entry.name)} · MaterialFluid`;
  }, [locale, fa, entry]);
  const results = catalogue.filter((c) =>
    `${c.name} ${displayName(c.name)} ${c.fa} ${text(c.description, locale)}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const nav = (
    <div className="catalogue-navigation">
      <SearchField className="nav-search" label={t("Search components", "جستجوی کامپوننت‌ها")}
        placeholder={t("Find a component…", "یافتن کامپوننت…")} value={search}
        onChange={event => setSearch(event.target.value)}
        trailing={<span className="nav-search-count">{results.length.toLocaleString(locale)}</span>} />
      <nav aria-label={t("Components", "کامپوننت‌ها")}>
        {families.map((group) => {
          const entries = results.filter((c) => c.family === group.id);
          return entries.length ? (
            <div className="nav-group" key={group.id}>
              <h2>{text(group.label, locale)}</h2>
              <SideNavigation label={text(group.label, locale)} size="sm" value={entry.id}
                selectionId="active-component" className="catalogue-nav-list"
                items={entries.map(component => ({ value: component.id,
                  href: `#/components/${component.id}`, className: "catalogue-link",
                  label: <><span>{fa ? component.fa : displayName(component.name)}</span>{entry.id === component.id && <AnimatedIcon name={fa ? "arrow-left" : "arrow-right"} size={15} />}</>,
                }))} />
            </div>
          ) : null;
        })}
        {!results.length && (
          <p className="nav-no-results" role="status">
            {t(
              "No components found. Try another name.",
              "کامپوننتی یافت نشد. نام دیگری را امتحان کنید.",
            )}
          </p>
        )}
      </nav>
    </div>
  );
  const stateLabels: Record<DemoState, [string, string]> = {
    disabled: ["Disabled", "غیرفعال"],
    loading: ["Loading", "در حال بارگذاری"],
    invalid: ["Invalid", "نامعتبر"],
    empty: ["Empty", "خالی"],
    selected: ["Selected", "انتخاب‌شده"],
    long: ["Long content", "محتوای طولانی"],
    filters: ["Column filters", "فیلتر ستون‌ها"],
  };
  const previous = catalogue[catalogue.indexOf(entry) - 1];
  const next = catalogue[catalogue.indexOf(entry) + 1];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(usageFor(entry, { variant, size }));
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  const headerActions = (
<div className="global-controls">
              <Tooltip
                content={t(
                  "Appearance: " + prefs.theme,
                  "ظاهر: " +
                    { light: "روشن", dark: "تیره", system: "سیستم" }[
                      prefs.theme
                    ],
                )}
              >
                <IconButton
                  label={t("Change appearance", "تغییر ظاهر")}
                  onClick={() =>
                    change(
                      "theme",
                      prefs.theme === "system"
                        ? "light"
                        : prefs.theme === "light"
                          ? "dark"
                          : "system",
                    )
                  }
                >
                  <AnimatedIcon
                    name={
                      prefs.theme === "dark"
                        ? "moon"
                        : prefs.theme === "light"
                          ? "sun"
                          : "sliders"
                    }
                  />
                </IconButton>
              </Tooltip>
              <IconButton
                variant="ghost"
                className="language-control"
                onClick={() => change("locale", fa ? "en" : "fa")}
                label={t("Switch to Persian", "تغییر به انگلیسی")}
              >
                <span lang={fa ? "en" : "fa"}>{fa ? "EN" : "فا"}</span>
              </IconButton>
              <Toggle pressed={prefs.motion === "expressive"}
                onPressedChange={enabled => change("motion", enabled ? "expressive" : "minimal")}>
                {prefs.motion === "expressive" ? t("Fluid", "روان") : t("Minimal", "سبک")}
              </Toggle>
              <Popover
                label={t("Showcase preferences", "ترجیحات نمایش")}
                className="settings-popover"
                trigger={
                  <IconButton
                    label={t("Showcase preferences", "ترجیحات نمایش")}
                  >
                    <AnimatedIcon name="settings" />
                  </IconButton>
                }
              >
                <div className="settings-panel">
                  <h3>{t("Make it yours", "شخصی‌سازی")}</h3>
                  <AccentSeed
                    value={prefs.accentSeed}
                    onChange={(seed) => change("accentSeed", seed)}
                    fa={fa}
                  />
                  <p className="settings-label">{t("Appearance", "ظاهر")}</p>
                  <ToggleGroup
                    label={t("Appearance", "ظاهر")}
                    value={prefs.theme}
                    onValueChange={(value) =>
                      change("theme", value as Preferences["theme"])
                    }
                    options={[
                      { value: "light", label: t("Light", "روشن") },
                      { value: "dark", label: t("Dark", "تیره") },
                      { value: "system", label: t("System", "سیستم") },
                    ]}
                  />
                  <ColorSettings
                    value={prefs.colorBehavior}
                    onChange={(value) => change("colorBehavior", value)}
                    locale={locale}
                  />
                  <p className="settings-note">
                    {t(
                      "Saved on this device. System reduced-motion preferences always apply.",
                      "در این دستگاه ذخیره می‌شود. ترجیح کاهش حرکت سیستم همیشه رعایت می‌شود.",
                    )}
                  </p>
                </div>
              </Popover>
            </div>
  );
  return (
    <MaterialFluidProvider
      {...prefs}
      buttonMotion={fabMotion}
      textMorph={{ duration: fabMotion.textDuration, blur: fabMotion.textBlur, fade: fabMotion.textFade }}
      ref={root}
      className="showcase-root"
    >
      <Link
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          heading.current?.focus();
        }}
      >
        {t("Skip to content", "رفتن به محتوا")}
      </Link>
      <div className="showcase-shell" data-collapsed={collapsed || undefined}>
        <aside className="showcase-sidebar">
          <div className="sidebar-heading"><Link
            className="brand"
            href="#/components/button"
            aria-label="MaterialFluid"
          >
            <span className="brand-mark" aria-hidden="true">
              <AnimatedIcon name="activity" size={30} animated={false} />
            </span>
            <span>
              MaterialFluid<span className="brand-version">v0.1</span>
            </span>
          </Link>
          <IconButton variant="ghost" size="sm" label={collapsed ? t("Expand navigation", "گسترش پیمایش") : t("Collapse navigation", "جمع کردن پیمایش")} aria-expanded={!collapsed} aria-controls="desktop-component-menu" onClick={() => setCollapsed(value => !value)}><AnimatedIcon name={collapsed ? "chevron-right" : "chevron-left"} /></IconButton>
          </div>
          <div id="desktop-component-menu" hidden={collapsed}><LayoutGroup id="catalogue-desktop">{nav}</LayoutGroup></div>
          {collapsed && <NavigationRail className="collapsed-navigation" label={t("Component families", "گروه‌های کامپوننت‌ها")} value={entry.family} size="sm"
            items={families.map((group, index) => ({ value: group.id, href: `#/components/${catalogue.find(component => component.family === group.id)!.id}`, className: "collapsed-link",
              label: <Tooltip side={fa ? "left" : "right"} content={text(group.label, locale)}><span><AnimatedIcon name={(["touch_app", "edit_note", "tab", "dashboard", "notifications", "layers", "category"] as const)[index]} /><span className="mf-visually-hidden">{text(group.label, locale)}</span></span></Tooltip>,
            }))} />}
          <div className="sidebar-footer">
            <span>
              {t("Made to move. Built to use.", "برای حرکت. برای استفاده.")}
            </span>
            <span>{`${catalogue.length.toLocaleString(locale)} ${t("components", "کامپوننت")}`}</span>
          </div>
        </aside>
        <div className="showcase-body">
          <TopAppBar className="showcase-topbar" ref={topbar}
            title={<>
            <div className="mobile-brand">
              <IconButton
                label={t(
                  "Open component navigation",
                  "باز کردن پیمایش کامپوننت‌ها",
                )}
                onClick={() => setMobileOpen(true)}
              >
                <AnimatedIcon name="menu" />
              </IconButton>
              <span>MaterialFluid</span>
            </div>
              <Breadcrumbs className="topbar-trail" label={t("Component location", "مسیر کامپوننت")}
                items={[{label: t("Components", "کامپوننت‌ها"), href: "#/components/button"}, {label: text(family.label, locale), href: `#/components/${catalogue.find(component => component.family === family.id)!.id}`}]} />
            </>}
            actions={compactActions ? <Popover label={t("Quick settings", "تنظیمات سریع")} className="topbar-overflow" trigger={<IconButton variant="ghost" label={t("More options", "گزینه‌های بیشتر")}><AnimatedIcon name="more_vert" /></IconButton>}>{headerActions}</Popover> : headerActions} />
          <main className="showcase-frame" id="main-content">
            <div className="component-intro">
              <div>
                <h1 ref={heading} tabIndex={-1}>
                  {fa ? entry.fa : displayName(entry.name)}
                </h1>
                <p>{text(entry.description, locale)}</p>
              </div>
              <span className="component-number">
                {String(catalogue.indexOf(entry) + 1).padStart(2, "0")}{" "}
                <span>/ {catalogue.length.toLocaleString(locale)}</span>
              </span>
            </div>
            <TableOfContents className="page-sections" label={t("On this page", "در این صفحه")} size="sm" value={section}
              onValueChange={setSection}
              items={[{ value: "examples", label: t("Examples", "نمونه‌ها") }, { value: "usage", label: t("Usage", "استفاده") }, { value: "props", label: t("Props & behavior", "ویژگی‌ها و رفتار") }]} />
            <section
              id="examples"
              aria-label={t("Live examples", "نمونه‌های زنده")}
            >
              <div className="live-stage">
                <div className="component-appearance-controls">
                  <Select id="component-size" label={t("Size", "اندازه")} size="sm" value={size}
                    onValueChange={value => setSize(value as ComponentSize)}
                    options={[{ value: "sm", label: t("Small", "کوچک") }, { value: "md", label: t("Medium", "متوسط") }, { value: "lg", label: t("Large", "بزرگ") }]} />
                </div>
                <DemoBoundary key={entry.id} fa={fa}>
                <Suspense
                  key={entry.id}
                  fallback={
                    <div className="demo-primary demo-loading">
                      <Spinner
                        label={t("Loading example", "در حال بارگذاری نمونه")}
                      />
                    </div>
                  }
                >
                  {entry.id === "button" || entry.family === "icons" || entry.family === "forms" || entry.family === "navigation" || entry.family === "surfaces" || entry.family === "feedback" || entry.family === "overlays" || fixedControls.includes(entry.id) ? (
                    <ComponentAppearanceProvider variant={entry.family === "forms" ? "outline" : "primary"} size={size}>
                      <Demo
                        key={entry.id + JSON.stringify(states) + locale}
                        id={entry.id}
                        states={states}
                        locale={locale}
                        fabMotion={fabMotion}
                        onFabMotionChange={changeFabMotion}
                      />
                    </ComponentAppearanceProvider>
                  ) : (
                    <div className={`component-variant-examples${entry.id === "icon-button" ? " compact-icon-examples" : ""}`}>
                      {componentVariants.map((value) => {
                        const label = fa
                          ? { primary: "اصلی", secondary: "ثانویه", tertiary: "سوم", outline: "خطی", ghost: "شفاف", danger: "خطر" }[value]
                          : value[0].toUpperCase() + value.slice(1);
                        return (
                          <section className="component-variant-example" key={value} aria-label={label}>
                            <ComponentAppearanceProvider variant={value} size={size}>
                              <Demo
                                key={entry.id + value + JSON.stringify(states) + locale}
                                id={entry.id}
                                states={states}
                                locale={locale}
                                fabMotion={fabMotion}
                                onFabMotionChange={changeFabMotion}
                              />
                            </ComponentAppearanceProvider>
                          </section>
                        );
                      })}
                    </div>
                  )}
                </Suspense>
                </DemoBoundary>
                <div className="stage-footer">
                  <span className="live-dot" aria-hidden="true" />
                  <span>
                    {t("Live example · try it", "نمونه زنده · امتحان کنید")}
                  </span>
                  <span>
                    {prefs.motion === "expressive"
                      ? t("Expressive motion", "حرکت بیانگر")
                      : t("Minimal motion", "حرکت سبک")}
                  </span>
                </div>
              </div>
              {entry.id === "button" && (
                <div className="example-controls">
                  <ButtonTuning
                    value={fabMotion}
                    onChange={changeFabMotion}
                    locale={locale}
                  />
                </div>
              )}
              {entry.id === "fab" && (
                <div className="example-controls">
                  <FABTuning
                    value={fabMotion}
                    onChange={changeFabMotion}
                    locale={locale}
                  />
                </div>
              )}
              {entry.id === "toggle" && (
                <div className="example-controls">
                  <TextMorphTuning
                    value={fabMotion}
                    onChange={changeFabMotion}
                    locale={locale}
                  />
                </div>
              )}
              {entry.states.length > 0 && (
                <div
                  className="example-controls"
                  aria-label={t("Example states", "وضعیت‌های نمونه")}
                >
                  {entry.states.map((state) => (
                    <Switch
                      key={state}
                      label={text(stateLabels[state], locale)}
                      checked={!!states[state]}
                      onCheckedChange={(value) =>
                        setStates((prev) => ({ ...prev, [state]: value }))
                      }
                    />
                  ))}
                </div>
              )}
            </section>
            <section id="usage" className="documentation-section">
              <div className="section-heading">
                <h2>
                  {t("Use it in your project", "در پروژه خود استفاده کنید")}
                </h2>
                <Button
                  variant="text"
                  size="sm"
                  leading={
                    <AnimatedIcon name={copied ? "check" : "copy"} size={18} />
                  }
                  onClick={copy}
                >
                  {copied ? t("Copied", "کپی شد") : t("Copy code", "کپی کد")}
                </Button>
              </div>
              <p className="section-description">
                {t(
                  "Typed components. Shared tokens. Your content.",
                  "کامپوننت‌های نوع‌دار. توکن‌های مشترک. محتوای شما.",
                )}
              </p>
              <pre
                className="usage-code"
                tabIndex={0}
                aria-label={t("Usage example code", "کد نمونه استفاده")}
              >
                <code>{usageFor(entry, { variant, size })}</code>
              </pre>
              <div className="copy-status" role="status">
                {copyError
                  ? t(
                      "Clipboard unavailable. Select and copy the code directly.",
                      "کلیپ‌بورد در دسترس نیست. کد را مستقیم انتخاب و کپی کنید.",
                    )
                  : copied
                    ? t(
                        "Example copied to clipboard.",
                        "نمونه در کلیپ‌بورد کپی شد.",
                      )
                    : ""}
              </div>
            </section>
            <section id="props" className="documentation-section">
              <h2>{t("Props & behavior", "ویژگی‌ها و رفتار")}</h2>
              {entry.props.length > 0 ? (
                <div className="props-scroll">
                  <table className="props-table">
                    <caption className="mf-sr">
                      {t("Component props", "ویژگی‌های کامپوننت")}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">{t("Prop", "ویژگی")}</th>
                        <th scope="col">{t("Type", "نوع")}</th>
                        <th scope="col">{t("Purpose", "کاربرد")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.props.map((prop) => (
                        <tr key={prop.name}>
                          <td>
                            <code>{prop.name}</code>
                          </td>
                          <td>
                            <code>{prop.type}</code>
                          </td>
                          <td>{text(prop.description, locale)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="section-description">
                  {t(
                    "Accepts standard HTML attributes and a forwarded ref.",
                    "ویژگی‌های استاندارد HTML و ref را می‌پذیرد.",
                  )}
                </p>
              )}
              <div className="behavior-note">
                <AnimatedIcon name="help" size={20} />
                <p>{text(entry.notes, locale)}</p>
              </div>
              <p className="api-note">
                {t(
                  "See exported TypeScript types for the complete API. Components accept their documented class and style hooks.",
                  "برای API کامل نوع‌های TypeScript صادرشده را ببینید. کامپوننت‌ها از تنظیمات کلاس و سبک مستندشده پشتیبانی می‌کنند.",
                )}
              </p>
            </section>
            <footer className="page-footer">
              {previous ? (
                <Link href={`#/components/${previous.id}`}>
                  <AnimatedIcon
                    name={fa ? "arrow-right" : "arrow-left"}
                    size={18}
                  />
                  <span>{fa ? previous.fa : displayName(previous.name)}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`#/components/${next.id}`}>
                  <span>{fa ? next.fa : displayName(next.name)}</span>
                  <AnimatedIcon
                    name={fa ? "arrow-left" : "arrow-right"}
                    size={18}
                  />
                </Link>
              )}
            </footer>
          </main>
          <div className="workspace-footer">
            <span>MaterialFluid</span>
            <span>
              {t(
                "Material structure. Fluid expression.",
                "ساختار متریال. بیان روان.",
              )}
            </span>
          </div>
        </div>
      </div>
      <Drawer
        side="start"
        title={t("Components", "کامپوننت‌ها")}
        description={t(
          "Browse the MaterialFluid kit.",
          "کامپوننت‌های متریال‌فلوید را ببینید.",
        )}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        className="mobile-navigation"
      >
        <LayoutGroup id="catalogue-mobile">{nav}</LayoutGroup>
      </Drawer>
    </MaterialFluidProvider>
  );
}
