import { useAppearanceProps, type AppearanceProps } from "./appearance";
import {
  forwardRef,
  memo,
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { DateLib, DayPicker, type MonthCaptionProps } from "react-day-picker";
import {
  getDateLib as getPersianDateLib,
  faIR as jalaliFa,
  enUS as jalaliEn,
} from "react-day-picker/persian";
import { enUS, faIR } from "react-day-picker/locale";
import * as Pop from "@radix-ui/react-popover";
import { useMaterialFluid } from "./provider";
import { useControllable, useLatest, cx, setRef } from "./utils";
import { FormField, TextField, NumberField, type TextFieldProps, type FieldAppearanceProps } from "./forms";
import { AnimatedIcon } from "./icons";
import { AutoHeight } from "./auto-height";
import { Button, IconButton, ToggleGroup } from "./controls";
import { Portal } from "./portal";
import { FieldTriggerIcon } from "./field-trigger-icon";
import { localizeDigits } from "./numerals";
function CalendarNavButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <IconButton {...props} label={props["aria-label"] ?? "Change month"} variant="ghost" size="sm" />;
}
type CalendarView = "days" | "months" | "year";
const CalendarNavigation = createContext<{
  library: DateLib; view: CalendarView; openView: (view: CalendarView) => void;
  monthButton: RefObject<HTMLButtonElement | null>; yearButton: RefObject<HTMLButtonElement | null>; disabled?: boolean;
} | null>(null);
function CalendarCaption({ calendarMonth, displayIndex: _displayIndex, children: _children, ...props }: MonthCaptionProps) {
  const navigation = useContext(CalendarNavigation);
  if (!navigation) return <div {...props} />;
  return <div {...props}>
    <Button ref={navigation.monthButton} variant="ghost" size="sm" disabled={navigation.disabled} aria-expanded={navigation.view === "months"} onClick={() => navigation.openView("months")}>{navigation.library.format(calendarMonth.date, "LLLL")}</Button>
    <Button ref={navigation.yearButton} variant="ghost" size="sm" disabled={navigation.disabled} aria-expanded={navigation.view === "year"} onClick={() => navigation.openView("year")}>{navigation.library.format(calendarMonth.date, "yyyy")}</Button>
  </div>;
}
function CalendarChevron({ orientation = "left" }: { orientation?: "up" | "down" | "left" | "right" }) {
  const { dir } = useMaterialFluid();
  const direction = dir === "rtl" ? orientation === "left" ? "right" : orientation === "right" ? "left" : orientation : orientation;
  return <AnimatedIcon name={`chevron-${direction}`} size={20} animated={false} />;
}
const calendarComponents = { MonthCaption: CalendarCaption, PreviousMonthButton: CalendarNavButton, NextMonthButton: CalendarNavButton, Chevron: CalendarChevron };

/** Format and localize once; DayPicker must not wrap the Jalali formatter again. */
function createCalendarLibrary(calendar: CalendarSystem, locale: "en" | "fa") {
  const library = calendar === "persian"
    ? getPersianDateLib({ locale: locale === "fa" ? jalaliFa : jalaliEn, numerals: "latn" })
    : new DateLib({ locale: locale === "fa" ? faIR : enUS, numerals: "latn" });
  const format = library.format;
  const labels = new Map<string, string>();
  library.format = (...args: Parameters<typeof format>) => {
    const key = `${args[0].getTime()}:${args[1]}`;
    const cached = labels.get(key);
    if (cached !== undefined) return cached;
    const text = localizeDigits(format(...args), locale);
    if (labels.size >= 512) labels.delete(labels.keys().next().value!);
    labels.set(key, text);
    return text;
  };
  library.formatNumber = value => localizeDigits(String(value), locale);
  return library;
}

