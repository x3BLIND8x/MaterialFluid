import { ButtonCompositionContext, MotionPreviewContext } from "./internal-motion";
import { motionEngine, dialogMotionDefaults } from "./motion-engine";
import { animate, motion, useMotionValue, useMotionValueEvent, type Transition } from "motion/react";
import { savedMotionPresets } from "./motion-presets";
import { settledSpring } from "./motion-engine";
import { useAppearanceProps, type AppearanceProps } from "./appearance";
import { forwardRef, useRef, useState, useEffect, useLayoutEffect, createContext, useContext, isValidElement, type ReactNode, type HTMLAttributes } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertPrimitive from "@radix-ui/react-alert-dialog";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useMaterialFluid } from "./provider";
import { cx, useControllable, setRef } from "./utils";
import { Button, IconButton } from "./controls";
import { AnimatedIcon } from "./icons";
import { Portal } from "./portal";
export interface DialogProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">, AppearanceProps {
  trigger?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  dragHandle?: ReactNode;
  motionScale?: boolean;
  /** Slide edge surfaces upward from below the viewport. */
  motionFromBottom?: boolean;
}
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  function Dialog(rawProps, ref) {
    const { dialog: motionSettings } = useContext(MotionPreviewContext);
    const {
      trigger,
      open,
      defaultOpen,
      onOpenChange,
      title,
      description,
      footer,
      dragHandle,
      motionScale = true,
      motionFromBottom = false,
      children,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const { locale, motion: mode, reducedMotion } = useMaterialFluid();
    const content = useRef<HTMLDivElement | null>(null);
    return (
      <DialogPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        {trigger && (
          <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
        )}
        <Portal className={className}>
          <DialogPrimitive.Overlay className="mf-overlay" />
          <DialogPrimitive.Content
            {...props}
            ref={node => { content.current = node; setRef(ref, node); }}
            tabIndex={-1}
            onOpenAutoFocus={event => {
              const first = content.current?.querySelector<HTMLElement>('.mf-dialog-body :is(input:not([type="hidden"]),textarea,select,button,a[href],[tabindex="0"]):not(:disabled):not([tabindex="-1"]), .mf-dialog-footer button:not(:disabled)');
              if (first) { event.preventDefault(); first.focus({ preventScroll: true }); }
            }}
            onKeyDown={event => {
              props.onKeyDown?.(event);
              if (event.defaultPrevented || event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || !event.currentTarget.contains(event.target as Node)) return;
              const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button,input:not([type="hidden"]),textarea,select,a[href],[tabindex],[contenteditable="true"]')).filter(item => {
                if (item.tabIndex < 0 || item.matches(':disabled,[aria-disabled="true"]') || item.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
                for (let parent: HTMLElement | null = item; parent && parent !== event.currentTarget; parent = parent.parentElement) {
                  const css = getComputedStyle(parent);
                  if (css.display === "none" || css.visibility === "hidden") return false;
                }
                return true;
              });
              if (!items.length) return;
              event.preventDefault();
              const index = items.indexOf(document.activeElement as HTMLElement);
              const next = items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length];
              queueMicrotask(() => { if (next.isConnected) next.focus({ preventScroll: true }); });
            }}
            {...(!description ? { "aria-describedby": undefined } : {})}
            className={cx("mf-dialog mf-motion-surface", !motionScale && "mf-motion-no-scale", className)}
            asChild
          >
            <motion.div {...motionEngine.dialog(mode === "expressive" && !reducedMotion, motionSettings, motionScale, motionFromBottom && typeof window !== "undefined" ? window.innerHeight : 0)}>
            {dragHandle}
            <div className="mf-dialog-heading">
              <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <IconButton variant="ghost" size="sm" label={locale === "fa" ? "بستن" : "Close"}>
                  <AnimatedIcon name="close" />
                </IconButton>
              </DialogPrimitive.Close>
            </div>
            {description && (
              <DialogPrimitive.Description className="mf-muted">
                {description}
              </DialogPrimitive.Description>
            )}
            <div className="mf-dialog-body">{children}</div>
            {footer && <div className="mf-dialog-footer">{footer}</div>}
            </motion.div>
          </DialogPrimitive.Content>
        </Portal>
      </DialogPrimitive.Root>
    );
  },
);
export interface AlertDialogProps extends Omit<DialogProps, "footer" | "dragHandle" | "motionScale" | "motionFromBottom"> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  destructive?: boolean;
}
export interface AlertDialogMotionSettings {
  stiffness: number;
  damping: number;
  mass: number;
  initialScale: number;
  fadeDuration: number;
}
export const alertDialogMotionDefaults: AlertDialogMotionSettings = dialogMotionDefaults;
export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  function AlertDialog(rawProps, ref) {
    const { dialog: motionSettings } = useContext(MotionPreviewContext);
    const {
      trigger,
      open,
      defaultOpen,
      onOpenChange,
      title,
      description,
      children,
      confirmLabel,
      cancelLabel,
      onConfirm,
      destructive,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const { locale, motion: mode, reducedMotion } = useMaterialFluid();
    const expressive = mode === "expressive" && !reducedMotion;
    const config = { ...alertDialogMotionDefaults, ...motionSettings };
    return (
      <AlertPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        {trigger && (
          <AlertPrimitive.Trigger asChild>{trigger}</AlertPrimitive.Trigger>
        )}
        <Portal className={className}>
          <AlertPrimitive.Overlay className="mf-overlay" />
          <AlertPrimitive.Content
            {...props}
            ref={ref}
            className={cx("mf-dialog mf-motion-surface", "mf-alert-dialog", className)}
            asChild
          >
          <motion.div
            {...motionEngine.dialog(expressive, config)}
          >
            <AlertPrimitive.Title>{title}</AlertPrimitive.Title>
            <AlertPrimitive.Description className="mf-muted">
              {description}
            </AlertPrimitive.Description>
            {children}
            <div className="mf-dialog-footer">
              <AlertPrimitive.Cancel asChild>
                <Button variant="text">
                  {cancelLabel ?? (locale === "fa" ? "انصراف" : "Cancel")}
                </Button>
              </AlertPrimitive.Cancel>
              <AlertPrimitive.Action asChild>
                <Button
                  variant={destructive ? "danger" : "primary"}
                  className={destructive ? "mf-destructive" : undefined}
                  onClick={onConfirm}
                >
                  {confirmLabel ?? (locale === "fa" ? "تأیید" : "Confirm")}
                </Button>
              </AlertPrimitive.Action>
            </div>
          </motion.div>
          </AlertPrimitive.Content>
        </Portal>
      </AlertPrimitive.Root>
    );
  },
);
export interface DrawerProps extends DialogProps {
  side?: "start" | "end";
}
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    side = "end",
    className,
    onOpenChange,
    open,
    defaultOpen = false,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useControllable(
    open,
    defaultOpen,
    onOpenChange,
  );
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);
  const { dir } = useMaterialFluid();
  const sign = (side === "end" ? 1 : -1) * (dir === "rtl" ? -1 : 1);
  return (
    <Dialog
      {...props}
      ref={ref}
      open={visible}
      onOpenChange={setVisible}
      motionScale={false}
      className={cx("mf-drawer", `mf-drawer--${side}`, className)}
      onPointerDown={(e) => {
        props.onPointerDown?.(e);
        if ((e.target as HTMLElement).closest("button,input,textarea,a,select"))
          return;
        pointer.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        props.onPointerUp?.(e);
        const start = pointer.current;
        pointer.current = null;
        if (
          start?.id === e.pointerId &&
          (e.clientX - start.x) * sign > 80 &&
          Math.abs(e.clientY - start.y) < 50
        )
          setVisible(false);
      }}
      onPointerCancel={() => {
        pointer.current = null;
      }}
    />
  );
});
export const BottomSheet = forwardRef<HTMLDivElement, DialogProps>(function BottomSheet(
  { className, onOpenChange, open, defaultOpen = false, ...props }, ref,
) {
  const [visible, setVisible] = useControllable(open, defaultOpen, onOpenChange);
  const [expanded, setExpanded] = useState(false);
  const element = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<{ y: number; id: number; } | null>(null);
  const moved = useRef(false);
  const offset = useMotionValue(0);
  const settling = useRef<ReturnType<typeof animate> | null>(null);
  const { locale, motion: mode, reducedMotion } = useMaterialFluid();
  const expressive = mode === "expressive" && !reducedMotion;
  useMotionValueEvent(offset, "change", value => { if (element.current) element.current.style.translate = `0 ${value}px`; });
  useEffect(() => {
    if (visible) { settling.current?.stop(); offset.set(0); setExpanded(false); element.current?.removeAttribute("data-drag-dismiss"); }
  }, [visible, offset]);
  useEffect(() => () => settling.current?.stop(), []);
  const settle = () => { settling.current?.stop(); settling.current = animate(offset, 0, motionEngine.layout(expressive)); };
  const end = (event: React.PointerEvent<HTMLDivElement>, cancel = false) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    event.currentTarget.removeAttribute("data-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const distance = event.clientY - start.y;
    if (!cancel && distance > (expanded ? 180 : 80)) {
      event.currentTarget.setAttribute("data-drag-dismiss", ""); setVisible(false);
    } else {
      if (!cancel && distance < -50) setExpanded(true);
      else if (!cancel && distance > 50) setExpanded(false);
      settle();
    }
  };
  return <Dialog {...props} motionScale={false} motionFromBottom ref={node => { element.current = node; setRef(ref, node); }} open={visible} onOpenChange={setVisible}
    className={cx("mf-bottom-sheet", className)} data-expanded={expanded || undefined}
    dragHandle={<button type="button" className="mf-sheet-grip" aria-label={locale === "fa" ? "تغییر اندازه برگه" : "Resize sheet"} aria-expanded={expanded}
      onClick={event => { if (event.detail && !moved.current) setExpanded(value => !value); moved.current = false; }}
      onKeyDown={event => {
        if (event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") { event.preventDefault(); setExpanded(value => event.key === "ArrowUp" || !value); }
        if (event.key === "ArrowDown") { event.preventDefault(); if (expanded) setExpanded(false); else setVisible(false); }
      }}><span /></button>}
    onPointerDown={event => {
      props.onPointerDown?.(event);
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target as HTMLElement;
      const grip = target.closest(".mf-sheet-grip");
      if (!grip && (!target.closest(".mf-dialog-heading") || target.closest("button,a,input,textarea,select"))) return;
      settling.current?.stop();
      moved.current = false;
      pointer.current = { y: event.clientY, id: event.pointerId };
      event.currentTarget.setAttribute("data-dragging", "");
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={event => {
      props.onPointerMove?.(event);
      if (pointer.current?.id !== event.pointerId) return;
      const distance = event.clientY - pointer.current.y;
      if (Math.abs(distance) > 6) moved.current = true;
      offset.set(distance < 0 ? distance * .15 : distance);
    }}
    onPointerUp={event => { props.onPointerUp?.(event); end(event); }}
    onPointerCancel={event => { props.onPointerCancel?.(event); end(event, true); }}
    onLostPointerCapture={event => { props.onLostPointerCapture?.(event); if (pointer.current?.id === event.pointerId) end(event, true); }}
  />;
});
export interface PopoverProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">, AppearanceProps {
  trigger: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  label: string;
  side?: "top" | "bottom" | "left" | "right";
}
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  function Popover(rawProps, ref) {
    const {
      trigger,
      open,
      defaultOpen,
      onOpenChange,
      label,
      side = "bottom",
      className,
      children,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const { motion: mode, reducedMotion } = useMaterialFluid();
    return (
      <PopoverPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <Portal className={className}>
          <PopoverPrimitive.Content
            {...props}
            ref={ref}
            side={side}
            sideOffset={8}
            aria-label={label}
            className={cx("mf-floating mf-popover mf-motion-popup", className)}
            asChild
          >
            <motion.div {...motionEngine.popup(mode === "expressive" && !reducedMotion)}>
            {children}
            </motion.div>
          </PopoverPrimitive.Content>
        </Portal>
      </PopoverPrimitive.Root>
    );
  },
);
export interface MenuItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
}
export interface MenuProps extends AppearanceProps {
  trigger: ReactNode;
  items: MenuItem[];
  label?: string;
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export interface MenuMotionSettings {
  x: number; y: number; scale: number; rotate: number; opacity: number; blur: number; transition: Transition;
}
const savedMenu = savedMotionPresets.menu.values;
export const menuMotionDefaults: MenuMotionSettings = {
  x: savedMenu.x, y: savedMenu.y, scale: savedMenu.scale, rotate: savedMenu.rotate, opacity: savedMenu.opacity, blur: savedMenu.blur,
  transition: settledSpring({type:'spring',stiffness:savedMenu.stiffness,damping:savedMenu.damping,mass:savedMenu.mass,velocity:savedMenu.velocity,restDelta:savedMenu.restDelta,restSpeed:savedMenu.restSpeed,delay:savedMenu.delay}),
};
export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  function Menu(rawProps, ref) {
    const { menu: motionSettings } = useContext(MotionPreviewContext);
    const { trigger, items, label, className, open, defaultOpen, onOpenChange } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const { dir, motion: mode, reducedMotion } = useMaterialFluid();
    const [isOpen, setOpen] = useControllable(open, defaultOpen ?? false, onOpenChange);
    const expressive = mode === "expressive" && !reducedMotion;
    const config = {...menuMotionDefaults,...motionSettings};
    const entrance = {x:config.x,y:config.y,scale:config.scale,rotate:config.rotate,opacity:config.opacity,filter:`blur(${config.blur}px)`};
    const keyboardOpen = useRef(false);
    // Keep the popup anchor stationary while retaining the button's radius/ripple feedback.
    const composition = useContext(ButtonCompositionContext);
    const triggerComposition = isValidElement(trigger) && (trigger.type === Button || trigger.type === IconButton)
      ? { ...composition, press: false } : composition;
    return (
      <MenuPrimitive.Root dir={dir} modal={false} open={isOpen} onOpenChange={setOpen}>
        <ButtonCompositionContext.Provider value={triggerComposition}><MenuPrimitive.Trigger asChild onPointerDown={event => {
          // Motion synthesizes pointer events for keyboard press feedback. Radix
          // handles that activation on keydown, so do not toggle it twice.
          if (!event.pointerType) event.preventDefault();
          else keyboardOpen.current = false;
        }} onKeyDown={event => { if (["Enter", " ", "ArrowDown"].includes(event.key)) keyboardOpen.current = true; }}>{trigger}</MenuPrimitive.Trigger></ButtonCompositionContext.Provider>
        <Portal className={className}>
          {isOpen && <MenuPrimitive.Content
            forceMount asChild
            ref={ref}
            onFocusCapture={event => {
              if (keyboardOpen.current && event.target === event.currentTarget) {
                event.currentTarget.querySelector<HTMLElement>('[role="menuitem"]:not([data-disabled])')?.focus();
              }
            }}
            sideOffset={8}
            aria-label={label}
            className={cx("mf-floating mf-menu mf-menu-motion", className)}
          >
            <motion.div initial={expressive ? entrance : false} animate={{x:0,y:0,scale:1,rotate:0,opacity:1,filter:'blur(0px)'}} exit={expressive ? entrance : {opacity:1}} transition={expressive ? config.transition : {duration:0}}>
            <TooltipScope>{items.map((item) => (
              <MenuPrimitive.Item
                key={item.id}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cx(
                  "mf-menu-item",
                  item.destructive && "mf-destructive",
                )}
              >
                {item.icon}
                {item.label}
              </MenuPrimitive.Item>
            ))}</TooltipScope>
            </motion.div>
          </MenuPrimitive.Content>}
        </Portal>
      </MenuPrimitive.Root>
    );
  },
);
export interface TooltipProps extends AppearanceProps {
  className?: string;
  children: ReactNode;
  content: ReactNode;
  delayDuration?: number;
  side?: "top" | "bottom" | "left" | "right";
}
const TooltipSurface = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TooltipSurface({children,className,style,id,role,...props},ref){
  const content=useRef<HTMLSpanElement>(null),[width,setWidth]=useState(0);
  const {motion:mode,reducedMotion}=useMaterialFluid();
  useLayoutEffect(()=>{
    const element=content.current;if(!element)return;
    const measure=()=>setWidth(element.getBoundingClientRect().width);
    measure();
    if(typeof ResizeObserver==="undefined")return;
    const observer=new ResizeObserver(measure);observer.observe(element);
    return ()=>observer.disconnect();
  },[children]);
  return <div {...props} ref={ref} style={{...style,width,display:"flex",justifyContent:"center"}}>
    <motion.div id={id} role={role} className={className} {...motionEngine.tooltip(mode==="expressive"&&!reducedMotion,width)} style={{padding:0,borderWidth:0,minWidth:0,boxSizing:"border-box",overflow:"hidden",flexShrink:0}}>
      <span ref={content} className="mf-tooltip-content">{children}</span>
    </motion.div>
  </div>;
});
const TooltipScopeContext = createContext(false);
export function TooltipScope({children}:{children:ReactNode}) { return <TooltipScopeContext.Provider value={true}>{children}</TooltipScopeContext.Provider>; }
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(rawProps, ref) {
    const {
      children,
      content,
      delayDuration = 350,
      side = "top",
      className,
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const suppressed = useContext(TooltipScopeContext);
    const triggerElement = useRef<HTMLElement | null>(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    useEffect(() => {
      const node = triggerElement.current;
      if (!node) return;
      const closeForPopup = () => { if (node.matches('[aria-expanded="true"]') || node.querySelector('[aria-expanded="true"]')) setTooltipOpen(false); };
      const observer = new MutationObserver(closeForPopup);
      observer.observe(node, {subtree:true, attributes:true, attributeFilter:['aria-expanded']});
      return () => observer.disconnect();
    }, [children]);
    if (suppressed) return <>{children}</>;
    return (
      <TooltipPrimitive.Provider delayDuration={delayDuration}>
        <TooltipPrimitive.Root open={tooltipOpen} onOpenChange={next => {
          const node = triggerElement.current;
          setTooltipOpen(next && !node?.matches('[aria-expanded="true"]') && !node?.querySelector('[aria-expanded="true"]'));
        }}>
          <TooltipPrimitive.Trigger asChild ref={node => { triggerElement.current = node; }}
            onFocus={event => { if (!event.currentTarget.contains(event.target)) event.preventDefault(); }}
          >
            {children}
          </TooltipPrimitive.Trigger>
          <Portal className={className}>
            <TooltipPrimitive.Content
              ref={ref}
              side={side}
              sideOffset={6}
              className={cx("mf-tooltip mf-motion-popup", className)}
              asChild
            >
              <TooltipSurface>{content}</TooltipSurface>
            </TooltipPrimitive.Content>
          </Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  },
);
