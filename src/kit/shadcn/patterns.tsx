import { ButtonCompositionContext } from "../internal-motion";
import { SideNavigation } from "../navigation";
import { Accordion } from "../surfaces";
import { TextField, type TextFieldProps } from "../forms";
import { motionEngine } from "../motion-engine";
import {
  forwardRef,
  Children,
  isValidElement,
  cloneElement,
  type ReactElement,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TableHTMLAttributes,
} from "react";
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useMotionValueEvent } from "motion/react";
import { Button, IconButton, RadioGroup, Checkbox } from "../controls";
import { AnimatedIcon } from "../icons";
import { Popover, Menu, TooltipScope, type MenuProps } from "../overlays";
import { useMaterialFluid } from "../provider";
import { cx, useControllable } from "../utils";

export const Input = forwardRef<HTMLInputElement, Omit<TextFieldProps,'label'> & {label?:string}>(function Input({label,className,...props},ref){return <TextField {...props} ref={ref} label={label??props['aria-label']??(props.id?'':props.placeholder??'Input')} labelPosition="none" className={cx('mf-pattern-input-field',className)}/>;});
export const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(function Label({ className, ...props }, ref) {
  return (
    <label {...props} ref={ref} className={cx("mf-pattern-label", className)} />
  );
});
export const Field = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {orientation?:"vertical"|"horizontal"|"responsive"}>(
  function Field({ className, orientation="vertical", ...props }, ref) {
    return (
      <div {...props} ref={ref} data-orientation={orientation} className={cx("mf-pattern-field", className)} />
    );
  },
);
export const InputGroup = forwardRef<HTMLDivElement,HTMLAttributes<HTMLDivElement>>(function InputGroup({className,children,...props},ref){
  const parts=Children.toArray(children),index=parts.findIndex(child=>isValidElement(child)&&(child.type===Input||child.type===TextField));
  const field=parts[index] as ReactElement<TextFieldProps>|undefined;
  const before=parts.slice(0,index),after=parts.slice(index+1),outputs=after.filter(child=>isValidElement(child)&&child.type==='output');
  return <div {...props} ref={ref} className={cx('mf-pattern-input-group',className)}>{field?<Input {...field.props} leading={<>{before}</>} trailing={<>{after.filter(child=>!outputs.includes(child))}</>}/>:children}{outputs}</div>;
});
export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Kbd({ className, ...props }, ref) {
    return (
      <kbd {...props} ref={ref} className={cx("mf-pattern-kbd", className)} />
    );
  },
);
export const AspectRatio = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { ratio?: number }
>(function AspectRatio({ ratio = 16 / 9, className, style, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx("mf-pattern-aspect", className)}
      style={{ aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9, ...style }}
    />
  );
});
export const ScrollArea = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {orientation?:"vertical"|"horizontal"|"both"}
>(function ScrollArea({ className, orientation="vertical", tabIndex = 0, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      tabIndex={tabIndex}
      data-orientation={orientation}
      className={cx("mf-pattern-scroll", className)}
    />
  );
});
export const Item = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { variant?: "outline" | "plain" | "muted" }>(
  function Item({ className, variant = "outline", ...props }, ref) {
    return (
      <div {...props} ref={ref} data-variant={variant} className={cx("mf-pattern-item", className)} />
    );
  },
);
export const Bubble = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }
>(function Bubble({ align = "start", className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-align={align}
      className={cx("mf-pattern-bubble", className)}
    />
  );
});
export const Message = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement> & { align?: "start" | "end" }
>(function Message({ align = "start", className, ...props }, ref) {
  return (
    <article
      {...props}
      ref={ref}
      data-align={align}
      className={cx("mf-pattern-message", className)}
    />
  );
});
export const Marker = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function Marker({ className, ...props }, ref) {
  return (
    <div {...props} ref={ref} className={cx("mf-pattern-marker", className)} />
  );
});
export const Table = forwardRef<
  HTMLTableElement,
  TableHTMLAttributes<HTMLTableElement> & {stripe?:"none"|"rows"|"columns"}
