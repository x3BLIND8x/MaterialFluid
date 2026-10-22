// Live control examples share the page's variant and size defaults.
import { componentVariants, useComponentAppearance } from "../../kit/appearance";
import { useState, useEffect, useRef, useId } from "react";
import { animate, motion, useAnimate, useMotionValue, useTransform } from "motion/react";
import {
  Button,
  ButtonGroup,
  IconButton,
  FAB,
  Toggle,
  ToggleGroup,
  useButtonPressProgress,
  Checkbox,
  RadioGroup,
  Switch,
  Slider,
} from "../../kit/controls";
import { AnimatedIcon, registerMaterialIcons, type IconName } from "../../kit/icons";
import { IconSwap } from "../../kit/icon-swap";
import { RollingNumber } from "../../kit/rolling-number";
import { actionIcons } from "./action-icons";
import { getMaterialIcon } from "../../kit/icon-registry";
import { useMaterialFluid } from "../../kit/provider";
import { type DemoProps, translate } from "./shared";

registerMaterialIcons(actionIcons);

function MorphingLabel({
  text,
  animated,
  onVisibleTextChange,
}: {
  text: string;
  animated: boolean;
  onVisibleTextChange?: () => void;
}) {
  const { textMorph: { duration, blur, fade } } = useMaterialFluid();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const [visibleText, setVisibleText] = useState(text);

  useEffect(() => {
    if (visibleText === text) return;
    if (!animated) {
      setVisibleText(text);
      onVisibleTextChange?.();
      return;
    }

    const halfDuration = duration / 2000;
    const blurAnimation = animate(
      scope.current,
      { filter: `blur(${blur}px)`, scale: 0.97, opacity: 1 - Math.max(0, Math.min(100, fade)) / 100 },
      { duration: halfDuration, ease: "easeInOut" },
    );
    const swapTimer = window.setTimeout(() => {
      setVisibleText(text);
      onVisibleTextChange?.();
      animate(
        scope.current,
        { filter: "blur(0px)", scale: 1, opacity: 1 },
        { duration: halfDuration, ease: "easeOut" },
      );
    }, duration / 2);

    return () => {
      window.clearTimeout(swapTimer);
      blurAnimation.stop();
    };
  }, [
    animate,
    animated,
    blur,
    duration,
    fade,
    onVisibleTextChange,
    scope,
    text,
    visibleText,
  ]);

  return (
    <motion.span ref={scope} className="mf-morph-label">
      {visibleText}
    </motion.span>
  );
}

const favoriteOutlinePath = "M10.65 19.8 8.925 18.225Q6.275 15.8 4.138 13.412Q2 11.025 2 8.15Q2 5.8 3.575 4.225Q5.15 2.65 7.5 2.65Q8.825 2.65 10 3.212Q11.175 3.775 12 4.75Q12.825 3.775 14 3.212Q15.175 2.65 16.5 2.65Q18.85 2.65 20.425 4.225Q22 5.8 22 8.15Q22 11.025 19.875 13.425Q17.75 15.825 15.05 18.25L13.35 19.8Q13.075 20.075 12.713 20.2Q12.35 20.325 12 20.325Q11.65 20.325 11.288 20.2Q10.925 20.075 10.65 19.8ZM11.05 6.75Q10.325 5.725 9.5 5.187Q8.675 4.65 7.5 4.65Q6 4.65 5 5.65Q4 6.65 4 8.15Q4 9.45 4.925 10.912Q5.85 12.375 7.138 13.75Q8.425 15.125 9.788 16.325Q11.15 17.525 12 18.3Q12.85 17.525 14.213 16.325Q15.575 15.125 16.863 13.75Q18.15 12.375 19.075 10.912Q20 9.45 20 8.15Q20 6.65 19 5.65Q18 4.65 16.5 4.65Q15.325 4.65 14.5 5.187Q13.675 5.725 12.95 6.75Q12.775 7 12.525 7.125Q12.275 7.25 12 7.25Q11.725 7.25 11.475 7.125Q11.225 7 11.05 6.75Z";

