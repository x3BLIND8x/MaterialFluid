import { useAppearanceProps, useComponentAppearance, ComponentAppearanceProvider, type AppearanceProps } from "./appearance";
import {
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useSpring, useMotionTemplate, useMotionValueEvent } from "motion/react";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { AnimatedIcon } from "./icons";
import { ButtonGroup, IconButton, type ChoiceOption } from "./controls";
import { cx, useControllable, setRef } from "./utils";
import { useMaterialFluid } from "./provider";
import { AutoHeight } from "./auto-height";
import { RollingNumber } from "./rolling-number";
import { localizeDigits } from "./numerals";
import { Portal } from "./portal";
import { FieldTriggerIcon } from "./field-trigger-icon";
import { OptionsExpansionBody, useOptionsExpansion } from "./options-expansion";

function useFieldPadding() {
  const [focused, setFocused] = useState(false);
  const { motion: mode, reducedMotion } = useMaterialFluid();
  const inset = useSpring(0, { stiffness: 420, damping: 28, mass: .8 });
  useEffect(() => {
    if (mode === "expressive" && !reducedMotion) inset.set(focused ? 8 : 0);
    else inset.jump(focused ? 8 : 0);
  }, [focused, inset, mode, reducedMotion]);
  const paddingInline = useMotionTemplate`calc(var(--mf-field-inset, 12px) + ${inset}px)`;
  const textPadding = useMotionTemplate`${inset}px`;
  return { setFocused, paddingInline, textPadding };
}
export type FieldAppearanceProps = Omit<AppearanceProps, "variant" | "labelPosition"> & {
  labelPosition?: "top" | "start";
};
export interface FormFieldProps
  extends HTMLAttributes<HTMLDivElement>, FieldAppearanceProps {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  descriptionId?: string;
  counter?: ReactNode;
}
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField(rawProps, ref) {
    const defaults = useComponentAppearance();
    const classPosition = rawProps.className?.match(/\bmf-label--(top|bottom|start|end)\b/)?.[1];
    const requestedPosition = rawProps.labelPosition ?? classPosition ?? defaults.labelPosition;
    const {
      label,
      htmlFor,
      hint,
      error,
      required,
      descriptionId,
      counter,
      children,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, labelPosition: requestedPosition === "start" ? "start" : "top", variant: "outline" });

    const element = useRef<HTMLDivElement | null>(null);
    const subtitle = useRef<HTMLDivElement | null>(null);
    const { setFocused, textPadding } = useFieldPadding();
    const { motion: mode, reducedMotion } = useMaterialFluid();
    useMotionValueEvent(textPadding, "change", value => element.current?.style.setProperty("--mf-field-focus-inset", value));
    const wobble = () => {
      if (mode !== "expressive" || reducedMotion) return;
      subtitle.current?.getAnimations?.().forEach(animation => animation.cancel());
      subtitle.current?.animate?.([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(-2px)" }, { transform: "translateX(0)" }], { duration: 320, easing: "ease-out" });
    };
    useEffect(() => { if (error) wobble(); }, [error, mode, reducedMotion]);
    return (
      <div
        {...props}
        ref={node => { element.current = node; setRef(ref, node); }}
        onFocusCapture={event => { props.onFocusCapture?.(event); setFocused(true); }}
        onBlurCapture={event => { props.onBlurCapture?.(event); if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); if (error) wobble(); } }}
        onInvalidCapture={event => { props.onInvalidCapture?.(event); wobble(); }}
        className={cx("mf-field", error && "mf-field--invalid", className)}
      >
        <label htmlFor={htmlFor} className="mf-field-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {children}
        {(hint || error || counter) && (
          <div className="mf-field-footer">
          {(hint || error) && <div
            ref={subtitle}
            id={descriptionId}
            className="mf-field-hint"
            role={error ? "alert" : undefined}
          >
            {error || hint}
          </div>}
          {counter}
          </div>
        )}
      </div>
    );
  },
);
function useCharacterCount(value: InputHTMLAttributes<HTMLInputElement>["value"], defaultValue: InputHTMLAttributes<HTMLInputElement>["defaultValue"]) {
  const element = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [uncontrolledCount, setCount] = useState(String(defaultValue ?? "").length);
  useEffect(() => {
    const form = element.current?.form;
    if (!form) return;
    const reset = () => queueMicrotask(() => { if (element.current) setCount(element.current.value.length); });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, []);
  return { element, count: value !== undefined ? String(value).length : uncontrolledCount, setCount };
}
function CharacterCounter({ count, limit, id }: { count: number; limit?: number; id: string }) {
  const { locale } = useMaterialFluid();
  return <span id={id} className="mf-character-count" data-limit-reached={limit !== undefined && count >= limit || undefined}
    aria-label={locale === "fa" ? `${count}${limit !== undefined ? ` از ${limit}` : ""} نویسه` : `${count}${limit !== undefined ? ` of ${limit}` : ""} characters`}>
    <span dir="ltr"><RollingNumber value={count} />{limit !== undefined && <> / {limit}</>}</span>
  </span>;
}
export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, FieldAppearanceProps {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Show a character counter; defaults to true when maxLength is provided. */
  showCount?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** @internal Reference to the visible control for anchored popovers. */
  controlRef?: Ref<HTMLDivElement>;
  /** @internal Presentation overlay for native numeric inputs. */
  valueOverlay?: ReactNode;
  /** @internal Whether the numeric overlay replaces the native text paint. */
  valueOverlayActive?: boolean;
}
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(rawProps, ref) {
    const {
      label,
      hint,
      error,
      leading,
      trailing,
      controlRef,
      valueOverlay,
      valueOverlayActive,
      showCount,
      className,
      id: givenId,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const generated = useId();
    const id = givenId ?? generated;
    const { element, count, setCount } = useCharacterCount(props.value, props.defaultValue);
    const counted = showCount ?? (props.maxLength !== undefined && props.maxLength >= 0);
    return (
      <FormField
        label={label}
        htmlFor={id}
        required={props.required}
        hint={hint}
        error={error}
        counter={counted ? <CharacterCounter id={`${id}-count`} count={count} limit={props.maxLength} /> : undefined}
        descriptionId={`${id}-help`}
        className={className}
      >
        <div className="mf-input-wrap" ref={controlRef}>
          <ComponentAppearanceProvider variant="ghost" size="sm">{leading}</ComponentAppearanceProvider>
          <span className="mf-input-value-wrap" data-overlay-active={valueOverlayActive || undefined}>
            <input
              {...props}
              id={id}
              ref={node => { element.current = node; setRef(ref, node); }}
              onChange={event => { setCount(event.currentTarget.value.length); props.onChange?.(event); }}
              className="mf-input"
              aria-invalid={!!error || props["aria-invalid"] || undefined}
              aria-describedby={cx(props["aria-describedby"], (hint || error) && `${id}-help`, counted && `${id}-count`) || undefined}
            />
            {valueOverlay && <span className="mf-number-value" aria-hidden="true">{valueOverlay}</span>}
          </span>
          <ComponentAppearanceProvider variant="ghost" size="sm">{trailing}</ComponentAppearanceProvider>
        </div>
      </FormField>
    );
  },
);
export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldAppearanceProps {
  label: string;
  showCount?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(rawProps, ref) {
    const { setFocused, paddingInline } = useFieldPadding();
    const textarea = useRef<HTMLTextAreaElement | null>(null);
    useMotionValueEvent(paddingInline, "change", value => {
      if (textarea.current) textarea.current.style.paddingInline = value;
    });
    const {
      label,
      hint,
      error,
      className,
      showCount,
      id: givenId,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const generated = useId();
    const id = givenId ?? generated;
    const { element, count, setCount } = useCharacterCount(props.value, props.defaultValue);
    const counted = showCount ?? (props.maxLength !== undefined && props.maxLength >= 0);
    return (
      <FormField
        label={label}
        htmlFor={id}
        hint={hint}
        error={error}
        counter={counted ? <CharacterCounter id={`${id}-count`} count={count} limit={props.maxLength} /> : undefined}
        required={props.required}
        descriptionId={`${id}-help`}
        className={className}
      >
        <textarea
          {...props}
          rows={props.rows ?? 3}
          id={id}
          ref={node => { textarea.current = node; element.current = node; setRef(ref, node); }}
          className="mf-input mf-textarea"
          style={{ paddingInline: paddingInline.get(), ...props.style }}
          onChange={event => { setCount(event.currentTarget.value.length); props.onChange?.(event); }}
          onFocus={event => { props.onFocus?.(event); setFocused(true); }}
          onBlur={event => { props.onBlur?.(event); setFocused(false); }}
          aria-invalid={!!error || undefined}
          aria-describedby={
            cx(props["aria-describedby"], (hint || error) && `${id}-help`, counted && `${id}-count`) || undefined
          }
        />
      </FormField>
    );
  },
);
export const PasswordField = forwardRef<HTMLInputElement, TextFieldProps>(
  function PasswordField(props, ref) {
    const [visible, set] = useState(false);
    const { locale } = useMaterialFluid();
    return (
      <TextField
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        trailing={
          <IconButton variant="ghost" size="sm"
            label={
              locale === "fa"
                ? visible
                  ? "پنهان کردن رمز"
                  : "نمایش رمز"
                : visible
                  ? "Hide password"
                  : "Show password"
            }
            aria-pressed={visible}
            disabled={props.disabled}
            onClick={() => set(!visible)}
          >
            <AnimatedIcon name={visible ? "eye-off" : "eye"} active={visible} size={16} animated />
          </IconButton>
        }
      />
    );
  },
);
export type NumberFieldProps = Omit<TextFieldProps, "labelPosition"> & {
  unit?: ReactNode;
} & (
  | { presentation?: "standard"; labelPosition?: "top" | "start" }
  | { presentation: "goal"; labelPosition?: "top" }
);
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField({ presentation = "standard", unit, ...props }, ref) {
    const input = useRef<HTMLInputElement | null>(null);
    const stepping = useRef(false);
    const { locale } = useMaterialFluid();
    const [current, setCurrent] = useState(String(props.defaultValue ?? ""));
    const [editing, setEditing] = useState(false);
    const value = props.value === undefined ? current : String(props.value ?? "");
    const valid = value.trim() !== "" && Number.isFinite(Number(value));
    const step = (direction: number) => {
      const element = input.current;
      if (!element || props.disabled || props.readOnly) return;
      const before = element.value;
      if (props.step === "any") {
        const next = Math.max(Number(props.min ?? -Infinity), Math.min(Number(props.max ?? Infinity), (Number(element.value) || 0) + direction));
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(element, String(next));
      } else if (direction > 0) element.stepUp();
      else element.stepDown();
      if (element.value === before) return;
      const nextValue = element.value;
      // Restore the tracked value, then use the native setter so React sees one change.
      element.value = before;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(element, nextValue);
      setEditing(false);
      stepping.current = true;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      stepping.current = false;
    };
    const wheelDelta = useRef(0);
    useEffect(() => {
      const element = input.current;
      if (!element || props.disabled || props.readOnly) return;
      const wheel = (event: WheelEvent) => {
        if (event.ctrlKey || !event.deltaY) return;
        event.preventDefault();
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
        if (Math.sign(delta) !== Math.sign(wheelDelta.current)) wheelDelta.current = 0;
        wheelDelta.current += delta;
        if (Math.abs(wheelDelta.current) >= 40) {
          step(wheelDelta.current > 0 ? -1 : 1);
          wheelDelta.current = 0;
        }
      };
      const surface = element.closest(".mf-input-wrap") ?? element;
      surface.addEventListener("wheel", wheel as EventListener, { passive: false });
      return () => surface.removeEventListener("wheel", wheel as EventListener);
    });
    return <TextField {...props} labelPosition={presentation === "goal" ? "top" : props.labelPosition} className={cx(props.className, presentation === "goal" && "mf-number-field--goal")} ref={node => { input.current = node; setRef(ref, node); }} type="number" inputMode="decimal"
      placeholder={props.placeholder === undefined ? undefined : localizeDigits(props.placeholder, locale)}
      valueOverlayActive={valid && (locale === "fa" || !editing)}
      valueOverlay={valid ? <span className="mf-number-value-content" dir="ltr" data-editing={editing || undefined}>{locale === "fa" && editing ? localizeDigits(value, locale) : <RollingNumber value={Number(value)} format={() => localizeDigits(value, locale)} />}</span> : null}
      trailing={<>{props.trailing}{unit && <span className="mf-number-unit">{unit}</span>}<ButtonGroup label={`${typeof props.label === "string" ? props.label : (locale === "fa" ? "مقدار" : "Value")}: ${locale === "fa" ? "تنظیم مقدار" : "Adjust value"}`} className="mf-number-stepper" variant="ghost">
        <IconButton variant="ghost" size="sm" label={locale === "fa" ? "کاهش" : "Decrease"} disabled={props.disabled || props.readOnly || (props.min !== undefined && valid && Number(value) <= Number(props.min))} onPointerDown={event => event.preventDefault()} onClick={() => step(-1)}><AnimatedIcon name="minus" size={16} /></IconButton>
        <IconButton variant="ghost" size="sm" label={locale === "fa" ? "افزایش" : "Increase"} disabled={props.disabled || props.readOnly || (props.max !== undefined && valid && Number(value) >= Number(props.max))} onPointerDown={event => event.preventDefault()} onClick={() => step(1)}><AnimatedIcon name="plus" size={16} /></IconButton>
      </ButtonGroup></>}
      onFocus={event => { setEditing(true); props.onFocus?.(event); }}
      onBlur={event => { setEditing(false); setCurrent(event.currentTarget.value); props.onBlur?.(event); }}
      onPointerDown={event => { setEditing(true); props.onPointerDown?.(event); }}
      onKeyDown={event => {
        props.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          step(event.key === "ArrowUp" ? 1 : -1);
        } else setEditing(true);
      }}
      onChange={event => {
        setCurrent(event.currentTarget.value);
        if (!stepping.current) setEditing(true);
        props.onChange?.(event);
      }} />;
  },
);
export const SearchField = forwardRef<HTMLInputElement, TextFieldProps>(
  function SearchField(props, ref) {
    return (
      <TextField
        {...props}
        ref={ref}
        type="search"
        leading={<AnimatedIcon name="search" />}
      />
    );
  },
);
export interface SelectProps
  extends Omit<SelectPrimitive.SelectProps, "children">, FieldAppearanceProps {
  label: string;
  options: ChoiceOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  error?: string;
}
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(rawProps, ref) {
    const { label, options, placeholder, id: givenId, className, error, value, defaultValue = "", onValueChange, open: givenOpen, defaultOpen = false, onOpenChange, ...props } =
      useAppearanceProps({ ...rawProps, variant: "outline" });
    const [open, setOpen] = useControllable(givenOpen, defaultOpen, onOpenChange);
    const [selected, setSelected] = useControllable(value, defaultValue, onValueChange);
    const generatedId = useId();
    const id = givenId ?? generatedId;
    const { dir, locale } = useMaterialFluid();
    const trigger = useRef<HTMLButtonElement | null>(null);
    const { panel, side: optionsSide } = useOptionsExpansion(open, trigger);
    return (
      <FormField
        label={label}
        htmlFor={id}
        error={error}
        descriptionId={`${id}-help`}
        className={cx("mf-choice-field", className)}
      >
        <SelectPrimitive.Root {...props} open={open} onOpenChange={next => { setOpen(next); }} value={selected} onValueChange={setSelected} dir={dir}>
          <SelectPrimitive.Trigger
            ref={node => { trigger.current = node; setRef(ref, node); }}
            id={id}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? `${id}-help` : undefined}
            className="mf-select-trigger mf-single-select-trigger"
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon><FieldTriggerIcon /></SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <Portal className={className}>
            <SelectPrimitive.Content
              ref={panel}
              position="popper"
              align="start"
              side={optionsSide}
              sideOffset={-1}
              className="mf-select-content mf-options-popup"
            >
              <OptionsExpansionBody><SelectPrimitive.Viewport className="mf-select-viewport mf-options-list">
                {!options.length && <p className="mf-options-empty" role="status">{locale === "fa" ? "گزینه‌ای در دسترس نیست" : "No options available"}</p>}
                {options.map((o) => (
                  <SelectPrimitive.Item
                    key={o.value}
                    value={o.value}
                    disabled={o.disabled}
                    className="mf-select-item"
                  >
                    <SelectPrimitive.ItemText className="mf-select-item-label">
                      {o.label}
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="mf-select-check">
                      <AnimatedIcon name="check" size={16} />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport></OptionsExpansionBody>
            </SelectPrimitive.Content>
          </Portal>
        </SelectPrimitive.Root>
      </FormField>
    );
  },
);
export interface ComboboxProps extends Omit<
  TextFieldProps,
  "value" | "defaultValue" | "onChange"
> {
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  allowCustom?: boolean;
}
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(rawProps, ref) {
    const {
      options,
      value,
      defaultValue = "",
      onValueChange,
      allowCustom = false,
      label,
      disabled,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const anchor = useRef<HTMLDivElement | null>(null);
    const input = useRef<HTMLInputElement | null>(null);
    const [selected, set] = useControllable(value, defaultValue, onValueChange);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const { panel, side: optionsSide } = useOptionsExpansion(open, anchor);
    const [index, setIndex] = useState(0);
    const id = useId();
    const { locale } = useMaterialFluid();
    const results = options.filter((o) =>
      o.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    );
    const custom = allowCustom && (props.maxLength === undefined || query.trim().length <= props.maxLength) && !!query.trim() && !options.some(option => option.label.toLocaleLowerCase() === query.trim().toLocaleLowerCase());
    const enabledIndices = results.flatMap((option, index) => option.disabled ? [] : [index]);
    if (custom) enabledIndices.push(results.length);
    const activeIndex = enabledIndices.includes(index) ? index : (enabledIndices[0] ?? -1);
    const customHelp = allowCustom
      ? (locale === "fa" ? "از فهرست انتخاب کنید یا مقدار دلخواه خود را اضافه کنید." : "Choose an option or add your own value.")
      : (locale === "fa" ? "فقط گزینه‌های فهرست قابل انتخاب هستند." : "Choose from the listed options only.");
    const chooseCustom = () => { if (!custom || disabled || props.readOnly) return; set(query.trim()); setQuery(""); setOpen(false); };
    useEffect(() => {
      if (open) document.getElementById(`${id}-${activeIndex}`)?.scrollIntoView?.({ block: "nearest" });
    }, [open, activeIndex, query, id]);
    const choose = (option: (typeof options)[number]) => {
      if (option.disabled || disabled || props.readOnly) return;
      set(option.value);
      setQuery("");
      setOpen(false);
    };
    const key = (e: KeyboardEvent<HTMLInputElement>) => {
      props.onKeyDown?.(e);
      if (e.defaultPrevented || disabled || props.readOnly) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
        if (enabledIndices.length) {
          const current = enabledIndices.indexOf(activeIndex);
          const next = !open ? (e.key === "ArrowDown" ? 0 : enabledIndices.length - 1)
            : (current + (e.key === "ArrowDown" ? 1 : -1) + enabledIndices.length) % enabledIndices.length;
          setIndex(enabledIndices[next]);
        }
      }
      if (e.key === "Enter" && open) {
        e.preventDefault();
        if (results[activeIndex]) choose(results[activeIndex]);
        else if (custom && activeIndex === results.length) chooseCustom();
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Anchor virtualRef={anchor} />
          <div>
            <TextField
              {...props}
              controlRef={anchor}
              className={cx("mf-choice-field", props.className)}
              ref={node => { input.current = node; setRef(ref, node); }}
              label={label}
              maxLength={allowCustom ? props.maxLength : undefined}
              showCount={allowCustom && (open || !options.some(option => option.value === selected)) ? props.showCount : false}
              hint={<>{props.hint && <>{props.hint}<br /></>}{customHelp}</>}
              disabled={disabled}
              value={
                open
                  ? query
                  : (options.find((o) => o.value === selected)?.label ??
                    selected)
              }
              role="combobox"
              aria-expanded={open}
              aria-controls={`${id}-list`}
              aria-autocomplete="list"
              aria-activedescendant={
                open && activeIndex >= 0 ? `${id}-${activeIndex}` : undefined
              }
              onChange={(e) => {
                setQuery(allowCustom && props.maxLength !== undefined && props.maxLength >= 0 ? e.target.value.slice(0, props.maxLength) : e.target.value);
                setIndex(0);
                setOpen(true);
              }}
              onClick={event => { props.onClick?.(event); if (!disabled && !props.readOnly && !event.defaultPrevented && !open) { setQuery(""); setIndex(0); setOpen(true); } }}
              onFocus={event => {
                props.onFocus?.(event);
                if (!disabled && !props.readOnly) {
                  setQuery("");
                  setOpen(true);
                }
              }}
              onKeyDown={key}
              trailing={<IconButton variant="ghost" size="sm" label={locale === "fa" ? "نمایش پیشنهادها" : "Show suggestions"} aria-expanded={open} disabled={disabled || props.readOnly}
                onPointerDown={event => event.preventDefault()}
                onClick={() => { const next = !open; if (next) { input.current?.focus(); setQuery(""); setIndex(0); } setOpen(next); }}><AnimatedIcon name="chevron-down" size={28} /></IconButton>}
            />
          </div>
        <Portal className={props.className}>
          <PopoverPrimitive.Content
            ref={panel}
            side={optionsSide}
            aria-label={label}
            className="mf-combobox-content mf-options-popup"
            onInteractOutside={event => { if (anchor.current?.contains(event.target as Node)) event.preventDefault(); }}
            align="start"
            sideOffset={-1}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <OptionsExpansionBody><div id={`${id}-list`} role="listbox" aria-label={label} className="mf-options-list">
              {results.length ? (
                results.map((o, i) => (
                  <div
                    key={o.value}
                    id={`${id}-${i}`}
                    role="option"
                    aria-selected={selected === o.value}
                    aria-disabled={o.disabled || undefined}
                    data-highlighted={activeIndex === i || undefined}
                    className="mf-select-item"
                    onPointerMove={() => setIndex(i)}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      choose(o);
                    }}
                  >
                    <span className="mf-select-item-label">{o.label}</span>
                    {selected === o.value && (
                      <AnimatedIcon name="check" size={16} />
                    )}
                  </div>
                ))
              ) : !custom ? (
                <p className="mf-options-empty" role="status">
                  {locale === "fa"
                    ? (query ? "نتیجه‌ای یافت نشد" : "گزینه‌ای در دسترس نیست")
                    : (query ? "No matching options" : "No options available")}
                </p>
              ) : null}
              {custom && <div id={`${id}-${results.length}`} role="option" aria-selected={false} data-highlighted={activeIndex === results.length || undefined} className="mf-select-item"
                onPointerMove={() => setIndex(results.length)} onPointerDown={event => { event.preventDefault(); chooseCustom(); }}>
                <span className="mf-select-item-label">{locale === "fa" ? `افزودن «${query.trim()}»` : `Add “${query.trim()}”`}</span><AnimatedIcon name="plus" size={16} />
              </div>}
            </div></OptionsExpansionBody>
          </PopoverPrimitive.Content>
        </Portal>
      </PopoverPrimitive.Root>
    );
  },
);
export interface MultiSelectProps extends FieldAppearanceProps {
  label: string;
  options: ChoiceOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}