>(function Table({ className, stripe="none", ...props }, ref) {
  return (
    <div className="mf-pattern-table-scroll">
      <table
        {...props}
        ref={ref}
        data-stripe={stripe} className={cx("mf-pattern-table", className)}
      />
    </div>
  );
});
export const Direction = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function Direction({ dir = "ltr", ...props }, ref) {
  return <div {...props} ref={ref} dir={dir} />;
});
export const Typography = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function Typography({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx("mf-pattern-typography", className)}
    />
  );
});

export interface CollapsibleProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function Collapsible({
  title,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  ...props
}: CollapsibleProps) {
  const [open, setOpen] = useControllable(
      controlled,
      defaultOpen,
      onOpenChange,
    ),
    id = useId(),
    { motion: mode, reducedMotion } = useMaterialFluid(),
    animated = mode === "expressive" && !reducedMotion;
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const element = inner.current;
    if (!element) return;
    const measure = () => setHeight(element.offsetHeight);
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    return () => observer?.disconnect();
  }, []);
  return (
    <div {...props} className={cx("mf-pattern-collapsible", className)}>
      <ButtonCompositionContext.Provider value={{ size: false, color: true, press: true, ripple: true }}><Button
        variant="ghost"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        trailing={
          <AnimatedIcon
            name="chevron-down"
            size={18}
            style={{ rotate: open ? "180deg" : "0deg" }}
          />
        }
      >
        {title}
      </Button></ButtonCompositionContext.Provider>
      <motion.div id={id} initial={false} aria-hidden={!open} inert={!open}
        style={{height:"max(0px, var(--mf-collapsible-height, 0) * 1px)"}}
        animate={{"--mf-collapsible-height":open?height:0}}
        transition={motionEngine.layout(animated)} className="mf-pattern-collapsible-content">
        <div ref={inner} className="mf-pattern-collapsible-inner">{children}</div>
      </motion.div>
    </div>
  );
}
export interface CarouselProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  slides: ReactNode[];
  label: string;
  orientation?:"horizontal"|"vertical";
}
export function Carousel({
  slides,
  label,
  orientation="horizontal",
  className,
  ...props
}: CarouselProps) {
  const [index, setIndex] = useState(0),
    { dir, locale, motion: mode, reducedMotion } = useMaterialFluid(),
    current = Math.min(index, Math.max(0, slides.length - 1));
  const vertical=orientation==="vertical";
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const enabled = mode === "expressive" && !reducedMotion;
  const sign = !vertical && dir === "rtl" ? 1 : -1;
  const gesture = useRef<{id:number; startX:number; startY:number; origin:number; time:number; horizontal:boolean} | null>(null);
  const suppressClick = useRef(false);
  const settle = (next:number) => {
    const bounded = Math.max(0, Math.min(slides.length - 1, next));
    setIndex(bounded);
    if (enabled) animate(x, sign * bounded * width, motionEngine.layout(true));
    else x.jump(sign * bounded * width);
  };
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () => setWidth(vertical?element.clientHeight:element.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, [vertical]);
  useEffect(() => {
    if (enabled) { const animation = animate(x, sign * current * width, motionEngine.layout(true)); return () => animation.stop(); }
    x.jump(sign * current * width);
  }, [current, width, sign, x, enabled]);
  return (
    <div
      {...props}
      role="region"
      data-orientation={orientation}
      aria-roledescription="carousel"
      aria-label={label}
      className={cx("mf-pattern-carousel", className)}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if ((vertical?["ArrowUp","ArrowDown"]:["ArrowLeft", "ArrowRight"]).includes(event.key)) {
          event.preventDefault();
          setIndex((value) =>
            Math.max(
              0,
              Math.min(
                slides.length - 1,
                value +
                  (event.key === (vertical ? "ArrowDown" : dir === "rtl" ? "ArrowLeft" : "ArrowRight")
                    ? 1
                    : -1),
              ),
            ),
          );
        }
      }}
    >
      <div ref={viewport} className="mf-pattern-carousel-window"
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('button,a,input,textarea,select,[contenteditable="true"]')) return;
          x.stop(); suppressClick.current = false;
          gesture.current = {id:event.pointerId,startX:event.clientX,startY:event.clientY,origin:x.get(),time:performance.now(),horizontal:false};
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          const g = gesture.current; if (!g || g.id !== event.pointerId) return;
          const dx=vertical?event.clientY-g.startY:event.clientX-g.startX,dy=vertical?event.clientX-g.startX:event.clientY-g.startY;
          if (!g.horizontal && Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>6) { gesture.current=null;event.currentTarget.releasePointerCapture(event.pointerId);settle(current);return; }
          if (Math.abs(dx)>6) g.horizontal=true;
          if (!g.horizontal) return;
          suppressClick.current=true;
          const target=g.origin+dx,edge=sign*(slides.length-1)*width;
          const bound=Math.max(Math.min(0,edge),Math.min(Math.max(0,edge),target));
          x.set(bound+(target-bound)*.15);
        }}
        onPointerUp={event => {
          const g=gesture.current;if(!g||g.id!==event.pointerId)return;gesture.current=null;
          const dx=vertical?event.clientY-g.startY:event.clientX-g.startX,velocity=dx/Math.max(1,performance.now()-g.time)*1000;
          const change=g.horizontal&&(Math.abs(dx)>Math.min(80,width*.2)||Math.abs(velocity)>500);
          settle(current+(change?(dx*sign>0?1:-1):0));
          if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {gesture.current=null;settle(current);}}
        onLostPointerCapture={() => {if(gesture.current){gesture.current=null;settle(current);}}}
        onClickCapture={event => {if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}
      >
        <motion.div className="mf-carousel-track" style={{x:vertical?0:x,y:vertical?x:0}}>
          {slides.map((slide,i)=><div key={i} className="mf-carousel-slide" role="group" aria-roledescription="slide"
            aria-label={`${i+1} / ${slides.length}`} aria-hidden={i!==current} inert={i!==current}>
            {slide}
          </div>)}
        </motion.div>
      </div>
      <div className="mf-pattern-actions">
        <IconButton
          label={locale === "fa" ? "اسلاید قبلی" : "Previous slide"}
          disabled={current === 0}
          onClick={() => setIndex(current - 1)}
        >
          <AnimatedIcon name={vertical?"chevron-up":dir === "rtl" ? "arrow-right" : "arrow-left"} />
        </IconButton>
        <bdi dir="ltr" aria-live="polite">
          {current + 1} / {slides.length}
        </bdi>
        <IconButton
          label={locale === "fa" ? "اسلاید بعدی" : "Next slide"}
          disabled={current >= slides.length - 1}
          onClick={() => setIndex(current + 1)}
        >
          <AnimatedIcon name={vertical?"chevron-down":dir === "rtl" ? "arrow-left" : "arrow-right"} />
        </IconButton>
      </div>
    </div>
  );
}
export { Chart, type ChartProps } from "./chart";
export interface CodeBlockProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  code: string;
  language?: string;
  lineNumbers?: boolean;
  wrap?: boolean;
}
export function CodeBlock({
  code,
  language = "tsx",
  lineNumbers = false,
  wrap = false,
  className,
  ...props
}: CodeBlockProps) {
  const [status, setStatus] = useState("");
  const { locale } = useMaterialFluid();
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);
  return (
    <div {...props} className={cx("mf-pattern-code", className)} data-wrap={wrap} data-line-numbers={lineNumbers}>
      <div className="mf-pattern-code-heading">
        <span>{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setStatus("Copied");
              clearTimeout(reset.current); reset.current=setTimeout(()=>setStatus(""),2000);
            } catch {
              setStatus("Select the code to copy it.");
            }
          }}
        >
          {status === "Copied" ? (locale === "fa" ? "کپی شد" : "Copied") : (locale === "fa" ? "کپی کد" : "Copy code")}
        </Button>
      </div>
      <pre tabIndex={0}>
        <code>{lineNumbers?code.split("\n").map((line,index)=><span className="mf-code-line" key={index}><span aria-hidden="true" className="mf-code-line-number">{index+1}</span><span>{line||" "}</span></span>):code}</code>
      </pre>
      <span role="status" className="mf-sr">{status}</span>
    </div>
  );
}
export interface CommandProps {
  items: { id: string; label: string; onSelect: () => void }[];
  label: string;
}
export function Command({ items, label }: CommandProps) {
  const [query, setQuery] = useState(""),
    [active, setActive] = useState(0),
    [announcement, setAnnouncement] = useState(""),
    id = useId(),
    filtered = items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()),
    );
  const select = (index: number) => {
    const item = filtered[index];
    if (item) {
      item.onSelect();
      setAnnouncement(`${item.label} selected`);
    }
  };
  return (
    <div className="mf-pattern-command">
      <Input
        role="combobox"
        aria-label={label}
        placeholder="Search commands…"
        value={query}
        aria-expanded="true"
        aria-controls={id}
        aria-autocomplete="list"
        aria-activedescendant={filtered[active] ? `${id}-${active}` : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={(event) => {
          if (
            ["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)
          ) {
            event.preventDefault();
            if (event.key === "Enter") select(active);
            else
              setActive(
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? Math.max(0, filtered.length - 1)
                    : Math.max(
                        0,
                        Math.min(
                          filtered.length - 1,
                          active + (event.key === "ArrowDown" ? 1 : -1),
                        ),
                      ),
              );
          }
        }}
      />
      <div id={id} role="listbox" aria-label={label}>
        {filtered.map((item, index) => (
          <div
            key={item.id}
            id={`${id}-${index}`}
            role="option"
            aria-selected={index === active}
            onPointerMove={() => setActive(index)}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => select(index)}
          >
            {item.label}
          </div>
        ))}
        {!filtered.length && <p role="status">No commands found.</p>}
      </div>
      <output aria-live="polite">{announcement}</output>
    </div>
  );
}
export function ContextMenu({
  children,
  ...props
}: Omit<MenuProps, "trigger"> & { children: ReactNode }) {
  const trigger = useRef<HTMLDivElement>(null);
  const openMenu = () => {const button=trigger.current?.querySelector<HTMLButtonElement>('button');button?.focus();button?.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));};
  return (
    <div
      tabIndex={0}
      ref={trigger}
      className="mf-pattern-context"
      onContextMenu={(event) => {
        event.preventDefault();
        openMenu();
      }}
      onKeyDown={(event) => {
        if (
          event.key === "ContextMenu" ||
          (event.shiftKey && event.key === "F10")
        ) {
          event.preventDefault();
          openMenu();
        }
      }}
    >
      <div>{children}</div>
      <Menu
        {...props}
        trigger={
          <Button variant="ghost" size="sm">
            Open context menu
          </Button>
        }
      />
    </div>
  );
}
export function Menubar({
  menus,
  label = "Application menu",
}: {
  menus: { label: string; items: MenuProps["items"] }[];
  label?: string;
}) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      className="mf-pattern-actions mf-pattern-menubar"
      onKeyDown={(event) => {
        if (
          event.target !== document.activeElement ||
          !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
        )
          return;
        const buttons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            ":scope > button",
          ),
        );
        const index = buttons.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        event.preventDefault();
        buttons[
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : (index +
                  (event.key === "ArrowRight" ? 1 : -1) +
                  buttons.length) %
                buttons.length
        ]?.focus();
      }}
    >
      {menus.map((menu) => (
        <Menu
          key={menu.label}
          trigger={<Button variant="ghost" size="sm">{menu.label}</Button>}
          items={menu.items}
          label={menu.label}
        />
      ))}
    </div>
  );
}
export function NavigationMenu({
  items,
  label = "Main navigation",
}: {
  items: { label: string; href?: string; content?: ReactNode }[];
  label?: string;
}) {
  return (
    <nav aria-label={label} className="mf-pattern-actions">
      {items.map((item) =>
        item.content ? (
          <Popover
            key={item.label}
            label={item.label}
            trigger={
              <Button
                variant="ghost"
                trailing={<AnimatedIcon name="chevron-down" size={18} />}
              >
                {item.label}
              </Button>
            }
          >
            {item.content}
          </Popover>
        ) : (
          <a key={item.label} className="mf-link" href={item.href}>
            {item.label}
          </a>
        ),
      )}
    </nav>
  );
}
export function HoverCard({
  trigger,
  children,
  label,
}: {
  trigger: ReactNode;
  children: ReactNode;
  label: string;
}) {
  const [open, setOpen] = useState(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <TooltipScope><span
      onPointerEnter={() => {
        clearTimeout(timer.current);
        setOpen(true);
      }}
      onPointerLeave={() => {
        timer.current = setTimeout(() => setOpen(false), 180);
      }}
    >
      <Popover
        label={label}
        trigger={trigger}
        open={open}
        onOpenChange={setOpen}
      >
        <div
          onPointerEnter={() => clearTimeout(timer.current)}
          onPointerLeave={() => {
            timer.current = setTimeout(() => setOpen(false), 180);
          }}
        >
          {Children.map(children, child => isValidElement(child) && child.type===Item ? cloneElement(child as ReactElement<{variant?:"plain"}>, {variant:"plain"}) : child)}
        </div>
      </Popover>
    </span></TooltipScope>
  );
}
export interface ResizableProps extends HTMLAttributes<HTMLDivElement> {
  first:ReactNode; second:ReactNode; defaultValue?:number; value?:number; onValueChange?:(value:number)=>void;
  label:string; orientation?:"horizontal"|"vertical"; snapPoints?:number[]; snapThreshold?:number; min?:number; max?:number;
}
export function Resizable({first,second,defaultValue=50,value:controlled,onValueChange,label,snapPoints=[50],snapThreshold=3,min=20,max=80,orientation="horizontal",className,style,...props}:ResizableProps) {
  const panelId=useId();
  const [value,setValue]=useControllable(controlled,defaultValue,onValueChange),root=useRef<HTMLDivElement>(null);
  const {dir,motion:mode,reducedMotion}=useMaterialFluid(),animated=mode==='expressive'&&!reducedMotion,vertical=orientation==='vertical';
  const position=useSpring(value,motionEngine.rangeSpring(((vertical?root.current?.clientHeight:root.current?.clientWidth)??500)/100));
  const draw=(v:number)=>{if(root.current){root.current.style.gridTemplateColumns=vertical?'minmax(0,1fr)':`minmax(0,${v}fr) 16px minmax(0,${100-v}fr)`;root.current.style.gridTemplateRows=vertical?`minmax(0,${v}fr) 16px minmax(0,${100-v}fr)`:'minmax(0,1fr)';}};
  useMotionValueEvent(position,'change',draw);
  useEffect(()=>{if(animated)position.set(value);else position.jump(value);draw(position.get());},[value,animated,position,vertical]);
  const update=(next:number)=>{const bounded=Math.max(min,Math.min(max,next));const snap=snapPoints.filter(p=>p>=min&&p<=max).find(p=>Math.abs(p-bounded)<=snapThreshold);setValue(snap??bounded);};
  const move=(x:number,y:number)=>{const box=root.current?.getBoundingClientRect();if(box)update(vertical?(y-box.top)/box.height*100:(dir==='rtl'?box.right-x:x-box.left)/box.width*100);};
  return <div {...props} ref={root} data-orientation={orientation} className={cx('mf-pattern-resizable',className)} style={style}><div id={panelId} role="region" aria-label={`${label}: first panel`} tabIndex={0}>{first}</div><div role="separator" aria-controls={panelId} aria-label={label} aria-orientation={vertical?'horizontal':'vertical'} aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value)} tabIndex={0}
    onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e.clientX,e.clientY);}}
    onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
    onDoubleClick={()=>update(defaultValue)} onKeyDown={e=>{const previous=vertical?'ArrowUp':dir==='rtl'?'ArrowRight':'ArrowLeft',next=vertical?'ArrowDown':dir==='rtl'?'ArrowLeft':'ArrowRight';if([previous,next,'Home','End'].includes(e.key)){e.preventDefault();update(e.key==='Home'?min:e.key==='End'?max:value+(e.key===next?5:-5));}}}><span/></div><div role="region" aria-label={`${label}: second panel`} tabIndex={0}>{second}</div></div>;
}
export interface SidebarProps {items:{label:string;id:string;icon?:ReactNode;group?:string}[];children?:ReactNode;label?:string;title?:string;footer?:ReactNode;variant?:'inset'|'floating'|'standard';}
export function Sidebar({items,children,label='Workspace navigation',title='Workspace',footer,variant='inset'}:SidebarProps) {
  const [open,setOpen]=useState(() => typeof window === "undefined" || window.matchMedia("(min-width: 700px)").matches),[active,setActive]=useState(items[0]?.id??'');
  const id=useId(),{motion:mode,reducedMotion,locale}=useMaterialFluid();const selected=items.find(item=>item.id===active);
  return <div className="mf-pattern-sidebar-layout" data-variant={variant}><header><strong>{title}</strong><IconButton size="sm" variant="ghost" label={locale==='fa'?(open?'جمع کردن نوار کناری':'گسترش نوار کناری'):(open?'Collapse sidebar':'Expand sidebar')} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}><AnimatedIcon name="menu"/></IconButton></header><div className="mf-pattern-sidebar-body">
    <AnimatePresence initial={false}>{open&&<motion.aside id={id} initial={{width:0,opacity:0}} animate={{width:210,opacity:1}} exit={{width:0,opacity:0}} transition={motionEngine.layout(mode==='expressive'&&!reducedMotion)}><SideNavigation size="sm" label={label} value={active} onValueChange={setActive} items={items.map((item,index)=>({value:item.id,label:item.label,icon:item.icon??<AnimatedIcon name={index===0?'dashboard':index===1?'layers':'settings'} size={19}/>}))}/><footer>{footer??(locale==='fa'?'فضای کار شخصی':'Personal workspace')}</footer></motion.aside>}</AnimatePresence>
    <section aria-label={selected?.label}><div className="mf-sidebar-breadcrumb">{title} / {selected?.label}</div>{children??<><h3>{selected?.label}</h3><p>Your {selected?.label.toLowerCase()} workspace.</p><div className="mf-sidebar-content-grid"><Item variant="plain"><AnimatedIcon name="layers"/><div><strong>{active==='projects'?'Active projects':'Workspace activity'}</strong><p>Everything you need in one place.</p></div></Item><Item variant="plain"><AnimatedIcon name="check-check"/><div><strong>All changes saved</strong><p>This example runs locally.</p></div></Item></div></>}</section></div></div>;
}
export interface AttachmentProps extends Omit<HTMLAttributes<HTMLDivElement>,'children'> {name:string;description?:string;preview?:string;onRemove?:()=>void;ratio?:number;variant?:'inline'|'card';}
export function Attachment({name,description,onRemove,preview,ratio=1,variant='inline',className,...props}:AttachmentProps) {
 return <Item {...props} className={cx('mf-pattern-attachment',className)} data-attachment-variant={variant}>
   {preview?<AspectRatio ratio={ratio} className="mf-pattern-attachment-media"><img src={preview} alt={name} loading="lazy"/></AspectRatio>:<AnimatedIcon name="description" size={26}/>}
   <div className="mf-attachment-details"><strong>{name}</strong>{description&&<p>{description}</p>}</div>{onRemove&&<IconButton size="sm" variant="ghost" label={`Remove ${name}`} onClick={onRemove}><AnimatedIcon name="close"/></IconButton>}
 </Item>;
}
export function MessageScroller({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const root = useRef<HTMLDivElement>(null),
    [atEnd, setAtEnd] = useState(true),
    { reducedMotion } = useMaterialFluid();
  useEffect(() => { if(atEnd&&root.current)root.current.scrollTop=root.current.scrollHeight; },[children,atEnd]);
  return (
    <div className="mf-pattern-message-scroller">
      <div
        {...props}
        ref={root}
        role={props.role ?? "log"}
        aria-live={props["aria-live"] ?? "polite"}
        tabIndex={0}
        onScroll={(event) => {
          props.onScroll?.(event);
          const el = event.currentTarget;
          setAtEnd(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
        }}
      >
        {children}
      </div>
      {!atEnd && (
        <Button
          size="sm"
          variant="tonal"
          onClick={() =>
            root.current?.scrollTo({
              top: root.current.scrollHeight,
              behavior: reducedMotion ? "instant" : "smooth",
            })
          }
        >
          Jump to latest
        </Button>
      )}
    </div>
  );
}
export interface TraceStep {title:string;description?:string;status?:'complete'|'pending'|'error';duration?:string;details?:ReactNode;}
export function Trace({steps,title='Activity trace',variant='timeline'}:{steps:TraceStep[];title?:string;variant?:'timeline'|'compact'}) {
 const {locale}=useMaterialFluid();const t=(en:string,fa:string)=>locale==='fa'?fa:en;
 const done=steps.filter(step=>step.status==='complete').length;
 return <section className="mf-pattern-trace" data-variant={variant} aria-label={title}>
  <header><div><h3>{title}</h3><p>{t('Run history and diagnostic output.','تاریخچهٔ اجرا و خروجی تشخیصی.')}</p></div><span>{done} / {steps.length} {t('complete','کامل')}</span></header>
  <ol>{steps.map((step,index)=>{
   const heading=<span className="mf-trace-summary"><span className="mf-trace-title"><strong>{step.title}</strong><span>{step.duration??(step.status==='complete'?t('Complete','کامل'):step.status==='error'?t('Failed','ناموفق'):t('Waiting','در انتظار'))}</span></span>{step.description&&<span className="mf-trace-description">{step.description}</span>}</span>;
   return <li key={index} data-status={step.status??'pending'}>
    <span className="mf-trace-node" role="img" aria-label={step.status??'pending'}><AnimatedIcon name={step.status==='complete'?'check':step.status==='error'?'close':'more_vert'} size={18}/></span>
    <div>{step.details!==undefined&&step.details!==null&&step.details!==false&&step.details!==''?<Accordion items={[{value:'details',title:heading,content:<div className="mf-trace-details">{step.details}</div>}]}/>:heading}</div>
   </li>;
  })}</ol>
 </section>;
}

export interface QuestionnaireItem {
  name: string;
  prompt: string;
  choices?: { value: string; label: string }[];
  multiple?: boolean;
  required?: boolean;
  input?: boolean;
}
export function Questionnaire({
  items,
  onSubmit,
}: {
  items: QuestionnaireItem[];
  onSubmit: (answers: Record<string, string | string[]>) => void;
}) {
  const [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<Record<string, string | string[]>>({}),
    [error, setError] = useState(""),
    [done, setDone] = useState(false),
    question = items[index];
  if (!question) return null;
  const answer = answers[question.name],
    valid = Array.isArray(answer) ? answer.length > 0 : !!answer?.trim();
  const save = (value: string | string[]) => {
    setAnswers((previous) => ({ ...previous, [question.name]: value }));
    setError("");
  };
  const next = () => {
    if (question.required && !valid) {
      setError("Choose an answer to continue.");
      return;
    }
    if (index === items.length - 1) {
      onSubmit(answers);
      setDone(true);
    } else setIndex(index + 1);
  };
  if (done)
    return (
      <div role="status" className="mf-pattern-questionnaire">
        <strong>Answers saved</strong>
        <Button
          variant="outline"
          onClick={() => {
            setDone(false);
            setIndex(0);
          }}
        >
          Edit answers
        </Button>
      </div>
    );
  return (
    <div className="mf-pattern-questionnaire">
      <p>
        Question {index + 1} of {items.length}
      </p>
      <h3>{question.prompt}</h3>
      {question.choices &&
        (question.multiple ? (
          <div className="mf-pattern-field">
            {question.choices.map((choice) => (
              <Checkbox
                key={choice.value}
                label={choice.label}
                checked={Array.isArray(answer) && answer.includes(choice.value)}
                onCheckedChange={(checked) =>
                  save(
                    checked
                      ? [...(Array.isArray(answer) ? answer : []), choice.value]
                      : (Array.isArray(answer) ? answer : []).filter(
                          (value) => value !== choice.value,
                        ),
                  )
                }
              />
            ))}
          </div>
        ) : (
          <RadioGroup
            label={question.prompt}
            options={question.choices}
            value={typeof answer === "string" ? answer : ""}
            onValueChange={save}
          />
        ))}
      {question.input && (
        <Input
          aria-label={question.prompt}
          value={typeof answer === "string" ? answer : ""}
          onChange={(event) => save(event.target.value)}
        />
      )}
      <p role="alert">{error}</p>
      <div className="mf-pattern-actions">
        <Button
          variant="ghost"
          disabled={index === 0}
          onClick={() => {
            setError("");
            setIndex(index - 1);
          }}
        >
          Previous
        </Button>
        {!question.required && index < items.length - 1 && (
          <Button
            variant="ghost"
            onClick={() => {
              setError("");
              setIndex(index + 1);
            }}
          >
            Skip
          </Button>
        )}
        <Button onClick={next}>
          {index === items.length - 1 ? "Save answers" : "Next"}
        </Button>
      </div>
    </div>
  );
}

export type PatternStyle = CSSProperties;