function ToggleHeartIcon({
  active,
  reducedMotion,
  duration,
  fillOnDepth,
  fillOffDepth,
  easeStrength,
}: {
  active: boolean;
  reducedMotion: boolean;
  duration: number;
  fillOnDepth: number;
  fillOffDepth: number;
  easeStrength: number;
}) {
  const clipId = useId().replace(/:/g, "");
  const filledPath = getMaterialIcon("heart").paths[0];
  const pressProgress = useButtonPressProgress();
  const fallbackPressProgress = useMotionValue(0);
  const selectedFill = useMotionValue(active ? 1 : 0);
  const fillRadius = useTransform(
    [selectedFill, pressProgress ?? fallbackPressProgress],
    ([selected, pressed]: number[]) =>
      18 *
      (selected * (1 - pressed * (fillOffDepth / 100)) +
        (1 - selected) * pressed * (fillOnDepth / 100)),
  );
  useEffect(() => {
    const animation = animate(selectedFill, active ? 1 : 0, {
      duration: reducedMotion ? 0 : duration / 1000,
      ease: [
        1 - Math.min(0.95, Math.max(0, easeStrength / 100)),
        1,
        0.3,
        1,
      ],
    });
    return () => animation.stop();
  }, [active, duration, easeStrength, reducedMotion, selectedFill]);
  return (
    <span className="toggle-heart-icon" aria-hidden="true" style={{ color: "inherit" }}>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d={favoriteOutlinePath} />
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <motion.circle
              cx="12"
              cy="12"
              r="0"
              style={{ r: fillRadius }}
            />
          </clipPath>
        </defs>
        <path d={filledPath} clipPath={`url(#${clipId})`} />
      </svg>
    </span>
  );
}
function PlaybackIcon({ name }: { name: "play" | "pause" | "rewind" | "forward" | "stop" }) {
  const names = { play: "play_arrow", pause: "pause", rewind: "fast_rewind", forward: "fast_forward", stop: "stop" } as const;
  return <IconSwap identity={name}><AnimatedIcon name={names[name]} size={22} /></IconSwap>;
}
function ButtonGroupExamples({ disabled, fa }: { disabled?: boolean; fa: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [format, setFormat] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const t = (en: string, persian: string) => fa ? persian : en;
  useEffect(() => {
    if (!playing || disabled) return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [playing, disabled]);
  return <div className="demo-stack">
    <div className="demo-stack demo-button-group-example">
      <span className="demo-group-label">{t("Playback", "پخش")}</span>
      <ButtonGroup label={t("Playback", "پخش")}>
        <IconButton label={t("Rewind 10 seconds", "۱۰ ثانیه به عقب")} disabled={disabled} onClick={() => setSeconds(value => Math.max(0, value - 10))}><PlaybackIcon name="rewind" /></IconButton>
        <IconButton variant="primary" label={playing ? t("Pause", "مکث") : t("Play", "پخش")} aria-pressed={playing} disabled={disabled} onClick={() => setPlaying(value => !value)}><PlaybackIcon name={playing ? "pause" : "play"} /></IconButton>
        <IconButton label={t("Forward 10 seconds", "۱۰ ثانیه به جلو")} disabled={disabled} onClick={() => setSeconds(value => value + 10)}><PlaybackIcon name="forward" /></IconButton>
        <IconButton label={t("Stop", "توقف")} disabled={disabled} onClick={() => { setPlaying(false); setSeconds(0); }}><PlaybackIcon name="stop" /></IconButton>
      </ButtonGroup>
      <output className="demo-caption"><RollingNumber value={seconds} format={value => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`} /></output>
    </div>
    <div className="demo-stack demo-button-group-example">
      <span className="demo-group-label">{t("Formatting", "قالب‌بندی")}</span>
      <ButtonGroup label={t("Text formatting", "قالب‌بندی متن")}>
        {([ ["bold", t("Bold", "ضخیم")], ["italic", t("Italic", "مورب")], ["underline", t("Underline", "زیرخط")] ] as const).map(([key, label]) => <IconButton key={key} variant={format.includes(key) ? "primary" : "ghost"} label={label} disabled={disabled} aria-pressed={format.includes(key)} onClick={() => setFormat(value => value.includes(key) ? value.filter(item => item !== key) : [...value, key])}><AnimatedIcon name={{ bold: "format_bold", italic: "format_italic", underline: "format_underlined" }[key] as IconName} size={22} /></IconButton>)}
      </ButtonGroup>
      <p className="demo-caption" style={{ fontWeight: format.includes("bold") ? 800 : undefined, fontStyle: format.includes("italic") ? "italic" : undefined, textDecoration: format.includes("underline") ? "underline" : undefined }}>{t("Make it your own.", "به سلیقهٔ خود تغییر دهید.")}</p>
    </div>
    <ButtonGroup label={t("Pagination", "صفحه‌بندی")}>
      <Button disabled={disabled || page === 1} onClick={() => setPage(value => value - 1)}>{t("Previous", "قبلی")}</Button>
      <output className="mf-button-group-value" aria-live="polite" aria-label={t(`Page ${page} of 5`, `صفحهٔ ${page} از ۵`)}><RollingNumber value={page} /><span aria-hidden="true">/</span><span aria-hidden="true">5</span></output>
      <Button disabled={disabled || page === 5} onClick={() => setPage(value => value + 1)}>{t("Next", "بعدی")}</Button>
    </ButtonGroup>
  </div>;
}

export default function ControlsDemo({
  id,
  states,
  locale,
  fabMotion,
}: DemoProps) {
  const t = translate(locale);
  const { variant = "primary" } = useComponentAppearance();
  const {
    motion: motionMode,
    reducedMotion,
    buttonMotion,
  } = useMaterialFluid();
  type FabAction = "create" | "add";
  type FabStatus = "idle" | "loading" | "success";
  const [fabStatuses, setFabStatuses] = useState<Record<FabAction, FabStatus>>({
    create: "idle",
    add: "idle",
  });
  const fabTimers = useRef(
    new Map<FabAction, ReturnType<typeof setTimeout>>(),
  );
  useEffect(
    () => () => {
      fabTimers.current.forEach((timer) => clearTimeout(timer));
      fabTimers.current.clear();
    },
    [],
  );
  const [selected, setSelected] = useState(false);
  const [, notifyToggleTextSwap] = useState(0);
  const [iconToggleSelected, setIconToggleSelected] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const activateFab = (action: FabAction) => {
    const activeTimer = fabTimers.current.get(action);
    if (activeTimer) clearTimeout(activeTimer);
    setFabStatuses((current) => ({ ...current, [action]: "loading" }));
    const timer = setTimeout(() => {
      fabTimers.current.delete(action);
      setFabStatuses((current) => ({ ...current, [action]: "success" }));
    }, fabMotion.loadingDuration);
    fabTimers.current.set(action, timer);
  };
  useEffect(() => setSelected(!!states.selected), [states.selected]);
  const options = [
    { value: "list", label: t("List", "فهرست") },
    { value: "grid", label: t("Grid", "شبکه") },
    { value: "board", label: t("Board", "تابلو") },
  ];
  let demo;
  switch (id) {
    case "button":
      demo = (
        <div className="demo-stack">
          <div className="demo-variants">
            {componentVariants.map((variant) => {
              const label =
                locale === "fa"
                  ? {
                      primary: "اصلی",
                      secondary: "ثانویه",
                      tertiary: "سوم",
                      outline: "خطی",
                      ghost: "شفاف",
                      danger: "خطر",
                    }[variant]
                  : variant[0].toUpperCase() + variant.slice(1);
              return (
                <Button key={variant} variant={variant}>
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      );
      break;
    case "button-group":
      demo = <ButtonGroupExamples disabled={states.disabled} fa={locale === "fa"} />;
      break;
    case "icon-button":
      {
        const { name, label } = {
          primary: { name: "bell", label: t("Notifications", "اعلان‌ها") },
          secondary: { name: "heart", label: t("Favorite", "علاقه‌مندی") },
          tertiary: { name: "settings", label: t("Settings", "تنظیمات") },
          outline: { name: "edit", label: t("Edit", "ویرایش") },
          ghost: { name: "search", label: t("Search", "جستجو") },
          danger: { name: "delete", label: t("Delete", "حذف") },
        }[variant];
        demo = (
          <div className="demo-row">
            <IconButton label={label} disabled={states.disabled}>
              <AnimatedIcon name={name as IconName} size={26} />
            </IconButton>
          </div>
        );
        break;
      }
    case "fab":
      {
        const createStatus = fabStatuses.create;
        const addStatus = fabStatuses.add;
        const textMotion = motionMode === "expressive" && !reducedMotion;
        const createText =
          createStatus === "loading"
            ? t("Creating…", "در حال ایجاد…")
            : createStatus === "success"
              ? t("Created", "ایجاد شد")
              : t("Create", "ایجاد");
      demo = (
        <div className="demo-row">
          <FAB
            disabled={states.disabled || createStatus === "loading"}
            aria-busy={createStatus === "loading" || undefined}
            success={createStatus === "success"}
            aria-live="polite"
            onClick={() => activateFab("create")}
            leading={
              <span className="fab-icon-slot">
                {createStatus === "loading" ? (
                  <span className="mf-button-loader" aria-hidden="true" />
                ) : (
                  <AnimatedIcon
                    name={createStatus === "success" ? "check" : "plus"}
                    animated={false}
                  />
                )}
              </span>
            }
          >
            <span className="fab-label-slot" aria-live="polite">
              <span className="fab-label-measure" aria-hidden="true">
                {t("Creating…", "در حال ایجاد…")}
              </span>
              <MorphingLabel
                text={createText}
                animated={textMotion}
                onVisibleTextChange={() => notifyToggleTextSwap((value) => value + 1)}
              />
            </span>
          </FAB>
          <FAB
            disabled={states.disabled || addStatus === "loading"}
            aria-busy={addStatus === "loading" || undefined}
            success={addStatus === "success"}
            aria-live="polite"
            aria-label={
              addStatus === "loading"
                ? t("Adding item", "در حال افزودن")
                : addStatus === "success"
                  ? t("Item added", "مورد افزوده شد")
                  : t("Add item", "افزودن مورد")
            }
            onClick={() => activateFab("add")}
          >
            <span className="fab-icon-slot">
              {addStatus === "loading" ? (
                <span className="mf-button-loader" aria-hidden="true" />
              ) : (
              <AnimatedIcon
                name={addStatus === "success" ? "check" : "plus"}
                animated={false}
              />
              )}
            </span>
          </FAB>
        </div>
      );
      break;
      }
    case "toggle":
      {
        const textMotion = motionMode === "expressive" && !reducedMotion;
        const toggleText = selected
          ? t("Saved", "ذخیره شد")
          : t("Save", "ذخیره");
        demo = (
          <div className="demo-row">
            <Toggle
              disabled={states.disabled}
              pressed={selected}
              onPressedChange={setSelected}
              leading={
                <ToggleHeartIcon
                  active={selected}
                  reducedMotion={reducedMotion}
                  duration={buttonMotion.rippleDuration}
                  fillOnDepth={fabMotion.toggleFillOnDepth}
                  fillOffDepth={fabMotion.toggleFillOffDepth}
                  easeStrength={buttonMotion.rippleFastStart}
                />
              }
            >
              <MorphingLabel
                text={toggleText}
                animated={textMotion}
              />
            </Toggle>
            <Toggle
              type="button"
              aria-label={t("Favorite", "علاقه‌مندی")}
              disabled={states.disabled}
              pressed={iconToggleSelected}
              onPressedChange={setIconToggleSelected}
              className="toggle-icon-only"
            >
              <ToggleHeartIcon
                active={iconToggleSelected}
                reducedMotion={reducedMotion}
                duration={buttonMotion.rippleDuration}
                fillOnDepth={fabMotion.toggleFillOnDepth}
                fillOffDepth={fabMotion.toggleFillOffDepth}
                easeStrength={buttonMotion.rippleFastStart}
              />
            </Toggle>
          </div>
        );
        break;
      }
    case "toggle-group":
      demo = (
        <div className="demo-stack">
        <ToggleGroup
          label={t("View", "نما")}
          options={options}
          defaultValue={states.selected ? "grid" : "list"}
        />
        <ToggleGroup label={t("Confirmation", "تأیید")} options={[{ value: "yes", label: t("Yes", "بله") }, { value: "no", label: t("No", "خیر") }]} defaultValue="yes" />
        <ToggleGroup
          iconOnly
          label={t("Appearance", "ظاهر")}
          defaultValue="system"
          options={[
            { value: "dark", ariaLabel: t("Dark mode", "حالت تاریک"), label: <AnimatedIcon name="moon" size={20} /> },
            { value: "system", ariaLabel: t("System", "سیستم"), label: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 17v4M8 21h8" /></svg> },
            { value: "light", ariaLabel: t("Light mode", "حالت روشن"), label: <AnimatedIcon name="sun" size={20} /> },
          ]}
        />
        </div>
      );
      break;
    case "checkbox":
      demo = (
        <div className="demo-stack demo-start">
          <Checkbox
            label={t("Receive project updates", "دریافت به‌روزرسانی پروژه")}
            checked={selected}
            onCheckedChange={(v) => setSelected(v === true)}
            disabled={states.disabled}
          />
          <Checkbox
            label={t("Partially selected group", "گروه نیمه‌انتخاب‌شده")}
            checked="indeterminate"
            disabled={states.disabled}
          />
        </div>
      );
      break;
    case "radio-group":
      demo = (
        <div className="demo-stack demo-start">
        <RadioGroup
          label={t("Plan", "طرح")}
          options={[
            {
              value: "personal",
              label: t("Personal", "شخصی"),
              disabled: states.disabled,
            },
            {
              value: "team",
              label: t("Team", "تیمی"),
              disabled: states.disabled,
            },
            {
              value: "studio",
              label: t("Studio", "استودیو"),
              disabled: states.disabled,
            },
          ]}
          defaultValue="team"
        />
        <RadioGroup orientation="vertical"
          label={t("Plan · Vertical", "طرح · عمودی")}
          options={[
            {
              value: "personal",
              label: t("Personal", "شخصی"),
              disabled: states.disabled,
            },
            {
              value: "team",
              label: t("Team", "تیمی"),
              disabled: states.disabled,
            },
            {
              value: "studio",
              label: t("Studio", "استودیو"),
              disabled: states.disabled,
            },
          ]}
          defaultValue="team"
        />
        </div>
      );
      break;
    case "switch":
      demo = (
        <div className="demo-switches">
          <Switch
            label={t("Wi-Fi", "وای‌فای")}
            icon="wifi"
            checked={selected}
            onCheckedChange={setSelected}
            disabled={states.disabled}
          />
          <Switch
            label={t("Bluetooth", "بلوتوث")}
            icon="bluetooth"
            checked={bluetoothEnabled}
            onCheckedChange={setBluetoothEnabled}
            disabled={states.disabled}
          />
          {([
            ["check", t("Yes / No", "بله / خیر")],
            ["lock", t("Lock", "قفل")],
            ["hotspot", t("Hotspot", "نقطهٔ اتصال")],
            ["vpn", t("VPN", "وی‌پی‌ان")],
            ["bell", t("Notifications", "اعلان‌ها")],
            ["theme", t("Day / Night", "روز / شب")],
            ["flashlight", t("Flashlight", "چراغ‌قوه")],
            ["airplane", t("Airplane mode", "حالت پرواز")],
            ["mobile-data", t("Mobile data", "دادهٔ همراه")],
            ["usb-tether", t("USB tethering", "اشتراک USB")],
            ["mute", t("Mute", "بی‌صدا")],
            ["color-inversion", t("Color inversion", "وارونگی رنگ")],
          ] as const).map(([icon, label]) => <Switch key={icon} icon={icon} label={label} defaultChecked={states.selected} disabled={states.disabled} />)}
          <Switch label={t("Language", "زبان")} languageLabels={{ off: "EN", on: "فا" }} defaultChecked={states.selected} disabled={states.disabled} />
          <p className="demo-caption">
            {t(
              "Tap, drag, or press Space.",
              "لمس کنید، بکشید یا فاصله را بزنید.",
            )}
          </p>
        </div>
      );
      break;
    case "slider":
      demo = (
        <div className="demo-fields">
          <Slider
            label={t("Volume · Free", "صدا · پیوسته")}
            mode="continuous"
            defaultValue={[60]}
            disabled={states.disabled}
          />
          <Slider
            label={t("Snappy · Steps of 10", "گام‌دار · گام‌های ۱۰تایی")}
            mode="stepped"
            step={10}
            defaultValue={[50]}
            disabled={states.disabled}
          />
          <Slider
            label={t("Price range · Steps of 5", "بازه قیمت · گام‌های ۵تایی")}
            mode="stepped"
            step={5}
            defaultValue={[25, 75]}
            disabled={states.disabled}
          />
        </div>
      );
      break;
  }
  return (
    <>
      <div className="demo-primary">{demo}</div>
    </>
  );
}
