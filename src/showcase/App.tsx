import { foundationPages, type FoundationPageId } from "./foundations/model";
import { normalizeComponentSize, sizesForComponent } from "../kit/component-policy";
import { LayoutGroup } from "motion/react";
import { Component, useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef, type ReactNode } from "react";
import { MaterialFluidProvider } from "../kit/provider";
import {
  ComponentAppearanceProvider,
  componentVariants,
  type ComponentVariant,
  type ComponentSize,
  type LabelPosition,
} from "../kit/appearance";
import { Button, IconButton, Switch, Toggle, ToggleGroup } from "../kit/controls";
import { AnimatedIcon } from "../kit/icons";
import { Drawer, Popover, Tooltip } from "../kit/overlays";
import { Link, NavigationRail, TableOfContents, TopAppBar, Breadcrumbs, Tabs } from "../kit/navigation";
import { Tree } from "../kit/tree";
import { SearchField, Select } from "../kit/forms";
import { Spinner } from "../kit/feedback";
import { catalogue, findEntry, families, text, type DemoState } from "./catalogue";
import {
  loadPreferences,
  savePreferences,
  type Preferences,
} from "./preferences";
import { usageFor } from "./usage";
import { ColorSettings } from "./color-settings";
import { AccentSeed } from "./accent-seed";
import { ColorPage } from "./color-page";
import { fabMotionDefaults } from "./demos/shared";
import { buttonExampleDefaults, buttonExampleText, buttonExampleCode, type ButtonExample } from "./button-playground-model";
const ButtonPlayground = lazy(() => import("./button-playground"));
import { iconButtonExampleDefaults, iconButtonExampleCode, type IconButtonExample } from "./icon-button-playground-model";
const IconButtonPlayground = lazy(() => import("./icon-button-playground"));
import { buttonGroupDefaults, buttonGroupExampleCode, localizeButtonGroupExample, type ButtonGroupExample } from "./button-group-playground-model";
const ButtonGroupPlayground = lazy(() => import("./button-group-playground"));
import { splitButtonDefaults, splitButtonExampleCode, localizeSplitButtonExample, type SplitButtonExample } from "./split-button-playground-model";
import {fabDefaults,fabExampleCode,localizeFABExample,type FABExample} from "./fab-playground-model";
import {fabMenuDefaults,fabMenuExampleCode,localizeFABMenuExample,type FABMenuExample} from "./fab-menu-playground-model";
const FABMenuPlayground=lazy(()=>import("./fab-menu-playground"));
import {extendedFABDefaults,extendedFABExampleCode,localizeExtendedFABExample,type ExtendedFABExample} from "./extended-fab-playground-model";
const ExtendedFABPlayground=lazy(()=>import("./extended-fab-playground"));
import {checkboxDefaults,checkboxExampleCode,localizeCheckbox,type CheckboxExample} from "./checkbox-playground-model";
const CheckboxPlayground=lazy(()=>import("./checkbox-playground"));
const FABPlayground=lazy(()=>import("./fab-playground"));
const SplitButtonPlayground = lazy(() => import("./split-button-playground"));
import CatalogueDemo from "./demos/catalogue";
const FoundationPage = lazy(() => import("./foundations/page"));
const MotionPage = lazy(() => import('./motion/Page'));
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
  return id;
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
  const [expandedFamilies, setExpandedFamilies] = useState<string[]>(() => families.map(group => group.id));
  const [collapsed, setCollapsed] = useState(false);
  const [compactActions, setCompactActions] = useState(() => window.innerWidth < 600);
  const topbar = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [states, setStates] = useState<Partial<Record<DemoState, boolean>>>({});
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const variant: ComponentVariant = "filled";
  const [buttonExample, setButtonExample] = useState<ButtonExample>(() => ({ ...buttonExampleDefaults }));
  const [iconButtonExample, setIconButtonExample] = useState<IconButtonExample>(() => ({ ...iconButtonExampleDefaults }));
  const [buttonGroupExample, setButtonGroupExample] = useState<ButtonGroupExample>(() => ({...buttonGroupDefaults,items:buttonGroupDefaults.items.map(item=>({...item}))}));
  const updateButtonGroup = useCallback((next: ButtonGroupExample) => { setButtonGroupExample(next); setCopied(false); setCopyError(false); }, []);
  const [splitButtonExample, setSplitButtonExample] = useState<SplitButtonExample>(()=>({...splitButtonDefaults,items:splitButtonDefaults.items.map(item=>({...item}))}));
  const updateSplitButton=useCallback((next:SplitButtonExample)=>{setSplitButtonExample(next);setCopied(false);setCopyError(false);},[]);
  const [buttonCode, setButtonCode] = useState<"react" | "web">("react");
  const [size, setSize] = useState<ComponentSize>("md");
  const [labelPosition, setLabelPosition] = useState<LabelPosition>("top");
  const [fabKind,setFABKind]=useState("icon");
  const [extendedFABExample,setExtendedFABExample]=useState<ExtendedFABExample>(()=>({...extendedFABDefaults}));
  const updateExtendedFAB=useCallback((next:ExtendedFABExample)=>{setExtendedFABExample(next);setCopied(false);setCopyError(false);},[]);
  const [fabExample,setFABExample]=useState<FABExample>(()=>({...fabDefaults}));
  const updateFAB=useCallback((next:FABExample)=>{setFABExample(next);setCopied(false);setCopyError(false);},[]);
  const [fabMenuExample,setFABMenuExample]=useState<FABMenuExample>(()=>({...fabMenuDefaults,items:fabMenuDefaults.items.map(item=>({...item}))}));
  const updateFABMenu=useCallback((next:FABMenuExample)=>{setFABMenuExample(next);setCopied(false);setCopyError(false);},[]);
  const [checkboxExample,setCheckboxExample]=useState<CheckboxExample>(()=>({...checkboxDefaults,items:checkboxDefaults.items.map(item=>({...item}))}));
  const updateCheckbox=useCallback((next:CheckboxExample)=>{setCheckboxExample(next);setCopied(false);setCopyError(false);},[]);
  const fixedControls = ["fab","fab-menu", "chips", "split-button","button-group", "toggle", "toggle-group", "checkbox", "radio-group", "switch", "slider", "text-field", "textarea"];
  const fabMotion = fabMotionDefaults;
  const heading = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState("usage");
  const [componentView, setComponentView] = useState("configuration");
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const html = document.documentElement;
    const names = ["--mf-scrollbar-thumb", "--mf-scrollbar-track", "--mf-scrollbar-hover", "--mf-scrollbar-gutter"];
    const previous = names.map(name => html.style.getPropertyValue(name));
    const canvas = [html.style.backgroundColor, document.body.style.backgroundColor, html.style.colorScheme];
    const update = () => {
      const style = getComputedStyle(element);
      const background = style.backgroundColor;
      [style.getPropertyValue("--mf-outline-variant"), background, style.getPropertyValue("--mf-outline"), background].forEach((value, index) => html.style.setProperty(names[index], value));
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
  const t = useCallback((en: string, persian: string) => (fa ? persian : en), [fa]);
  const entry = findEntry(route) ?? catalogue[0];
  const effectiveSize = normalizeComponentSize(entry.id, size);
  const sizeOptions = sizesForComponent(entry.id);
  const foundationId = route.startsWith("foundations/") ? route.split("/")[1] : "";
  const foundationPage = ["typography", "shape", "accessibility"].includes(foundationId);
  const colorsPage = route === "colors" || foundationId === "color";
  const motionPage = route === "motion" || foundationId === "motion";
  const family = families.find((f) => f.id === entry.family) ?? families[0];
  const LegacyDemo = demos[entry.demoFamily ?? entry.family];
  const Demo = entry.custom ? CatalogueDemo : LegacyDemo;
  const change = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));
  useEffect(() => {
    const update = () => {
      setRoute(routeId());
      setStates({});
      setCopied(false);
      setCopyError(false);
      setMobileOpen(false);
      setSection("usage");
      setComponentView("configuration");
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
  }, [route]);
  useEffect(() => savePreferences(prefs), [prefs]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = fa ? "rtl" : "ltr";
    document.title = `${motionPage ? t('Motion playground','آزمایشگاه حرکت') : colorsPage ? t("Color system", "سیستم رنگ") : fa ? entry.fa : displayName(entry.name)} · MaterialFluid`;
  }, [locale, fa, entry, colorsPage, motionPage]);
  const results = useMemo(() => catalogue.filter((c) =>
    `${c.name} ${displayName(c.name)} ${c.fa} ${text(c.description, locale)}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  ), [search, locale]);
  useEffect(() => {
    if (search.trim()) { setExpandedFamilies(families.map(group => group.id)); }
  }, [search]);
  const nav = useMemo(() => (
    <div className="catalogue-navigation">
      <Tree className="foundation-tree" size="sm" iconMode="none" label={t("Foundations", "زیرساخت‌ها")} value={colorsPage ? "color" : motionPage ? "motion" : foundationId} defaultExpanded={["foundations"]} items={[{value:"foundations",label:t("Foundations","زیرساخت‌ها"),children:foundationPages.map(([value,en,persian])=>({value,label:fa?persian:en,href:value==="color"?"#/colors":value==="motion"?"#/motion":`#/foundations/${value}`}))}]}/>
      <SearchField className="nav-search" label={t("Search components", "جستجوی کامپوننت‌ها")}
        placeholder={t("Find a component…", "یافتن کامپوننت…")} value={search}
        onChange={event => setSearch(event.target.value)}
        trailing={<span className="nav-search-count">{results.length.toLocaleString(locale)}</span>} />
      <nav aria-label={t("Components", "کامپوننت‌ها")}>
        {results.length > 0 && <Tree iconMode="none" className="catalogue-tree" size="sm" label={t("Components", "کامپوننت‌ها")}
          value={colorsPage || motionPage || foundationPage ? "" : entry.id} expanded={expandedFamilies} onExpandedChange={setExpandedFamilies}
          items={families.flatMap(group => {
            const entries = results.filter(component => component.family === group.id);
            return entries.length ? [{ value: group.id, label: text(group.label, locale), children: entries.map(component => ({
              value: component.id, href: `#/components/${component.id}`, label: fa ? component.fa : displayName(component.name),
            })) }] : [];
          })} />}
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
  ), [colorsPage, motionPage, foundationPage, foundationId, entry.id, expandedFamilies, fa, locale, results, search, t]);
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
  const next = catalogue[Math.max(0, catalogue.indexOf(entry)) + 1];
  const usage = entry.id === "checkbox" ? checkboxExampleCode(localizeCheckbox(checkboxExample,fa),buttonCode) : entry.id === "fab-menu" ? fabMenuExampleCode(localizeFABMenuExample(fabMenuExample,fa),buttonCode) : entry.id === "fab" ? fabKind==="extended" ? extendedFABExampleCode(localizeExtendedFABExample(extendedFABExample,fa),buttonCode) : fabExampleCode(localizeFABExample(fabExample,fa),buttonCode) : entry.id === "split-button" ? splitButtonExampleCode(localizeSplitButtonExample(splitButtonExample,fa),buttonCode) : entry.id === "button-group" ? buttonGroupExampleCode(localizeButtonGroupExample(buttonGroupExample,fa), buttonCode) : entry.id === "icon-button" ? iconButtonExampleCode(iconButtonExample, buttonCode, fa) : entry.id === "button" ? buttonExampleCode({ ...buttonExample, text: buttonExampleText(buttonExample, fa) }, buttonCode) : usageFor(entry, { variant, size: effectiveSize, labelPosition });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(usage);
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
                    colorPreset={prefs.colorPreset}
                    onColorPresetChange={(value) => change("colorPreset", value)}
                    neutralColors={prefs.neutralColors}
                    onNeutralColorsChange={(value) => change("neutralColors", value)}
                    value={prefs.colorBehavior}
                    onChange={(value) => change("colorBehavior", value)}
                    locale={locale}
                    colorDesign={prefs.colorDesign}
                    onColorDesignChange={(value) => change("colorDesign", value)}
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
  const configuration = <>
            {entry.id === "checkbox" ? <DemoBoundary fa={fa}><Suspense fallback={<Spinner label={t("Loading example","بارگیری نمونه")}/>}><CheckboxPlayground value={checkboxExample} onChange={updateCheckbox} fa={fa}/></Suspense></DemoBoundary> : entry.id === "fab-menu" ? <DemoBoundary fa={fa}><Suspense fallback={<Spinner label={t("Loading example","بارگیری نمونه")}/>}><FABMenuPlayground value={fabMenuExample} onChange={updateFABMenu} fa={fa}/></Suspense></DemoBoundary> : entry.id === "fab" ? <DemoBoundary fa={fa}><Suspense fallback={<Spinner label={t("Loading example","بارگیری نمونه")}/>}>{fabKind==="extended"?<ExtendedFABPlayground value={extendedFABExample} onChange={updateExtendedFAB} fa={fa} onKindChange={setFABKind}/>:<FABPlayground value={fabExample} onChange={updateFAB} fa={fa} onKindChange={setFABKind}/>}</Suspense></DemoBoundary> : entry.id === "split-button" ? <DemoBoundary fa={fa}><Suspense fallback={<Spinner label={t("Loading example","بارگیری نمونه")}/>}><SplitButtonPlayground value={splitButtonExample} onChange={updateSplitButton} fa={fa}/></Suspense></DemoBoundary> : entry.id === "button-group" ? <DemoBoundary fa={fa}><Suspense fallback={<Spinner label={t("Loading example", "بارگیری نمونه")}/>}><ButtonGroupPlayground value={buttonGroupExample} onChange={updateButtonGroup} fa={fa}/></Suspense></DemoBoundary> : entry.id === "icon-button" ? <DemoBoundary fa={fa}><Suspense fallback={<Spinner label={t("Loading example", "بارگیری نمونه")}/>}><IconButtonPlayground value={iconButtonExample} onChange={next => { setIconButtonExample(next); setCopied(false); setCopyError(false); }} fa={fa}/></Suspense></DemoBoundary> : entry.id === "button" ? <DemoBoundary fa={fa}><Suspense fallback={<Spinner label={t("Loading example", "بارگیری نمونه")}/>}><ButtonPlayground value={buttonExample} onChange={next => { setButtonExample(next); setCopied(false); setCopyError(false); }} fa={fa}/></Suspense></DemoBoundary> : <>
            <section
              id="examples"
              aria-label={t("Live examples", "نمونه‌های زنده")}
            >
              <div className="live-stage">
                <div className="component-appearance-controls">
                  {sizeOptions.length > 1 && <Select id="component-size" labelPosition="start" label={t("Size", "اندازه")} size="sm" value={effectiveSize}
                    onValueChange={value => setSize(value as ComponentSize)}
                    options={sizeOptions.map(value => ({ value, label: value === "xs" ? t("Extra Small", "خیلی کوچک") : value === "xl" ? t("Extra Large", "خیلی بزرگ") : value === "sm" ? t("Small", "کوچک") : value === "lg" ? t("Large", "بزرگ") : t("Medium", "متوسط") }))} />}
                  {(entry.demoFamily ?? entry.family) === "forms" && <Select id="component-label-position" labelPosition="start" size="sm" label={t("Label", "برچسب")} value={labelPosition} onValueChange={value => setLabelPosition(value as LabelPosition)} options={[{value:"top",label:t("Top", "بالا")},{value:"start",label:t("Start", "ابتدا")},{value:"none",label:t("None", "بدون برچسب")}]} />}
                </div>
                <div className="showcase-canvas">
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
                  {entry.id === "button" || entry.family === "icons" || entry.family === "forms" || entry.family === "navigation" || entry.family === "surfaces" || entry.family === "feedback" || entry.family === "overlays" || entry.custom || fixedControls.includes(entry.id) ? (
                    <ComponentAppearanceProvider variant={entry.family === "forms" ? "outline" : "filled"} size={effectiveSize} labelPosition={labelPosition}>
                      <Demo
                        key={entry.id + JSON.stringify(states) + locale}
                        id={entry.demoId ?? entry.id}
                        states={states}
                        locale={locale}
                        fabMotion={fabMotion}
                      />
                    </ComponentAppearanceProvider>
                  ) : (
                    <div className={`component-variant-examples${entry.id === "icon-button" ? " compact-icon-examples" : ""}`}>
                      {componentVariants.map((value) => {
                        const label = fa
                          ? { filled: "پر", tonal: "تونال", outlined: "خطی", ghost: "شفاف", danger: "خطر" }[value]
                          : value[0].toUpperCase() + value.slice(1);
                        return (
                          <section className="component-variant-example" key={value} aria-label={label}>
                            <ComponentAppearanceProvider variant={value} size={effectiveSize} labelPosition={labelPosition}>
                              <Demo
                                key={entry.id + value + JSON.stringify(states) + locale}
                                id={entry.demoId ?? entry.id}
                                states={states}
                                locale={locale}
                                fabMotion={fabMotion}
                                      />
                            </ComponentAppearanceProvider>
                          </section>
                        );
                      })}
                    </div>
                  )}
                </Suspense>
                </DemoBoundary>
                </div>
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
            </>}
  </>;
  const documentation = <>
            <TableOfContents className="page-sections" label={t("On this page", "در این صفحه")} size="sm" value={section}
              onValueChange={setSection}
              items={[{ value: "usage", label: t("Usage", "استفاده") }, { value: "props", label: t("Props & behavior", "ویژگی‌ها و رفتار"), children: [{ value: "props-api", label: t("API", "رابط برنامه‌نویسی") }, { value: "props-behavior", label: t("Behavior", "رفتار") }] }]} />
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
              {["button", "icon-button", "button-group", "split-button", "fab", "fab-menu", "checkbox"].includes(entry.id) && <ToggleGroup label={t("Code framework", "چارچوب کد")} value={buttonCode} onValueChange={value => { setButtonCode(value as "react" | "web"); setCopied(false); setCopyError(false); }} options={[{value:"web",label:"Web Components"},{value:"react",label:"React"}]} size="sm" />}
              <pre
                className="usage-code"
                tabIndex={0}
                aria-label={t("Usage example code", "کد نمونه استفاده")}
              >
                <code>{usage}</code>
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
              <h3 id="props-api">{t("API", "رابط برنامه‌نویسی")}</h3>
              {entry.props.length > 0 ? (
                <div className="props-scroll" tabIndex={0} role="region" aria-label={t("Component properties", "ویژگی‌های کامپوننت")}>
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
              <h3 id="props-behavior">{t("Behavior", "رفتار")}</h3>
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
            </footer>  </>;
  return (
    <MaterialFluidProvider
      {...prefs}
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
          {collapsed && <Link href="#/colors" className="palette-collapsed-link" aria-label={t("Color system", "سیستم رنگ")}><AnimatedIcon name="palette" size={22} /></Link>}
          {collapsed && <Link href="#/motion" className="palette-collapsed-link" aria-label={t("Motion playground", "آزمایشگاه حرکت")}><AnimatedIcon name="activity" size={22} /></Link>}
          {collapsed && <NavigationRail className="collapsed-navigation" label={t("Component families", "گروه‌های کامپوننت‌ها")} value={colorsPage || motionPage || foundationPage ? "" : entry.family} size="sm"
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
                items={foundationPage ? [{label:t("Foundations","زیرساخت‌ها")},{label:fa?foundationPages.find(([value])=>value===foundationId)![2]:foundationPages.find(([value])=>value===foundationId)![1]}] : motionPage ? [{label:t("Motion playground", "آزمایشگاه حرکت")}] : colorsPage ? [{ label: t("Color system", "سیستم رنگ") }] : [{label: t("Components", "کامپوننت‌ها"), href: "#/components/button"}, {label: text(family.label, locale), href: `#/components/${catalogue.find(component => component.family === family.id)!.id}`}]} />
            </>}
            actions={compactActions ? <Popover label={t("Quick settings", "تنظیمات سریع")} className="topbar-overflow" trigger={<IconButton variant="ghost" label={t("More options", "گزینه‌های بیشتر")}><AnimatedIcon name="more_vert" /></IconButton>}>{headerActions}</Popover> : headerActions} />
          <main className="showcase-frame" id="main-content">
            {foundationPage ? <DemoBoundary key={route} fa={fa}><Suspense fallback={<Spinner label={t("Loading foundation","بارگیری زیرساخت")}/>}><FoundationPage id={foundationId as Exclude<FoundationPageId,"color"|"motion">} heading={heading} onEnableMotion={() => change("motion", "expressive")}/></Suspense></DemoBoundary> : motionPage ? <DemoBoundary key={route} fa={fa}><Suspense fallback={<Spinner label={t("Loading motion playground", "بارگیری آزمایشگاه حرکت")}/>}><MotionPage fa={fa} heading={heading}/></Suspense></DemoBoundary> : colorsPage ? <ColorPage seed={prefs.accentSeed} onSeedChange={seed => change("accentSeed", seed)} onSchemeChange={value => change("colorScheme", value)} heading={heading} /> : <>
            <div className="component-intro">
              <div>
                <h1 ref={heading} tabIndex={-1}>
                  {fa ? entry.fa : displayName(entry.name)}
                </h1>
                <p>{text(entry.description, locale)}</p>
              </div>

            </div>
            <Tabs className="component-view-tabs" label={t("Component view", "نمای کامپوننت")} value={componentView} onValueChange={setComponentView} size="sm" items={[
              { value: "configuration", label: t("Configuration", "پیکربندی"), content: configuration },
              { value: "documentation", label: t("Documentation", "مستندات"), content: documentation },
            ]}/>

            </>}
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