export type CalendarSystem = "gregorian" | "persian";
export type DateOnly = string;
export interface DateRangeValue {
  from?: DateOnly;
  to?: DateOnly;
}
export function parseDateOnly(value?: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(2000, m - 1, d, 12);
  date.setFullYear(y);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  )
    return;
  return date;
}
export function toDateOnly(date: Date): DateOnly {
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function formatDateOnly(
  value: string,
  locale: "en" | "fa" = "en",
  calendar: CalendarSystem = "gregorian",
) {
  const date = parseDateOnly(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    calendar: calendar === "persian" ? "persian" : "gregory",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
export interface CalendarProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">,
    Omit<AppearanceProps, "variant"> {
  calendar?: CalendarSystem;
  value?: DateOnly;
  defaultValue?: DateOnly;
  onValueChange?: (value: DateOnly | undefined) => void;
  selection?: "single" | "range";
  range?: DateRangeValue;
  onRangeChange?: (range: DateRangeValue) => void;
  min?: DateOnly;
  max?: DateOnly;
  disabled?: boolean;
  showOutsideDays?: boolean;
}
function CalendarYearEditor({ year, min, max, disabled, locale, onApply }: { year: number; min: number; max: number; disabled?: boolean; locale: string; onApply: (year: number) => void }) {
  const [draft, setDraft] = useState(String(year));
  const valid = /^\d+$/.test(draft) && Number(draft) >= min && Number(draft) <= max;
  const apply = () => { if (valid && !disabled) onApply(Number(draft)); };
  return <div className="mf-calendar-year-editor">
    <NumberField presentation="goal" label={locale === "fa" ? "سال" : "Year"} value={draft} min={min} max={max} disabled={disabled} onChange={event => setDraft(event.currentTarget.value)}
      onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); apply(); } }} />
    <Button size="sm" disabled={disabled || !valid} onClick={apply}>{locale === "fa" ? "تأیید سال" : "Apply year"}</Button>
  </div>;
}
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(rawProps, ref) {
    const {
      calendar: givenCalendar,
      value,
      defaultValue,
      onValueChange,
      selection = "single",
      range,
      onRangeChange,
      min,
      max,
      disabled,
      showOutsideDays = false,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const { locale, dir, motion: mode, reducedMotion } = useMaterialFluid();
    const calendar =
      givenCalendar ?? (locale === "fa" ? "persian" : "gregorian");
    const [selected, set] = useControllable<DateOnly | undefined>(
      value,
      defaultValue,
      onValueChange,
    );
    const selectedDate = parseDateOnly(selected);
    const selectedRange = {
      from: parseDateOnly(range?.from),
      to: parseDateOnly(range?.to),
    };
    const minimum = parseDateOnly(min),
      maximum = parseDateOnly(max);
    const library = useMemo(() => createCalendarLibrary(calendar, locale), [calendar, locale]);
    const [month, setMonth] = useState(() => library.startOfMonth(selectedDate ?? selectedRange.from ?? new Date()));
    const [view, setView] = useState<CalendarView>("days");
    const container = useRef<HTMLDivElement | null>(null);
    const monthButton = useRef<HTMLButtonElement | null>(null);
    const yearButton = useRef<HTMLButtonElement | null>(null);
    const wheelDelta = useRef(0);
    useEffect(() => { setMonth(current => { const next = library.startOfMonth(current); return next.getTime() === current.getTime() ? current : next; }); setView("days"); }, [library]);
    const navigate = (date: Date) => {
      let next = library.startOfMonth(date);
      if (minimum && next < library.startOfMonth(minimum)) next = library.startOfMonth(minimum);
      if (maximum && next > library.startOfMonth(maximum)) next = library.startOfMonth(maximum);
      setMonth(current => current.getTime() === next.getTime() ? current : next);
    };
    const openView = (next: CalendarView) => {
      if (view === "days" && container.current) {
        const width = container.current.querySelector<HTMLElement>(".mf-calendar")?.offsetWidth;
        if (width) container.current.style.setProperty("--mf-calendar-view-width", `${width}px`);
      }
      setView(current => current === next ? "days" : next);
    };
    const closeView = () => {
      const trigger = view === "year" ? yearButton : monthButton;
      setView("days");
      requestAnimationFrame(() => trigger.current?.focus());
    };
    useEffect(() => {
      const element = container.current;
      if (!element || disabled) return;
      const wheel = (event: WheelEvent) => {
        if (event.defaultPrevented || event.ctrlKey || !event.deltaY || (event.target as Element).closest(".mf-calendar-year-editor")) return;
        event.preventDefault();
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
        if (Math.sign(delta) !== Math.sign(wheelDelta.current)) wheelDelta.current = 0;
        wheelDelta.current += delta;
        if (Math.abs(wheelDelta.current) >= 60) { navigate(library.addMonths(month, wheelDelta.current > 0 ? 1 : -1)); wheelDelta.current = 0; }
      };
      element.addEventListener("wheel", wheel, { passive: false });
      return () => element.removeEventListener("wheel", wheel);
    });
    const minimumYear = minimum ? library.getYear(minimum) : 1;
    const maximumYear = maximum ? library.getYear(maximum) : calendar === "persian" ? 3000 : 9999;
    const formatters = useMemo(() => ({
      formatWeekdayName: (date: Date) => library.format(date, calendar === "persian" && locale === "fa" ? "ccccc" : "cccccc"),
    }), [library, calendar, locale]);
    const common = {
      dir,
      animate: mode === "expressive" && !reducedMotion,
      disableNavigation: disabled,
      locale:
        calendar === "persian"
          ? locale === "fa"
            ? jalaliFa
            : jalaliEn
          : locale === "fa"
            ? faIR
            : enUS,
      numerals: "latn" as const,
      dateLib: library,
      formatters,
      month,
      onMonthChange: navigate,
      startMonth: minimum ? library.startOfMonth(minimum) : undefined,
      endMonth: maximum ? library.startOfMonth(maximum) : undefined,
      disabled: disabled
        ? true
        : [
            ...(minimum ? [{ before: minimum }] : []),
            ...(maximum ? [{ after: maximum }] : []),
          ],
      className: "mf-calendar",
      showOutsideDays,
      components: calendarComponents,
    };
    return (
      <CalendarNavigation.Provider value={{ library, view, openView, monthButton, yearButton, disabled }}>
      <div {...props} ref={node => { container.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} className={cx("mf-calendar-wrap", className)} data-calendar-view={view}
        onKeyDown={event => { props.onKeyDown?.(event); if (event.key === "Escape" && view !== "days") { event.preventDefault(); event.stopPropagation(); closeView(); } }}>
        <AutoHeight className="mf-calendar-size">
        {selection === "single" ? (
          <DayPicker
            {...common}
            mode="single"
            selected={selectedDate}
            onSelect={(date) => set(date ? toDateOnly(date) : undefined)}
          />
        ) : (
          <DayPicker
            {...common}
            mode="range"
            selected={selectedRange}
            onSelect={(next, clicked) => {
              if (range?.from && toDateOnly(clicked) < range.from) {
                onRangeChange?.({ from: toDateOnly(clicked), to: undefined });
              } else onRangeChange?.({
                from: next?.from ? toDateOnly(next.from) : undefined,
                to: next?.to ? toDateOnly(next.to) : undefined,
              });
            }}
          />
        )}
        {view === "months" && <div className="mf-calendar-month-grid" role="group" aria-label={locale === "fa" ? "انتخاب ماه" : "Choose month"}>
          {Array.from({ length: 12 }, (_, i) => {
            const date = library.startOfMonth(library.setMonth(month, i));
            const unavailable = !!((minimum && library.endOfMonth(date) < minimum) || (maximum && date > maximum));
            return <button type="button" key={i} className={cx("mf-button mf-scale--sm mf-calendar-month", library.getMonth(month) === i ? "mf-button--filled mf-variant--primary" : "mf-variant--ghost")} aria-label={`${library.format(date, "LLLL")}, ${localizeDigits(String(i + 1), locale)}`} disabled={disabled || unavailable} aria-pressed={library.getMonth(month) === i} onClick={() => { navigate(date); closeView(); }}>
              <span>{library.format(date, "LLLL")}<small>{new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(i + 1)}</small></span>
            </button>;
          })}
        </div>}
        {view === "year" && <CalendarYearEditor year={library.getYear(month)} min={minimumYear} max={maximumYear} disabled={disabled} locale={locale}
          onApply={year => { navigate(library.setYear(month, year)); closeView(); }} />}
        </AutoHeight>
      </div>
      </CalendarNavigation.Provider>
    );
  },
);
export interface DatePickerProps extends FieldAppearanceProps {
  label: string;
  value?: DateOnly;
  defaultValue?: DateOnly;
  onValueChange?: (value: DateOnly | undefined) => void;
  calendar?: CalendarSystem;
  min?: DateOnly;
  max?: DateOnly;
  disabled?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
}
const PickerCalendar = memo(Calendar);
const emptyDateMask = "----/--/--";
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(rawProps, ref) {
    const { label, value, defaultValue, onValueChange, calendar: givenCalendar, min, max, disabled, hint, error, className } =
      useAppearanceProps({ ...rawProps, variant: "outline" });
    const [selected, set] = useControllable<DateOnly | undefined>(value, defaultValue, onValueChange);
    const [open, setOpen] = useState(false);
    const { locale } = useMaterialFluid();
    const calendar = givenCalendar ?? (locale === "fa" ? "persian" : "gregorian");
    const library = useMemo(() => createCalendarLibrary(calendar, locale), [calendar, locale]);
    const trigger = useRef<HTMLButtonElement | null>(null);
    const id = useId();
    const latestSet = useLatest(set);
    const chooseDate = useCallback((date: DateOnly | undefined) => { latestSet.current(date); setOpen(false); }, [latestSet]);
    const selectedDate = parseDateOnly(selected);
    const displayed = selectedDate ? library.format(selectedDate, "yyyy/MM/dd") : "";
    return <FormField label={label} htmlFor={id} hint={hint} error={error} descriptionId={`${id}-help`} className={cx(className, "mf-choice-field mf-date-field")}>
      <Pop.Root open={open} onOpenChange={setOpen}>
        <Pop.Trigger ref={node => { trigger.current = node; setRef(ref, node); }} id={id} disabled={disabled} className="mf-select-trigger"
          aria-invalid={!!error || undefined} aria-describedby={hint || error ? `${id}-help` : undefined}
          onKeyDown={event => { if (event.key === "ArrowDown" && !disabled) { event.preventDefault(); setOpen(true); } }}>
          <span className="mf-trigger-value" dir="ltr">{displayed || emptyDateMask}</span>
          <FieldTriggerIcon />
        </Pop.Trigger>
      <Portal className={className}>
        <Pop.Content aria-label={label} className="mf-floating mf-date-popover" sideOffset={8} align="start"
          onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}>
          <PickerCalendar showOutsideDays={false} key={`${calendar}-${selected?.slice(0, 7) ?? "empty"}`} calendar={calendar} min={min} max={max} disabled={disabled} value={selected} onValueChange={chooseDate} />
        </Pop.Content>
      </Portal>
      </Pop.Root>
    </FormField>;
  },
);
export interface DateRangePickerProps extends Omit<
  DatePickerProps,
  "value" | "defaultValue" | "onValueChange"
> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
}
export const DateRangePicker = forwardRef<
  HTMLButtonElement,
  DateRangePickerProps
>(function DateRangePicker(rawProps, ref) {
  const {
    label,
    value,
    defaultValue = {},
    onValueChange,
    calendar: givenCalendar,
    min,
    max,
    disabled,
    hint,
    error,
    className,
  } = useAppearanceProps({ ...rawProps, variant: "outline" });

  const [range, set] = useControllable(value, defaultValue, onValueChange);
  const { locale } = useMaterialFluid();
  const calendar = givenCalendar ?? (locale === "fa" ? "persian" : "gregorian");
  const library = useMemo(() => createCalendarLibrary(calendar, locale), [calendar, locale]);
  const rangeDate = (value?: DateOnly) => {
    const date = parseDateOnly(value);
    return date ? localizeDigits(library.format(date, "yyyy/MM/dd"), locale) : emptyDateMask;
  };
  const id = useId();
  return (
    <FormField
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      descriptionId={`${id}-help`}
      className={className}
    >
      <Pop.Root>
        <Pop.Trigger
          ref={ref}
          id={id}
          disabled={disabled}
          className="mf-select-trigger"
          aria-invalid={!!error || undefined}
          aria-describedby={hint || error ? `${id}-help` : undefined}
        >
          <span className="mf-trigger-value" dir="ltr">{`${rangeDate(range.from)} - ${rangeDate(range.to)}`}</span>
          <FieldTriggerIcon />
        </Pop.Trigger>
        <Portal className={className}>
          <Pop.Content
            aria-label={label} className="mf-floating mf-date-popover"
            sideOffset={8}
            align="start"
          >
            <Calendar
              showOutsideDays={false}
              calendar={calendar}
              min={min}
              max={max}
              selection="range"
              range={range}
              onRangeChange={set}
            />
          </Pop.Content>
        </Portal>
      </Pop.Root>
    </FormField>
  );
});
export interface TimePickerProps extends TextFieldProps { hourFormat?: 12 | 24; }
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  function TimePicker({ hourFormat = 24, ...props }, ref) {
    const [internal, setInternal] = useState(String(props.defaultValue ?? ""));
    const value = props.value === undefined ? internal : String(props.value ?? "");
    const [open, setOpen] = useState(false);
    const [hours, setHours] = useState("00");
    const [period, setPeriod] = useState("AM");
    const [minutes, setMinutes] = useState("00");
    const [seconds, setSeconds] = useState("00");
    const input = useRef<HTMLInputElement | null>(null);
    const anchor = useRef<HTMLDivElement | null>(null);
    const panelId = useId();
    const { locale } = useMaterialFluid();
    const t = (en: string, fa: string) => locale === "fa" ? fa : en;
    const hasSeconds = value.split(":").length > 2 || props.step === "any" || (props.step !== undefined && Number(props.step) % 60 !== 0);
    const timeValue = (text: string) => text.split(":").reduce((total, part, index) => total + Number(part) * (index === 0 ? 3600 : index === 1 ? 60 : 1), 0);
    const canonicalHour = hourFormat === 12 ? Number(hours) % 12 + (period === "PM" ? 12 : 0) : Number(hours);
    const displayValue = value ? `${hourFormat === 12 ? String(Number(value.split(":")[0]) % 12 || 12).padStart(2, "0") : value.split(":")[0]}:${value.split(":").slice(1).join(":")}${hourFormat === 12 ? Number(value.split(":")[0]) >= 12 ? " PM" : " AM" : ""}` : "";
    const candidate = `${String(canonicalHour).padStart(2, "0")}:${minutes.padStart(2, "0")}${hasSeconds ? `:${seconds.padStart(2, "0")}` : ""}`;
    const valid = /^\d{2}:\d{2}(?::\d{2})?$/.test(candidate) && hours !== "" && minutes !== "" && (hourFormat === 12 ? Number(hours) >= 1 && Number(hours) <= 12 : Number(hours) >= 0 && Number(hours) < 24) && Number(minutes) < 60 && (!hasSeconds || (seconds !== "" && Number(seconds) < 60))
      && (!props.min || timeValue(candidate) >= timeValue(String(props.min))) && (!props.max || timeValue(candidate) <= timeValue(String(props.max)))
      && (props.step === "any" || (timeValue(candidate) - timeValue(String(props.min ?? "00:00"))) % Number(props.step ?? 60) === 0);
    const changeOpen = (next: boolean) => {
      if (next && (props.disabled || props.readOnly)) return;
      if (next) {
        const parts = (value || "00:00").split(":");
        setPeriod(Number(parts[0]) >= 12 ? "PM" : "AM");
        setHours(hourFormat === 12 ? String(Number(parts[0]) % 12 || 12).padStart(2, "0") : parts[0] ?? "00"); setMinutes(parts[1] ?? "00"); setSeconds(parts[2] ?? "00");
      }
      setOpen(next);
    };
    const apply = () => {
      if (!valid || !input.current || props.disabled || props.readOnly) return;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input.current, candidate);
      input.current.dispatchEvent(new Event("input", { bubbles: true }));
      setOpen(false);
    };
    return <Pop.Root open={open} onOpenChange={changeOpen}>
      <Pop.Anchor virtualRef={anchor} /><div>
        <TextField {...props} controlRef={anchor} className={cx(props.className, "mf-time-field mf-choice-field")} ref={node => { input.current = node; setRef(ref, node); }} type="time" value={value} defaultValue={undefined}
          valueOverlay={<span className="mf-time-display">{localizeDigits(displayValue, locale)}</span>} valueOverlayActive={!!value}
          aria-haspopup="dialog" aria-expanded={open} aria-controls={panelId}
          onChange={event => { setInternal(event.currentTarget.value); props.onChange?.(event); }}
          onClick={event => { props.onClick?.(event); if (!event.defaultPrevented && !props.disabled && !props.readOnly) { event.preventDefault(); changeOpen(true); } }}
          onKeyDown={event => { props.onKeyDown?.(event); if (!event.defaultPrevented && ["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); changeOpen(true); } }}
          trailing={<IconButton variant="ghost" size="sm" label={t("Choose time", "انتخاب زمان")} disabled={props.disabled || props.readOnly} onClick={() => changeOpen(!open)}><AnimatedIcon name="chevron-down" size={28} /></IconButton>} />
      </div>
      <Portal className={props.className}>
        <Pop.Content id={panelId} role="dialog" aria-label={t("Set time", "تنظیم زمان")} className="mf-floating mf-time-popover" sideOffset={8} align="start"
          onInteractOutside={event => { if (anchor.current?.contains(event.target as Node)) event.preventDefault(); }}
          onCloseAutoFocus={event => { event.preventDefault(); input.current?.focus(); }}>
          <div className="mf-time-goal-grid" data-seconds={hasSeconds || undefined} dir="ltr">
            <NumberField presentation="goal" label={t("Hours", "ساعت")} value={hours} min={hourFormat === 12 ? 1 : 0} max={hourFormat === 12 ? 12 : 23} onChange={event => { const next = event.currentTarget.value; if (next === "" || (/^\d{1,2}$/.test(next) && Number(next) <= (hourFormat === 12 ? 12 : 23) && (hourFormat !== 12 || Number(next) >= 1))) setHours(next); else event.currentTarget.value = hours; }} />
            <span className="mf-time-separator" aria-hidden="true">:</span>
            <NumberField presentation="goal" label={t("Minutes", "دقیقه")} value={minutes} min={0} max={59} step={!hasSeconds && props.step !== "any" ? Math.max(1, Number(props.step ?? 60) / 60) : 1} onChange={event => { const next = event.currentTarget.value; if (next === "" || (/^\d{1,2}$/.test(next) && Number(next) <= 59)) setMinutes(next); else event.currentTarget.value = minutes; }} />
            {hasSeconds && <><span className="mf-time-separator" aria-hidden="true">:</span><NumberField presentation="goal" label={t("Seconds", "ثانیه")} value={seconds} min={0} max={59} step={props.step === "any" ? 1 : Math.max(1, Number(props.step ?? 1) % 60)} onChange={event => { const next = event.currentTarget.value; if (next === "" || (/^\d{1,2}$/.test(next) && Number(next) <= 59)) setSeconds(next); else event.currentTarget.value = seconds; }} /></>}
          </div>
          {hourFormat === 12 && <ToggleGroup className="mf-time-period" label={t("Period", "بازه زمانی")} value={period} onValueChange={setPeriod} options={[{ value: "AM", label: "AM" }, { value: "PM", label: "PM" }]} />}
          <div className="mf-time-actions"><Button variant="ghost" size="sm" onClick={() => setOpen(false)}>{t("Cancel", "انصراف")}</Button><Button variant="primary" size="sm" disabled={!valid || props.disabled || props.readOnly} onClick={apply}>{t("Apply time", "تأیید زمان")}</Button></div>
        </Pop.Content>
      </Portal>
    </Pop.Root>;
  },
);
