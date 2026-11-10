import { Fragment, Children, forwardRef, isValidElement, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { motion } from "motion/react";
import { Button, type ButtonProps } from "./controls";
import { ComponentAppearanceProvider, useAppearanceProps, useComponentAppearance, type AppearanceProps, type ComponentVariant } from "./appearance";
import { normalizeButtonSize, normalizeComponentSize, type ButtonSizeInput } from "./component-policy";
import { ButtonCompositionContext } from "./internal-motion";
import { useMaterialFluid } from "./provider";
import { useCurveValue } from "./curve-value";
import { cx } from "./utils";

export type ButtonGroupVariant = ComponentVariant | "text";
export type ButtonGroupValue = string | string[] | null;
export type ButtonGroupSelection = "none" | "single" | "multi";
export type ButtonGroupKind = "standard" | "connected";
export type ButtonGroupDensity = "default" | "comfortable" | "compact";
export interface ButtonGroupItemProps extends Omit<ButtonProps, "value"> { value?: string; }
export const ButtonGroupItem = forwardRef<HTMLButtonElement, ButtonGroupItemProps>(function ButtonGroupItem(props, ref) {
  return <Button {...props} ref={ref}/>;
});
export interface ButtonGroupChangeDetail {
  value: ButtonGroupValue; values: string[]; selected: HTMLButtonElement[];
  button?: HTMLButtonElement; originalEvent?: Event;
}
export interface ButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange">, Omit<AppearanceProps, "size" | "variant"> {
  label?: string; ariaLabel?: string; size?: ButtonSizeInput; variant?: ButtonGroupVariant;
  buttons?: ButtonGroupItemProps[];
  kind?: ButtonGroupKind; selection?: ButtonGroupSelection; required?: boolean;
  labels?: "always" | "selected"; orientation?: "horizontal" | "vertical";
  density?: ButtonGroupDensity; equalWidth?: boolean; disabled?: boolean; emphasize?: boolean;
  value?: ButtonGroupValue; defaultValue?: ButtonGroupValue;
  onValueChange?: (value: ButtonGroupValue) => void;
  onSelectionChange?: (detail: ButtonGroupChangeDetail) => void;
  onAction?: (detail: { value: string; index: number; button: HTMLButtonElement; originalEvent: Event }) => void;
}
export interface ButtonGroupHandle extends HTMLDivElement {
  getSelected(): string[]; isSelected(value: string): boolean;
  select(value: string): ButtonGroupHandle; deselect(value: string): ButtonGroupHandle; toggle(value: string): ButtonGroupHandle;
  getSelection(): ButtonGroupSelection; getKind(): ButtonGroupKind;
  getButton(index: number): HTMLButtonElement | undefined; getButtonById(id: string): HTMLButtonElement | undefined;
  getVariant(): ButtonGroupVariant; setVariant(value: ButtonGroupVariant): ButtonGroupHandle;
  getOrientation(): "horizontal" | "vertical"; setOrientation(value: "horizontal" | "vertical"): ButtonGroupHandle;
  getDensity(): ButtonGroupDensity; setDensity(value: ButtonGroupDensity): ButtonGroupHandle;
  enable(): ButtonGroupHandle; disable(): ButtonGroupHandle;
  enableButton(index: number): ButtonGroupHandle; disableButton(index: number): ButtonGroupHandle;
}
const groupChildren = (children: ReactNode): React.ReactElement<ButtonGroupItemProps>[] => Children.toArray(children).flatMap(child => {
  if(!isValidElement(child))return [];
  return child.type===Fragment?groupChildren((child.props as {children?:ReactNode}).children):[child as React.ReactElement<ButtonGroupItemProps>];
});
const array = (value: ButtonGroupValue | undefined) => value == null ? [] : Array.isArray(value) ? value : [value];
function GroupLabel({ visible, children }: { visible: boolean; children: ReactNode }) {
  const inner = useRef<HTMLSpanElement>(null), initialized = useRef(false);
  const width = useCurveValue(0), { reducedMotion, motion: mode } = useMaterialFluid();
  useLayoutEffect(() => {
    const update = () => {
      const target = visible ? inner.current?.getBoundingClientRect().width ?? 0 : 0;
      if (!initialized.current || reducedMotion || mode !== "expressive") width.jump(target);
      else width.setTarget(target);
      initialized.current = true;
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
    if (inner.current) observer?.observe(inner.current);
    return () => observer?.disconnect();
  }, [visible, width, reducedMotion, mode]);
  return <motion.span className="mf-group-label" style={{width}} aria-hidden="true"><span ref={inner}>{children}</span></motion.span>;
}

const LegacyGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function LegacyGroup(rawProps, ref) {
  const defaults = useComponentAppearance();
  const { label, ariaLabel, className, children, value:_value, defaultValue:_defaultValue, onValueChange:_onValueChange, onSelectionChange:_onSelectionChange, onAction:_onAction, disabled:_disabled, emphasize:_emphasize, required:_required, labels:_labels, density:_density, orientation:_orientation, equalWidth:_equalWidth, ...props } = useAppearanceProps({...rawProps,size:normalizeButtonSize(rawProps.size ?? defaults.size)});
  return <div {...props} ref={ref} role="group" aria-label={label ?? ariaLabel ?? "Button group"} className={cx("mf-button-group", className)}>
    <ComponentAppearanceProvider variant={(rawProps.variant ?? "ghost") as ComponentVariant} size={normalizeComponentSize("legacy-group",normalizeButtonSize(rawProps.size ?? defaults.size))}>{children}</ComponentAppearanceProvider>
  </div>;
});
/** Existing arbitrary child compositions retain their frame; group items opt into the additive API. */
export const ButtonGroup = forwardRef<HTMLDivElement | ButtonGroupHandle, ButtonGroupProps>(function ButtonGroup(props, ref) {
  const enhanced = props.buttons !== undefined || props.kind !== undefined || props.selection !== undefined || groupChildren(props.children).some(child => child.type === ButtonGroupItem);
  return enhanced ? <ActionGroup {...props} ref={ref as Ref<ButtonGroupHandle>}/> : <LegacyGroup {...props} ref={ref}/>;
});
const ActionGroup = forwardRef<ButtonGroupHandle, ButtonGroupProps>(function ActionGroup(rawProps, ref) {
  const defaults = useComponentAppearance();
  const [overrides, setOverrides] = useState<Partial<ButtonGroupProps>>({});
  const [itemDisabled, setItemDisabled] = useState<Record<number, boolean>>({});
  const {
    label, ariaLabel, buttons, children, kind = "standard", selection = "none", required = false,
    labels = "always", orientation = "horizontal", density = "default", equalWidth = false, disabled = false, emphasize = false,
    value, defaultValue, onValueChange, onSelectionChange, onAction, variant = "outlined", size: requestedSize,
    className, style, onClick, ...props
  } = { ...rawProps, ...overrides };
  const size = normalizeButtonSize(requestedSize ?? defaults.size ?? "sm");
  const items = (buttons ?? groupChildren(children).map(child => child.props)).map((item,index)=>({...item,value:item.value ?? item.id ?? String(index)}));
  const [uncontrolled, setUncontrolled] = useState<string[]>(() => array(defaultValue ?? items.filter(item => item.selected || item.defaultSelected).map(item => item.value)));
  const normalize = (values: string[]) => {
    const ordered = items.map(item => String(item.value)).filter(item => values.includes(item));
    return selection === "none" ? [] : selection === "single" ? ordered.slice(0, 1) : ordered;
  };
  const selected = normalize(value === undefined ? uncontrolled : array(value));
  const current = useRef(selected); current.current = selected;
  const root = useRef<HTMLDivElement>(null);
  const actions = () => Array.from(root.current?.querySelectorAll<HTMLButtonElement>(":scope > .mf-group-action") ?? []);
  const change = (target: string, state: boolean, originalEvent?: Event) => {
    if (selection === "none" || !items.some(item => String(item.value) === target)) return;
    const previous = current.current;
    if (previous.includes(target) === state || !state && required && previous.length === 1) return;
    const next = normalize(state ? selection === "single" ? [target] : [...previous, target] : previous.filter(item => item !== target));
    current.current = next;
    if (value === undefined) setUncontrolled(next);
    const output = selection === "multi" ? next : next[0] ?? null;
    onValueChange?.(output);
    const nodes = actions();
    onSelectionChange?.({ value: output, values: next, selected: nodes.filter(node => next.includes(node.dataset.groupValue!)), button: nodes.find(node => node.dataset.groupValue === target), originalEvent });
  };
  useImperativeHandle(ref, () => {
    const element = root.current! as ButtonGroupHandle;
    const settings = (patch: Partial<ButtonGroupProps>) => { setOverrides(previous => ({...previous,...patch})); return element; };
    const disableItem = (index: number, state: boolean) => { if (items[index]) setItemDisabled(previous => ({...previous,[index]:state})); return element; };
    return Object.assign(element, {
      getSelected: () => [...current.current], isSelected: (target: string) => current.current.includes(target),
      select: (target: string) => { change(target,true); return element; }, deselect: (target: string) => { change(target,false); return element; }, toggle: (target: string) => { change(target,!current.current.includes(target)); return element; },
      getSelection: () => selection, getKind: () => kind, getButton: (index: number) => actions()[index], getButtonById: (id: string) => actions().find(node => node.id === id || node.dataset.groupId === id || node.dataset.groupValue === id),
      getVariant: () => variant, setVariant: (variant: ButtonGroupVariant) => settings({variant}),
      getOrientation: () => orientation, setOrientation: (orientation: "horizontal" | "vertical") => settings({orientation}),
      getDensity: () => density, setDensity: (density: ButtonGroupDensity) => settings({density}),
      enable: () => settings({disabled:false}), disable: () => settings({disabled:true}), enableButton: (index: number) => disableItem(index,false), disableButton: (index: number) => disableItem(index,true),
    });
  });
  const contents = items.map(item=>[item.value,item.text,typeof item.children==="string"?item.children:undefined,item.icon,item.ariaLabel].map(value=>typeof value==="string"?value:"").join("\u001f")).join("\u001e");
  useLayoutEffect(()=>{
    const element=root.current;
    if(!element||!equalWidth&&!(kind==="standard"&&labels==="selected"))return;
    let alive=true;
    const measure=()=>{
      if(!alive)return;
      const width=Math.max(0,...actions().map(button=>{
        const probe=button.cloneNode(true) as HTMLButtonElement;
        probe.removeAttribute("id");probe.style.removeProperty("--mf-group-label-min");probe.inert=true;probe.setAttribute("aria-hidden","true");
        Object.assign(probe.style,{position:"absolute",visibility:"hidden",pointerEvents:"none",width:"max-content",minWidth:"max-content",maxWidth:"none",flex:"none",transform:"none"});
        const content=probe.querySelector<HTMLElement>(".mf-button-content");if(content)content.style.transform="none";
        const label=probe.querySelector<HTMLElement>(".mf-group-label");if(label)label.style.width="max-content";
        element.append(probe);const width=probe.getBoundingClientRect().width;probe.remove();if(kind==="standard"&&labels==="selected")button.style.setProperty("--mf-group-label-min",`${Math.ceil(width)}px`);return width;
      }));
      if(equalWidth)element.style.setProperty("--mf-group-equal-min",`${Math.ceil(width)}px`);
    };
    measure();void document.fonts?.ready.then(measure);
    return()=>{alive=false;element.style.removeProperty("--mf-group-equal-min");for(const button of actions())button.style.removeProperty("--mf-group-label-min");};
  },[equalWidth,kind,size,density,labels,contents]);
  const targetButton = (target: EventTarget | null) => target instanceof Element ? target.closest<HTMLButtonElement>(".mf-group-action") : null;
  const inner = ({xs:4,sm:8,md:8,lg:16,xl:20})[size];
  return <div {...props} ref={root} role="group" aria-label={label ?? ariaLabel ?? props["aria-label"] ?? "Button group"} aria-disabled={disabled || undefined}
    className={cx("mf-button-group",`mf-scale--${size}`,className)} data-kind={kind} data-selection={selection} data-orientation={orientation} data-density={density} data-equal-width={equalWidth || undefined}
    style={{"--mf-group-height":`${({xs:24,sm:28,md:48,lg:58,xl:96})[size]}px`,"--mf-group-gap":`${({xs:18,sm:12,md:8,lg:8,xl:8})[size]}px`,...style} as CSSProperties}
    onClick={event=>{onClick?.(event);const button=targetButton(event.target);if(event.defaultPrevented||disabled||!button||button.disabled)return;const index=actions().indexOf(button);if(index<0)return;const target=String(items[index].value);onAction?.({value:target,index,button,originalEvent:event.nativeEvent});if(!event.defaultPrevented)change(target,!current.current.includes(target),event.nativeEvent);}}>
    {items.map((item,index)=>{
      const {value: itemValue, selected:_selected, defaultSelected:_defaultSelected, children: content, text, className, ...itemProps}=item;
      const active=selected.includes(String(itemValue)), caption=content??text, iconOnly=caption==null||caption==="";
      return <ButtonCompositionContext.Provider key={itemValue ?? index} value={{size:false,color:true,press:true,ripple:true,selection:true,corners:kind==="connected"&&!active?{first:index===0,last:index===items.length-1,vertical:orientation==="vertical",inner}:undefined}}>
        <Button {...itemProps} value={itemValue} id={item.id} variant={variant} size={size} toggle={selection!=="none"} toggleOnClick={false} selected={active} emphasize={emphasize}
          disabled={disabled || (itemDisabled[index] ?? item.disabled)} aria-label={item.ariaLabel ?? item["aria-label"] ?? (typeof caption==="string"?caption:iconOnly?String(itemValue):undefined)}
          className={cx("mf-group-action",iconOnly&&"mf-icon-button",active&&"mf-group-action--selected",className)} data-group-value={String(itemValue)}>
          {labels==="selected"&&item.icon&&caption?<GroupLabel visible={active}>{caption}</GroupLabel>:caption}
        </Button>
      </ButtonCompositionContext.Provider>;
    })}
  </div>;
});
