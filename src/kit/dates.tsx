import { AnimatePresence, motion } from "motion/react";
import { useAppearanceProps, type AppearanceProps } from "./appearance";
import {
  forwardRef,
  memo,
  useCallback,
  useLayoutEffect,
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
  DayPicker as PersianDayPicker,
  getDateLib as getPersianDateLib,
  faIR as jalaliFa,
  enUS as jalaliEn,
} from "react-day-picker/persian";
import { enUS, faIR } from "react-day-picker/locale";
import * as Pop from "@radix-ui/react-popover";
import { useMaterialFluid } from "./provider";
import { useControllable, useLatest, cx, setRef } from "./utils";
import { FormField, TextField, NumberField, type TextFieldProps } from "./forms";
import { AnimatedIcon } from "./icons";
import { AutoHeight } from "./auto-height";
import { Button, IconButton, ToggleGroup } from "./controls";
import { Portal } from "./portal";
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
    const Component = calendar === "persian" ? PersianDayPicker : DayPicker;
    const selectedDate = parseDateOnly(selected);
    const selectedRange = {
      from: parseDateOnly(range?.from),
      to: parseDateOnly(range?.to),
    };
    const minimum = parseDateOnly(min),
      maximum = parseDateOnly(max);
    const library = useMemo(() => calendar === "persian"
      ? getPersianDateLib({ locale: locale === "fa" ? jalaliFa : jalaliEn, numerals: locale === "fa" ? "arabext" : "latn" })
      : new DateLib({ locale: locale === "fa" ? faIR : enUS, numerals: locale === "fa" ? "arabext" : "latn" }), [calendar, locale]);
    const [month, setMonth] = useState(() => library.startOfMonth(selectedDate ?? selectedRange.from ?? new Date()));
    const [view, setView] = useState<CalendarView>("days");
    const container = useRef<HTMLDivElement | null>(null);
    const monthButton = useRef<HTMLButtonElement | null>(null);
    const yearButton = useRef<HTMLButtonElement | null>(null);
    const wheelDelta = useRef(0);
    useEffect(() => { setMonth(current => library.startOfMonth(current)); setView("days"); }, [library]);
    const navigate = (date: Date) => {
      let next = library.startOfMonth(date);
      if (minimum && next < library.startOfMonth(minimum)) next = library.startOfMonth(minimum);
      if (maximum && next > library.startOfMonth(maximum)) next = library.startOfMonth(maximum);
      setMonth(next);
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
      numerals: locale === "fa" ? ("arabext" as const) : ("latn" as const),
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
      components: {
        MonthCaption: CalendarCaption,
        PreviousMonthButton: CalendarNavButton,
        NextMonthButton: CalendarNavButton,
        Chevron: ({
          orientation = "left",
        }: {
          orientation?: "up" | "down" | "left" | "right";
        }) => (
          <AnimatedIcon
            name={`chevron-${orientation}`}
            size={20}
            animated={false}
          />
        ),
      },
    };
    return (
      <CalendarNavigation.Provider value={{ library, view, openView, monthButton, yearButton, disabled }}>
      <div {...props} ref={node => { container.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} className={cx("mf-calendar-wrap", className)} data-calendar-view={view}
        onKeyDown={event => { props.onKeyDown?.(event); if (event.key === "Escape" && view !== "days") { event.preventDefault(); event.stopPropagation(); closeView(); } }}>
        <AutoHeight className="mf-calendar-size">
        {selection === "single" ? (
          <Component
            {...common}
            mode="single"
            selected={selectedDate}
            onSelect={(date) => set(date ? toDateOnly(date) : undefined)}
          />
        ) : (
          <Component
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
            return <button type="button" key={i} className={cx("mf-button mf-scale--sm mf-calendar-month", library.getMonth(month) === i ? "mf-button--filled mf-variant--primary" : "mf-variant--ghost")} aria-label={`${library.format(date, "LLLL")}, ${i + 1}`} disabled={disabled || unavailable} aria-pressed={library.getMonth(month) === i} onClick={() => { navigate(date); closeView(); }}>
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
export interface DatePickerProps extends Omit<AppearanceProps, "variant"> {
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
const datePositions = [0, 1, 2, 3, 5, 6, 8, 9];
const emptyDateMask = "----/--/--";
function latinDigits(value: string) { return value.replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632)); }
function dateMask(value: string) {
  const normalized = latinDigits(value);
  if (/^[\d-]{4}\/[\d-]{2}\/[\d-]{2}$/.test(normalized)) return normalized;
  const complete = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(normalized);
  if (complete) return `${complete[1]}/${complete[2].padStart(2, "0")}/${complete[3].padStart(2, "0")}`;
  const digits = normalized.replace(/\D/g, "").slice(0, 8);
  const characters = emptyDateMask.split("");
  datePositions.forEach((position, index) => { if (digits[index]) characters[position] = digits[index]; });
  return characters.join("");
}
function DateDigits({ value }: { value: string }) {
  const { motion: mode, reducedMotion } = useMaterialFluid();
  const animated = mode === "expressive" && !reducedMotion;
  return <span className="mf-date-digits" aria-hidden="true">{Array.from(value).map((character, index) => character === "/" ? <span key={index}>/</span> :
    <span className="mf-date-digit" key={index}>{animated ? <AnimatePresence initial={false}>
      <motion.span key={character} initial={{ y: "-100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ duration: .14, ease: [.2, .65, .3, 1] }}>{character}</motion.span>
    </AnimatePresence> : <span>{character}</span>}</span>)}</span>;
}
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(rawProps, ref) {
    const { label, value, defaultValue, onValueChange, calendar: givenCalendar, min, max, disabled, hint, error, className } =
      useAppearanceProps({ ...rawProps, variant: "outline" });
    const [selected, set] = useControllable<DateOnly | undefined>(value, defaultValue, onValueChange);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<string | null>(null);
    const [invalid, setInvalid] = useState(false);
    const { locale } = useMaterialFluid();
    const calendar = givenCalendar ?? (locale === "fa" ? "persian" : "gregorian");
    const library = useMemo(() => calendar === "persian"
      ? getPersianDateLib({ locale: locale === "fa" ? jalaliFa : jalaliEn, numerals: locale === "fa" ? "arabext" : "latn" })
      : new DateLib({ locale: locale === "fa" ? faIR : enUS, numerals: locale === "fa" ? "arabext" : "latn" }), [calendar, locale]);
    const anchor = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement | null>(null);
    const latestSet = useLatest(set);
    const chooseDate = useCallback((date: DateOnly | undefined) => { latestSet.current(date); setDraft(null); setInvalid(false); setOpen(false); }, [latestSet]);
    const pendingCaret = useRef<number | null>(null);
    useLayoutEffect(() => { if (pendingCaret.current !== null) { input.current?.setSelectionRange(pendingCaret.current, pendingCaret.current); pendingCaret.current = null; } }, [draft]);
    const selectedDate = parseDateOnly(selected);
    const formatted = selectedDate ? library.format(selectedDate, "yyyy/MM/dd") : "";
    const displayed = draft ?? (formatted ? latinDigits(formatted) : "");
    const edit = (next: string, caret: number) => { pendingCaret.current = caret; setDraft(next); setInvalid(false); input.current?.setSelectionRange(caret, caret); };
    const parse = (text: string) => {
      const normalized = text.replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632));
      const match = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(normalized);
      if (!match) return;
      const [, year, month, day] = match.map(Number);
      if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return;
      const date = library.newDate(year, month - 1, day);
      if (library.getYear(date) !== year || library.getMonth(date) !== month - 1 || library.differenceInCalendarDays(date, library.startOfMonth(date)) + 1 !== day) return;
      const result = toDateOnly(date);
      if ((min && result < min) || (max && result > max)) return;
      return result;
    };
    const commit = () => {
      if (draft === null) return;
      if (!/\d/.test(draft)) { set(undefined); setDraft(null); setInvalid(false); return; }
      const date = parse(draft);
      if (date) { set(date); setDraft(null); setInvalid(false); }
      else setInvalid(true);
    };
    return <Pop.Root open={open} onOpenChange={setOpen}>
      <Pop.Anchor virtualRef={anchor} /><div>
        <TextField controlRef={anchor} ref={node => { input.current = node; setRef(ref, node); }} label={label} disabled={disabled} hint={hint} className={cx(className, "mf-choice-field mf-date-field")}
          error={error || (invalid ? (locale === "fa" ? "یک تاریخ معتبر به صورت سال/ماه/روز وارد کنید." : "Enter a valid date as YYYY/MM/DD.") : undefined)}
          inputMode="numeric" dir="ltr" placeholder={emptyDateMask} value={displayed}
          valueOverlay={<DateDigits value={displayed || emptyDateMask} />} valueOverlayActive
          aria-haspopup="dialog" aria-expanded={open}
          onChange={event => { const next = dateMask(event.currentTarget.value); edit(next, next.indexOf("-") >= 0 ? next.indexOf("-") : 10); }}
          onPaste={event => { event.preventDefault(); const next = dateMask(event.clipboardData.getData("text")); edit(next, next.indexOf("-") >= 0 ? next.indexOf("-") : 10); }}
          onBlur={commit}
          onKeyDown={event => {
            const digit = latinDigits(event.key);
            if (!event.ctrlKey && !event.metaKey && !event.altKey && (/^\d$/.test(digit) || event.key === "Backspace" || event.key === "Delete")) {
              event.preventDefault();
              const start = event.currentTarget.selectionStart ?? 0, end = event.currentTarget.selectionEnd ?? start;
              const characters = (displayed || emptyDateMask).split("");
              if (end > start) datePositions.filter(position => position >= start && position < end).forEach(position => { characters[position] = "-"; });
              if (/^\d$/.test(digit)) {
                const position = datePositions.find(position => position >= start);
                if (position !== undefined) { characters[position] = digit; edit(characters.join(""), datePositions.find(next => next > position) ?? 10); }
              } else {
                const position = end > start ? start : event.key === "Backspace" ? [...datePositions].reverse().find(position => position < start) : datePositions.find(position => position >= start);
                if (position !== undefined && datePositions.includes(position)) characters[position] = "-";
                edit(characters.join(""), position ?? 0);
              }
              return;
            }
            if (event.key === "Enter") { event.preventDefault(); commit(); }
            if (event.key === "ArrowDown" && !disabled) { event.preventDefault(); commit(); setOpen(true); }
            if (event.key === "Escape") { setDraft(null); setInvalid(false); setOpen(false); }
          }}
          trailing={<IconButton label={locale === "fa" ? "انتخاب تاریخ" : "Choose date"} variant="ghost" size="sm" disabled={disabled} aria-expanded={open} aria-haspopup="dialog" onClick={() => { commit(); setOpen(value => !value); }}><AnimatedIcon name="chevron-down" size={16} /></IconButton>}
        />
      </div>
      <Portal className={className}>
        <Pop.Content aria-label={label} className="mf-floating mf-date-popover" sideOffset={8} align="start"
          onInteractOutside={event => { if (anchor.current?.contains(event.target as Node)) event.preventDefault(); }}
          onCloseAutoFocus={event => { event.preventDefault(); input.current?.focus(); }}>
          <PickerCalendar showOutsideDays={false} key={`${calendar}-${selected?.slice(0, 7) ?? "empty"}`} calendar={calendar} min={min} max={max} disabled={disabled} value={selected} onValueChange={chooseDate} />
        </Pop.Content>
      </Portal>
    </Pop.Root>;
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
          <span className="mf-trigger-value">{range.from
            ? `${formatDateOnly(range.from, locale, calendar)} – ${range.to ? formatDateOnly(range.to, locale, calendar) : "…"}`
            : locale === "fa"
              ? "انتخاب بازه"
              : "Choose a range"}</span>
          <span className="mf-field-adornment"><AnimatedIcon name="chevron-down" size={16} /></span>
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
          valueOverlay={<span className="mf-time-display">{displayValue}</span>} valueOverlayActive={!!value}
          aria-haspopup="dialog" aria-expanded={open} aria-controls={panelId}
          onChange={event => { setInternal(event.currentTarget.value); props.onChange?.(event); }}
          onClick={event => { props.onClick?.(event); if (!event.defaultPrevented && !props.disabled && !props.readOnly) { event.preventDefault(); changeOpen(true); } }}
          onKeyDown={event => { props.onKeyDown?.(event); if (!event.defaultPrevented && ["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); changeOpen(true); } }}
          trailing={<IconButton variant="ghost" size="sm" label={t("Choose time", "انتخاب زمان")} disabled={props.disabled || props.readOnly} onClick={() => changeOpen(!open)}><AnimatedIcon name="chevron-down" size={16} /></IconButton>} />
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