export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  function MultiSelect(rawProps, ref) {
    const { label, options, value, defaultValue = [], onValueChange, disabled, className, placeholder = "Select options" } = useAppearanceProps({ ...rawProps, variant: "outline" });
    const [selected, set] = useControllable(value, defaultValue, onValueChange);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const results = options.filter(option => String(typeof option.label === "string" || typeof option.label === "number" ? option.label : option.value).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    const id = useId();
    const list = useRef<HTMLDivElement>(null);
    const anchor = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const { panel, side: optionsSide } = useOptionsExpansion(open, anchor);
    const { locale, motion: mode, reducedMotion } = useMaterialFluid();
    const expressive = mode === "expressive" && !reducedMotion;
    const transition = expressive ? { type: "spring" as const, stiffness: 420, damping: 28, mass: .8 } : { duration: 0 };
    return <FormField label={label} htmlFor={id} className={cx("mf-choice-field", className)}>
      <PopoverPrimitive.Root open={open} onOpenChange={next => { setOpen(next); if (!next) setQuery(""); }}>
        <PopoverPrimitive.Anchor asChild><div ref={anchor}>
          <AutoHeight className="mf-select-trigger mf-multi-select-trigger" data-disabled={disabled || undefined}
            onClick={event => { if (!disabled && !(event.target as Element).closest("button")) setOpen(true); }}>
            <div className="mf-multi-select-content">
              <div className="mf-multi-chips" role="list" aria-label={label}>
                <AnimatePresence initial={false} mode="popLayout">
                  {selected.length ? options.filter(option => selected.includes(option.value)).map(option => <motion.span role="listitem" key={option.value} layout={expressive ? "position" : false} className="mf-multi-chip-wrap"
                    initial={expressive ? { opacity: 0, scale: .8 } : false} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }} transition={transition}>
                    <motion.button type="button" className="mf-button mf-button--filled mf-variant--primary mf-scale--sm mf-multi-chip" disabled={disabled || option.disabled}
                      whileTap={expressive ? { scale: .96 } : undefined} transition={transition} aria-label={`${locale === "fa" ? "حذف" : "Remove"} ${typeof option.label === "string" ? option.label : option.value}`}
                      onClick={() => { set(selected.filter(value => value !== option.value)); trigger.current?.focus(); }}>
                      <span className="mf-multi-chip-label">{option.label}</span><AnimatedIcon name="close" size={14} />
                    </motion.button>
                  </motion.span>) : <motion.span key="placeholder" className="mf-multi-placeholder" onClick={() => !disabled && setOpen(true)}>{placeholder}</motion.span>}
                </AnimatePresence>
              </div>
              <PopoverPrimitive.Trigger asChild><IconButton ref={node => { trigger.current = node; setRef(ref, node); }} id={id} label={`${label}: ${locale === "fa" ? "انتخاب گزینه‌ها" : "Choose options"}`} variant="ghost" size="sm" disabled={disabled} aria-haspopup="listbox" aria-controls={open ? `${id}-list` : undefined}><AnimatedIcon name="chevron-down" size={28} /></IconButton></PopoverPrimitive.Trigger>
            </div>
          </AutoHeight>
        </div></PopoverPrimitive.Anchor>
        <Portal className={className}>
          <PopoverPrimitive.Content ref={panel} side={optionsSide} aria-label={label} className="mf-multiselect-content mf-options-popup" align="start" sideOffset={-1}
            onInteractOutside={event => { if (anchor.current?.contains(event.target as Node)) event.preventDefault(); }}>
            <OptionsExpansionBody><TextField className="mf-choice-field mf-multi-search" label={locale === "fa" ? "جستجوی گزینه‌ها" : "Search options"} placeholder={locale === "fa" ? "جستجو…" : "Search…"} value={query} disabled={disabled}
              onChange={event => setQuery(event.currentTarget.value)}
              onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const options = list.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"); if (options?.length) options[event.key === "ArrowDown" ? 0 : options.length - 1].focus(); } }} />
            <div ref={list} id={`${id}-list`} className="mf-options-list" role="listbox" aria-multiselectable="true" aria-label={label} onKeyDown={event => {
              if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const buttons = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
              const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
              buttons[event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();
            }}>
              {results.map(option => <motion.button initial={false} whileTap={expressive ? { scale: .97 } : undefined} transition={transition} key={option.value} type="button" role="option" aria-selected={selected.includes(option.value)} disabled={disabled || option.disabled} className="mf-select-item"
                onClick={() => set(selected.includes(option.value) ? selected.filter(value => value !== option.value) : [...selected, option.value])}>
                <span className="mf-select-item-label">{option.label}</span>
              </motion.button>)}
              {!results.length && <p className="mf-options-empty" role="status">{locale === "fa" ? (query ? "نتیجه‌ای یافت نشد" : "گزینه‌ای در دسترس نیست") : (query ? "No matching options" : "No options available")}</p>}
            </div></OptionsExpansionBody>
          </PopoverPrimitive.Content>
        </Portal>
      </PopoverPrimitive.Root>
    </FormField>;
  },
);
export interface OTPInputProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    FieldAppearanceProps {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  length?: number;
  success?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}
export const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  function OTPInput(rawProps, ref) {
    const {
      label,
      length = 6,
      success,
      hint,
      error,
      value,
      defaultValue = "",
      onValueChange,
      disabled,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const [code, set] = useControllable(value, defaultValue, onValueChange);
    const helpId = useId();
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const { motion: mode, reducedMotion } = useMaterialFluid();
    const animated = mode === "expressive" && !reducedMotion;
    const [selectionIndex, setSelectionIndex] = useState<number | null>(null);
    const enter = (i: number, digit: string) => {
      const next = code.split("");
      next[i] = digit;
      set(next.join("").slice(0, length));
      setSelectionIndex(null);
      const following = inputs.current[i + 1];
      following?.focus();
      following?.select();
    };
    return (
      <FormField label={label} hint={hint} error={error} descriptionId={helpId} className={className}>
        <div
          {...props}
          ref={ref}
          role="group"
          aria-label={label}
          className={cx("mf-otp", className)}
          data-success={success && !error || undefined}
          dir="ltr"
        >
          {Array.from({ length }, (_, i) => (
            <span className="mf-otp-slot" key={i} data-animated-digit={animated && !!code[i] || undefined} data-native-selection={selectionIndex === i || undefined}>
            <input
              ref={(element) => {
                inputs.current[i] = element;
              }}
              aria-label={`${label} ${i + 1}`}
              aria-invalid={!!error || undefined}
              aria-describedby={hint || error ? helpId : undefined}
              className="mf-input"
              value={code[i] ?? ""}
              disabled={disabled}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              onFocus={event => { event.target.select(); setSelectionIndex(code[i] ? i : null); }}
              onBlur={() => setSelectionIndex(current => current === i ? null : current)}
              onSelect={event => setSelectionIndex(event.currentTarget.selectionStart !== event.currentTarget.selectionEnd ? i : null)}
              onChange={(e) => {
                const digit = e.target.value.replace(/\D/g, "").slice(-1);
                if (digit) enter(i, digit);
                else { const next = code.split(""); next[i] = ""; set(next.join("").slice(0, length)); setSelectionIndex(null); }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const digits = e.clipboardData
                  .getData("text")
                  .replace(/\D/g, "")
                  .slice(0, length - i);
                const next =
                  code.slice(0, i) + digits + code.slice(i + digits.length);
                set(next.slice(0, length));
                inputs.current[
                  Math.min(i + digits.length, length - 1)
                ]?.focus();
              }}
              onKeyDown={(e) => {
                if (/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && !e.nativeEvent.isComposing) { e.preventDefault(); enter(i, e.key); return; }
                if (e.key === "Backspace" && !code[i])
                  inputs.current[i - 1]?.focus();
                if (e.key === "ArrowLeft") inputs.current[i - 1]?.focus();
                if (e.key === "ArrowRight") inputs.current[i + 1]?.focus();
              }}
            />
            {animated && <span className="mf-otp-reel" aria-hidden="true"><AnimatePresence initial={false}>
              {code[i] && <motion.span key={code[i]} initial={{ y: "-100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ duration: .18, ease: [.2, .65, .3, 1] }}>{code[i]}</motion.span>}
            </AnimatePresence></span>}
            </span>
          ))}
        </div>
      </FormField>
    );
  },
);
export interface FileUploadOptions {
  signal: AbortSignal;
  /** Report the actual upload percentage, from 0 to 100. */
  onProgress: (percentage: number) => void;
}
export type FileInputProps = Omit<TextFieldProps, "value" | "defaultValue" | "leading" | "trailing" | "valueOverlay" | "valueOverlayActive" | "controlRef"> & {
  /** Upload selected files. Resolve on success; reject on failure. Omit for native selection only. */
  onUpload?: (file: File, options: FileUploadOptions) => Promise<void>;
  /** Maximum selected files in multiple mode. Defaults to 5; single mode always allows 1. */
  maxFiles?: number;
};
type FileUploadState = { status: "uploading" | "completed" | "error"; progress?: number };
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  function FileInput(rawProps, ref) {
    const { label, hint, error, className, id: givenId, size: fieldSize = "md", showCount: _showCount, onUpload, maxFiles = 5, ...props } = useAppearanceProps({ ...rawProps, variant: "outline" }, { preserveSize: true });
    const generatedId = useId();
    const id = givenId ?? generatedId;
    const fileLimit = props.multiple ? Number.isFinite(maxFiles) ? Math.max(1, Math.floor(maxFiles)) : 5 : 1;
    const description = `${id}-limits${hint || error ? ` ${id}-help` : ""}`;
    const input = useRef<HTMLInputElement | null>(null);
    const depth = useRef(0);
    const replacing = useRef(false);
    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [files, setFiles] = useState<File[]>([]);
    const jobs = useRef(new Map<File, AbortController>());
    const [uploads, setUploads] = useState(new Map<File, FileUploadState>());
    const [retry, setRetry] = useState(0);
    useEffect(() => {
      for (const [file, controller] of jobs.current) {
        if (!files.includes(file)) { controller.abort(); jobs.current.delete(file); }
      }
      setUploads(current => new Map([...current].filter(([file]) => files.includes(file))));
      if (!onUpload) return;
      for (const file of files) {
        if (jobs.current.has(file)) continue;
        const controller = new AbortController();
        jobs.current.set(file, controller);
        const update = (state: FileUploadState) => {
          if (controller.signal.aborted || jobs.current.get(file) !== controller) return;
          setUploads(current => new Map(current).set(file, state));
        };
        let settled = false;
        update({ status: "uploading" });
        Promise.resolve().then(() => {
          if (controller.signal.aborted) return;
          return onUpload(file, { signal: controller.signal, onProgress: value => {
            if (!settled && Number.isFinite(value)) update({ status: "uploading", progress: Math.min(100, Math.max(0, value)) });
          } });
        }).then(() => { settled = true; update({ status: "completed", progress: 100 }); }, () => { settled = true; update({ status: "error" }); });
      }
    }, [files, onUpload, retry]);
    useEffect(() => {
      const controllers = jobs.current;
      return () => { controllers.forEach(controller => controller.abort()); controllers.clear(); };
    }, []);
    const [drop, setDrop] = useState<"idle" | "active" | "accepted">("idle");
    const [dropError, setDropError] = useState<string | undefined>();
    const { locale, motion: mode, reducedMotion } = useMaterialFluid();
    const expressive = mode === "expressive" && !reducedMotion;
    const t = (en: string, fa: string) => locale === "fa" ? fa : en;
    const actionLabel = files.length ? props.multiple ? t("Add files", "افزودن فایل") : t("Replace file", "جایگزینی فایل") : props.multiple ? t("Choose files", "انتخاب فایل‌ها") : t("Choose file", "انتخاب فایل");
    useEffect(() => () => clearTimeout(timeout.current), []);
    useEffect(() => {
      const form = input.current?.form;
      if (!form) return;
      const reset = (event: Event) => queueMicrotask(() => {
        if (event.defaultPrevented || !input.current) return;
        clearTimeout(timeout.current); depth.current = 0;
        jobs.current.forEach(controller => controller.abort()); jobs.current.clear(); setUploads(new Map());
        setFiles([]); setDrop("idle"); setDropError(undefined);
      });
      form.addEventListener("reset", reset);
      return () => form.removeEventListener("reset", reset);
    }, []);
    const accepts = (file: File) => !props.accept || props.accept.split(",").some(rule => {
      const type = rule.trim().toLowerCase();
      return type.startsWith(".") ? file.name.toLowerCase().endsWith(type) : type.endsWith("/*") ? file.type.startsWith(type.slice(0, -1)) : file.type === type;
    });
    const nativeFiles = (next: File[]) => {
      if (!input.current) return;
      const transfer = new DataTransfer();
      next.forEach(file => transfer.items.add(file));
      input.current.files = transfer.files;
    };
    const mergeFiles = (incoming: File[]) => props.multiple
      ? [...files, ...incoming].filter((file, index, all) => all.findIndex(other => other.name === file.name && other.size === file.size && other.lastModified === file.lastModified) === index)
      : incoming.slice(0, 1);
    const limitMessage = t(`Choose up to ${fileLimit} ${fileLimit === 1 ? "file" : "files"}.`, `حداکثر ${localizeDigits(String(fileLimit), locale)} فایل انتخاب کنید.`);
    const replace = (next: File[]) => {
      nativeFiles(next);
      replacing.current = true;
      input.current?.dispatchEvent(new Event("change", { bubbles: true }));
      replacing.current = false;
    };
    return <div className="mf-file-drop" data-drop-state={drop}
      onDragEnter={event => { if (!props.disabled && event.dataTransfer.types.includes("Files")) { event.preventDefault(); depth.current++; setDrop("active"); } }}
      onDragOver={event => { if (event.dataTransfer.types.includes("Files")) { event.preventDefault(); event.dataTransfer.dropEffect = props.disabled ? "none" : "copy"; } }}
      onDragLeave={() => { depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDrop("idle"); }}
      onDrop={event => {
        event.preventDefault(); depth.current = 0;
        if (props.disabled) return;
        const accepted = Array.from(event.dataTransfer.files).filter(accepts);
        if (!accepted.length) { setDrop("idle"); setDropError(t("Choose a supported file type.", "نوع فایل مجاز نیست.")); return; }
        const incoming = accepted.slice(0, props.multiple ? accepted.length : 1);
        const next = mergeFiles(incoming);
        if (next.length > fileLimit) { setDrop("idle"); setDropError(limitMessage); return; }
        replace(next);
        setDropError(undefined); setDrop("accepted"); clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setDrop("idle"), 420);
      }}>
      <FormField label={label} htmlFor={id} hint={hint} error={error || dropError} descriptionId={`${id}-help`} required={props.required} className={cx(`mf-scale--${fieldSize}`, className)}>
        <input {...props} type="file" id={id} ref={node => { input.current = node; setRef(ref, node); }} className="mf-sr mf-file-native" tabIndex={-1}
          aria-invalid={!!(error || dropError) || undefined} aria-describedby={`${description}${dropError && !hint && !error ? ` ${id}-help` : ""}`}
          onChange={event => {
            let next = Array.from(event.currentTarget.files ?? []);
            if (!replacing.current) {
              next = mergeFiles(next);
              if (next.length > fileLimit) { nativeFiles(files); setDropError(limitMessage); return; }
              if (props.multiple) nativeFiles(next);
            }
            setFiles(next); setDropError(undefined); props.onChange?.(event);
          }} />
        <button type="button" className="mf-input-wrap mf-file-surface" disabled={props.disabled}
          aria-label={`${label}: ${actionLabel}`} aria-describedby={`${description}${dropError && !hint && !error ? ` ${id}-help` : ""}`}
          aria-invalid={!!(error || dropError) || undefined} onClick={() => input.current?.click()}>
          <span className="mf-file-upload-icon" aria-hidden="true"><AnimatedIcon name="arrow_upward" size={fieldSize === "sm" ? 22 : 30} /></span>
          <span className="mf-file-copy">
            <span className="mf-file-prompt">{drop === "active" ? t("Drop your files here", "فایل‌ها را اینجا رها کنید") : fieldSize === "sm" ? props.multiple ? t("Choose or drop files", "انتخاب یا رهاسازی فایل‌ها") : t("Choose or drop a file", "انتخاب یا رهاسازی فایل") : t("Choose a file or drag & drop it here", "فایل را انتخاب کنید یا اینجا بکشید و رها کنید")}</span>
            <span className="mf-file-meta"><span className="mf-file-types">{props.accept ? localizeDigits(props.accept.split(",").map(type => type.trim()).join(" · "), locale) : t("All file types supported", "همهٔ انواع فایل پذیرفته می‌شوند")}</span>
            <span className="mf-file-limit" id={`${id}-limits`}>{localizeDigits(files.length ? t(`${files.length} / ${fileLimit} files selected`, `${files.length} از ${fileLimit} فایل انتخاب شده`) : t(`Up to ${fileLimit} ${fileLimit === 1 ? "file" : "files"}`, `حداکثر ${fileLimit} فایل`), locale)}</span></span>
          </span>
          <span className="mf-file-browse">{actionLabel}</span>
        </button>
        <div className="mf-file-list" role="list" aria-label={t("Selected files", "فایل‌های انتخاب‌شده")}>
          <AnimatePresence initial={false}>
            {files.map(file => {
              const upload = uploads.get(file);
              const status = upload?.status;
              const size = file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(1)} MB`;
              return <motion.div role="listitem" key={`${file.name}-${file.size}-${file.lastModified}`} className="mf-file-row" data-status={status ?? "ready"}
                initial={expressive ? { opacity: 0, height: 0 } : false} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={expressive ? { type: "spring", stiffness: 340, damping: 30 } : { duration: 0 }}>
                <div className="mf-file-row-content">
                  <span className="mf-file-kind" aria-hidden="true">{file.name.includes(".") ? file.name.split(".").pop()!.slice(0, 5).toUpperCase() : "FILE"}</span>
                  <div className="mf-file-details">
                    <span className="mf-file-name" title={file.name} dir="auto">{file.name}</span>
                    <span className="mf-file-status"><bdi>{localizeDigits(size, locale)}</bdi><span className="mf-file-state" aria-live="polite">{status === "uploading" ? t("Uploading…", "در حال بارگذاری…") : status === "completed" ? t("Uploaded", "بارگذاری شد") : status === "error" ? t("Upload failed. Try again.", "بارگذاری ناموفق بود. دوباره تلاش کنید.") : t("Ready", "آماده")}</span>{status === "uploading" && upload?.progress !== undefined && <bdi className="mf-file-percent">{localizeDigits(`${Math.round(upload.progress)}%`, locale)}</bdi>}</span>
                    {upload && <div className={cx("mf-progress", "mf-file-progress", status === "uploading" && upload.progress === undefined && "mf-progress--indeterminate")} role="progressbar" aria-label={`${t("Upload", "بارگذاری")} ${file.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={upload.progress}>
                      <motion.span className="mf-progress-fill" initial={false} animate={{ width: upload.progress === undefined ? status === "error" ? "0%" : "35%" : `${upload.progress}%` }} transition={{ duration: expressive ? .3 : 0, ease: [.2, 0, 0, 1] }} />
                    </div>}
                  </div>
                  {status === "completed" && <span className="mf-file-complete" aria-hidden="true"><AnimatedIcon name="check" size={20} /></span>}
                  {status === "error" && <IconButton label={`${t("Retry", "تلاش مجدد")} ${file.name}`} size={fieldSize} disabled={props.disabled} onClick={() => { jobs.current.delete(file); setRetry(value => value + 1); }}><AnimatedIcon name="undo" /></IconButton>}
                  <IconButton label={`${t("Remove", "حذف")} ${file.name}`} size={fieldSize} disabled={props.disabled} onClick={() => {
                    jobs.current.get(file)?.abort(); jobs.current.delete(file);
                    replace(files.filter(item => item !== file));
                  }}><AnimatedIcon name="close" /></IconButton>
                </div>
              </motion.div>;
            })}
          </AnimatePresence>
        </div>
      </FormField>
    </div>;
  },
);
