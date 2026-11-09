import { MotionPreviewContext } from "./internal-motion";
import { motionTransition } from "./bounded-motion";
import { useSizePolicy } from "./appearance";
import { identityColor, miscColorStyle, statusColors, type MiscColor } from "./misc-colors";
import { Tooltip } from "./overlays";
import { TableColumnFilter, type TableFilterValue } from "./table-filter";
import { IconSwap } from "./icon-swap";
import {
  useAppearanceProps,
  type AppearanceProps,
  type ComponentVariant,
} from "./appearance";
import {
  forwardRef,
  useState,
  useContext,
  useRef,
  useId,
  useEffect,
  useLayoutEffect,
  Children,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type ColumnFiltersState,
  type ColumnSizingState,
  type Column,
} from "@tanstack/react-table";
import { cx, setRef, useControllable } from "./utils";
import { motion } from "motion/react";
import { useMaterialFluid } from "./provider";
import { Button, Checkbox } from "./controls";
import { SearchField, FormField, Select } from "./forms";
import { AnimatedIcon } from "./icons";
import { EmptyState } from "./feedback";
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, Omit<AppearanceProps, "variant"> {
  variant?: ComponentVariant | "filled" | "outlined";
}
export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(rawProps, ref) {
    const {
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    return (
      <div
        {...props}
        ref={ref}
        className={cx("mf-card", className)}
      />
    );
  },
);
function CardGroupSymbol({ symbol }: { symbol: ReactNode }) {
  const emoji = typeof symbol === "string" && /[\p{Extended_Pictographic}\p{Regional_Indicator}\u20e3]/u.test(symbol);
  return <span className="mf-card-choice-glyph">{emoji
    ? <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><text x="12" y="12" textAnchor="middle" dominantBaseline="central" fontSize="20" fontFamily="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">{symbol}</text></svg>
    : symbol}</span>;
}
export interface CardGroupOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  /** Decorative icon, symbol, or emoji. The label supplies the accessible name. */
  symbol?: ReactNode;
  disabled?: boolean;
}
interface CardGroupBaseProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange">, Omit<AppearanceProps, "labelPosition"> {
  label: ReactNode;
  options: CardGroupOption[];
  name?: string;
  disabled?: boolean;
  required?: boolean;
}
export type CardGroupProps = CardGroupBaseProps & (
  { selectionMode?: "single"; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
  | { selectionMode: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
);
export const CardGroup = forwardRef<HTMLFieldSetElement, CardGroupProps>(function CardGroup(rawProps, ref) {
  const { label, options, name, disabled, required, selectionMode = "single", value, defaultValue, onValueChange: _onValueChange, className, ...props } = useAppearanceProps({ ...rawProps, variant: "outline", labelPosition: "top" });
  const id = useId();
  const element = useRef<HTMLFieldSetElement | null>(null);
  const initial = useRef(Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []);
  const [local, setLocal] = useState<string[]>(initial.current);
  const selected = value === undefined ? local : Array.isArray(value) ? value : [value];
  const change = (next: string[]) => {
    if (value === undefined) setLocal(next);
    if (rawProps.selectionMode === "multiple") rawProps.onValueChange?.(next);
    else rawProps.onValueChange?.(next[0] ?? "");
  };
  useEffect(() => {
    const form = element.current?.form;
    if (!form) return;
    const reset = (event: Event) => queueMicrotask(() => { if (!event.defaultPrevented && element.current) setLocal([...initial.current]); });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, []);
  return <FormField label={<span id={`${id}-label`}>{label}</span>} required={required} className={cx("mf-card-group", className)}>
    <fieldset {...props} ref={node => { element.current = node; setRef(ref, node); }} disabled={disabled} aria-labelledby={`${id}-label`} className="mf-card-group-options" data-selection-mode={selectionMode}>
      {options.map((option, index) => {
        const active = selected.includes(option.value);
        return <label key={option.value} className="mf-card-choice" data-has-symbol={option.symbol ? "true" : undefined} data-selected={active} data-disabled={disabled || option.disabled || undefined}>
          <input className="mf-sr" type={selectionMode === "multiple" ? "checkbox" : "radio"} name={name ?? id} value={option.value} checked={active} disabled={option.disabled} required={required && (selectionMode === "single" || selected.length === 0)}
            aria-labelledby={`${id}-${index}-title`} aria-describedby={option.description ? `${id}-${index}-description` : undefined}
            onChange={() => change(selectionMode === "single" ? [option.value] : active ? selected.filter(item => item !== option.value) : [...selected, option.value])} />
          <span className="mf-card-choice-mark" aria-hidden="true">{active && <AnimatedIcon name="check" size={16} />}</span>
          {option.symbol && <span className="mf-card-choice-symbol" aria-hidden="true"><CardGroupSymbol symbol={option.symbol} /></span>}
          <span className="mf-card-choice-copy"><span className="mf-card-choice-title" id={`${id}-${index}-title`}>{option.label}</span>
          {option.description && <span className="mf-card-choice-description" id={`${id}-${index}-description`}>{option.description}</span>}</span>
        </label>;
      })}
    </fieldset>
  </FormField>;
});

export interface ListProps
  extends HTMLAttributes<HTMLUListElement>, AppearanceProps {
  items: {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }[];
}
export const List = forwardRef<HTMLUListElement, ListProps>(
  function List(rawProps, ref) {
    const { items, className, ...props } = useAppearanceProps({ ...rawProps, variant: "outline" });

    return (
      <ul {...props} ref={ref} className={cx("mf-list", className)}>
        {items.map((item) => (
          <li key={item.id}>
            {item.onClick ? (
              <button
                type="button"
                className="mf-list-row"
                disabled={item.disabled}
                onClick={item.onClick}
              >
                {item.leading}
                <span className="mf-list-copy">
                  <strong>{item.title}</strong>
                  {item.description && (
                    <span className="mf-muted">{item.description}</span>
                  )}
                </span>
                {item.trailing}
              </button>
            ) : (
              <div className="mf-list-row">
                {item.leading}
                <span className="mf-list-copy">
                  <strong>{item.title}</strong>
                  {item.description && (
                    <span className="mf-muted">{item.description}</span>
                  )}
                </span>
                {item.trailing}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  },
);
export interface AvatarProps
  extends HTMLAttributes<HTMLSpanElement>, AppearanceProps {
  name: string;
  color?: MiscColor;
  src?: string;
  size?: "sm" | "md" | "lg";
}
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar(rawProps, ref) {
    const {
      name,
      color = identityColor(rawProps.name),
      src,
      size = "md",
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "primary" }, { preserveSize: true });

    const [failedSource, setFailedSource] = useState<string>();
    const failed = failedSource === src;
    return (
      <Tooltip content={name}>
      <span
        {...props}
        ref={ref}
        tabIndex={props.tabIndex ?? 0}
        role="img"
        aria-label={name}
        draggable={false}
        data-color={color}
        style={{ ...miscColorStyle(color), ...props.style }}
        className={cx("mf-avatar", `mf-avatar--${size}`, className)}
      >
        {src && !failed ? (
          <img key={src} src={src} alt="" draggable={false} onError={() => setFailedSource(src)} />
        ) : (
          name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0])
            .join("")
        )}
      </span>
      </Tooltip>
    );
  },
);
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement>, AppearanceProps {
  label: string;
  max?: number;
}
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(rawProps, ref) {
  const { children, label, max = 4, className, ...props } = useAppearanceProps({ ...rawProps, variant: "primary" });
  const avatars = Children.toArray(children);
  const limit = Math.max(1, Math.floor(max));
  const remaining = Math.max(0, avatars.length - limit);
  return <div {...props} ref={ref} role="group" aria-label={label} className={cx("mf-avatar-group", className)}>
    {avatars.slice(0, limit)}
    {remaining > 0 && <span className="mf-avatar mf-avatar-overflow" role="img" aria-label={`${remaining} ${label}`}>+{remaining}</span>}
  </div>;
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, AppearanceProps {
  /** A notification dot keeps its accessible name without displaying text. */
  presentation?: "label" | "dot";
  color?: MiscColor;
  tone?: "neutral" | "primary" | "success" | "error" | "warning" | "info";
}
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(rawProps, ref) {
    const { locale } = useMaterialFluid();
    const {
      tone = "primary",
      color,
      presentation = "label",
      children,
      className,
      ...props
    } = useAppearanceProps(useSizePolicy("badge", { ...rawProps, variant: "outline" }));

    return (
      <span
        {...props}
        ref={ref}
        data-presentation={presentation}
        role={props.role ?? (presentation === "dot" ? "img" : undefined)}
        aria-label={props['aria-label'] ?? (presentation === "dot" ? (typeof children === "string" ? children : locale === "fa" ? "اعلان جدید" : "New notification") : undefined)}
        data-color={color ?? (tone in statusColors ? statusColors[tone as keyof typeof statusColors] : undefined)}
        style={{ ...((color || tone in statusColors) ? miscColorStyle(color ?? statusColors[tone as keyof typeof statusColors]) : {}), ...props.style }}
        className={cx("mf-badge", `mf-tone--${tone}`, className)}
      >{presentation === "label" ? children : null}</span>
    );
  },
);
interface AccordionBaseProps extends Omit<HTMLAttributes<HTMLDivElement>,"dir">, AppearanceProps {
 dir?:"ltr"|"rtl";
 items:{value:string;title:ReactNode;content:ReactNode;disabled?:boolean}[];
}
export type AccordionProps = AccordionBaseProps & (
 {type?:"single";value?:string;defaultValue?:string;onValueChange?:(value:string)=>void}
 | {type:"multiple";value?:string[];defaultValue?:string[];onValueChange?:(value:string[])=>void}
);
export interface AccordionMotionSettings {
  stiffness: number;
  damping: number;
  mass: number;
  previewHeight: number;
  revealBlur: number;
  revealDuration: number;
}
export const accordionMotionDefaults: AccordionMotionSettings = {
  stiffness: 500,
  damping: 30,
  mass: 1.5,
  previewHeight: 10,
  revealBlur: 5,
  revealDuration: .2,
};
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(rawProps, ref) {
    const { accordion: motionSettings } = useContext(MotionPreviewContext);
    const {items,className,value,defaultValue,onValueChange:_onValueChange,type="single",...props}=useAppearanceProps({...rawProps,variant:"outline"});
    const [selected,setSelected]=useControllable<string|string[]>(value,defaultValue??(type==="multiple"?[]:""),next=>{
      if(rawProps.type==="multiple")rawProps.onValueChange?.(Array.isArray(next)?next:[]);
      else rawProps.onValueChange?.(typeof next==="string"?next:"");
    });
    const {dir}=useMaterialFluid();
    const children=items.map(item=><SpringAccordionItem key={item.value} item={item} open={Array.isArray(selected)?selected.includes(item.value):selected===item.value} settings={motionSettings}/>);
    const shared={...props,dir,ref,className:cx("mf-accordion",className)};
    return type==="multiple"?<AccordionPrimitive.Root {...shared} type="multiple" value={Array.isArray(selected)?selected:[]} onValueChange={setSelected}>{children}</AccordionPrimitive.Root>
      :<AccordionPrimitive.Root {...shared} type="single" collapsible value={typeof selected==="string"?selected:""} onValueChange={setSelected}>{children}</AccordionPrimitive.Root>;
  },
);

function SpringAccordionItem({ item, open, settings }: { item: AccordionProps["items"][number]; open: boolean; settings?: Partial<AccordionMotionSettings> }) {
  const { motion: mode, reducedMotion } = useMaterialFluid();
  const expressive = mode === "expressive" && !reducedMotion;
  const config = { ...accordionMotionDefaults, ...settings };
  const [holding, setHolding] = useState(false);
  const [contentVisible, setContentVisible] = useState(open);
  const inner = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  useLayoutEffect(() => {
    const element = inner.current;
    if (!element) return;
    const measure = () => setContentHeight(element.offsetHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (open) setContentVisible(true); }, [open]);
  const start = () => {
    if (item.disabled) return;
    if (!open) setContentVisible(false);
    setHolding(true);
  };
  const stop = () => { setHolding(false); };
  const spring = expressive
    ? motionTransition("resize")
    : { duration: 0 };
  return (
    <AccordionPrimitive.Item value={item.value} disabled={item.disabled} className="mf-accordion-item">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger asChild className="mf-accordion-trigger">
          <button onPointerDown={event => { if (event.button === 0) start(); }}
            onPointerUp={stop} onPointerCancel={stop} onPointerLeave={stop} onBlur={stop}
            onKeyDown={event => { if (!event.repeat && (event.key === " " || event.key === "Enter")) start(); }}
            onKeyUp={event => { if (event.key === " " || event.key === "Enter") stop(); }}>
            {item.title}<AnimatedIcon name="chevron-down" size={18} />
          </button>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content forceMount asChild className="mf-accordion-content" aria-hidden={!open} inert={!open}>
        <motion.div initial={false}
          style={{ height: "max(0px, var(--mf-accordion-height, 0) * 1px)" }}
          animate={{ "--mf-accordion-height": open ? contentHeight : expressive && holding ? config.previewHeight : 0 }} transition={spring}
          onAnimationComplete={() => { if (!open) setContentVisible(false); }}>
          <motion.div ref={inner} className="mf-accordion-inner" initial={false}
            style={{ visibility: open || (contentVisible && !holding) ? "visible" : "hidden" }}
            animate={open && expressive
              ? { opacity: [0, 1], filter: [`blur(${config.revealBlur}px)`, "blur(0px)"] }
              : { opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: open && expressive ? config.revealDuration : 0 }}>
            {item.content}
          </motion.div>
        </motion.div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
export const Divider = forwardRef<
  HTMLHRElement,
  HTMLAttributes<HTMLHRElement> & AppearanceProps & {orientation?:"horizontal"|"vertical";decorative?:boolean}
>(function Divider(rawProps, ref) {
  const { className, orientation="horizontal", decorative=false, ...props } = useAppearanceProps(useSizePolicy("divider", { ...rawProps, variant: "outline" }));

  return <hr {...props} ref={ref} role={decorative?"none":undefined} aria-orientation={decorative?undefined:orientation} data-orientation={orientation} className={cx("mf-divider", className)} />;
});
export interface DataTableProps<T> extends AppearanceProps {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId?: (row: T) => string;
  pageSize?: number;
  caption: string;
  loading?: boolean;
  stripe?: "none" | "rows" | "columns";
  autoSize?: boolean;
  selectable?: boolean;
  filterable?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  className?: string;
}
// TanStack memoizes row models by reference. A fresh disabled-filter array
// repeatedly resets pagination after every column-sizing update.
const disabledColumnFilters: ColumnFiltersState = [];

export function DataTable<T>(rawProps: DataTableProps<T>) {
  const {
    data,
    columns,
    getRowId,
    pageSize = 5,
    caption,
    loading = false,
    stripe,
    autoSize = true,
    selectable = true,
    filterable = false,
    onSelectionChange,
    className,
  } = useAppearanceProps({ ...rawProps, variant: "outline" });

  const { locale, dir } = useMaterialFluid();
  const fa = locale === "fa";
  const [localStripe, setLocalStripe] = useState<"none"|"rows"|"columns">("none");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState("");
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const container = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; pointer: number; start: number; width: number } | null>(null);
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, globalFilter: filter, rowSelection: selection, columnFilters: filterable ? columnFilters : disabledColumnFilters, columnSizing },
    onColumnFiltersChange: setColumnFilters,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onChange",
    defaultColumn: { size: 220, minSize: 120, maxSize: 900, filterFn: (row, id, value: TableFilterValue) => { const text = String(row.getValue(id) ?? ""); return text.toLocaleLowerCase(locale).includes(value.search.toLocaleLowerCase(locale)) && (!value.values.length || value.values.includes(text)); } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    onRowSelectionChange: (update) => {
      const next = typeof update === "function" ? update(selection) : update;
      setSelection(next);
      onSelectionChange?.(
        data.filter((row, i) => next[getRowId?.(row) ?? String(i)]),
      );
    },
    enableRowSelection: selectable,
    initialState: { pagination: { pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  const labelFor = (column: Column<T, unknown>) => typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
  const fitColumn = (column: Column<T, unknown>) => {
    const probe = document.createElement("span");
    probe.className = "mf-table-measure";
    container.current?.append(probe);
    const measure = (text: string) => { probe.textContent = text; return probe.getBoundingClientRect().width || text.length * 8; };
    let width = measure(String(labelFor(column))) + (filterable ? 104 : 64);
    for (const row of table.getPreFilteredRowModel().flatRows) width = Math.max(width, measure(String(row.getValue(column.id) ?? "")) + 40);
    probe.remove();
    setColumnSizing(current => ({ ...current, [column.id]: Math.min(column.columnDef.maxSize ?? 900, Math.max(column.columnDef.minSize ?? 120, Math.ceil(width))) }));
  };
  useEffect(() => {
    if (!autoSize || !container.current) return;
    let cancelled=false;
    const fit=()=>{
      if(cancelled||!container.current)return;
      const probe=document.createElement('span');probe.className='mf-table-measure';container.current.append(probe);
      probe.textContent='M';if(!probe.getBoundingClientRect().width){probe.remove();return;}
      const measure=(value:unknown)=>{probe.textContent=String(value??'');return probe.getBoundingClientRect().width;};
      const sizes:ColumnSizingState={};
      table.getVisibleLeafColumns().forEach(column=>{let width=measure(labelFor(column))+(filterable?104:64);for(const row of table.getPreFilteredRowModel().flatRows.slice(0,1000))width=Math.max(width,measure(row.getValue(column.id))+40);sizes[column.id]=Math.ceil(Math.max(column.columnDef.minSize??120,Math.min(column.columnDef.maxSize??900,width)));});
      probe.remove();setColumnSizing(sizes);
    };
    fit();void document.fonts?.ready.then(fit);
    return ()=>{cancelled=true;};
  }, [data, columns, loading, autoSize, filterable]);
  return (
    <div ref={container} className={cx("mf-data-table", className)} data-stripe={stripe ?? localStripe} aria-busy={loading}>
      <div className="mf-table-toolbar">
        <SearchField
          label={fa ? "جستجو در جدول" : "Filter rows"}
          placeholder={fa ? "نام، نقش…" : "Name, role…"}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select size="sm" label={fa?"رنگ‌بندی جدول":"Striping"} value={stripe??localStripe} onValueChange={value=>setLocalStripe(value as "none"|"rows"|"columns")} options={[{value:"none",label:fa?"بدون رنگ‌بندی":"None"},{value:"rows",label:fa?"ردیف‌های فرد":"Odd rows"},{value:"columns",label:fa?"ستون‌های فرد":"Odd columns"}]}/>
        {selectable && (
          <span className="mf-muted" role="status">
            {table.getSelectedRowModel().rows.length.toLocaleString(locale)}{" "}
            {fa ? "انتخاب شده" : "selected"}
          </span>
        )}
      </div>
      <div className="mf-table-scroll">
        <table style={{ tableLayout: "fixed", width: "100%", minWidth: (selectable ? 64 : 0) + table.getVisibleLeafColumns().reduce((sum, column, index) => sum + (index ? column.getSize() : column.columnDef.minSize ?? 120), 0) }}>
          <caption>{caption}</caption>
          <colgroup>
            {selectable && <col style={{ width: 64 }} />}
            {table.getVisibleLeafColumns().map((column, index) => <col key={column.id} data-anchor={index ? "end" : "start"} style={index ? { width: column.getSize() } : undefined} />)}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {selectable && (
                  <th scope="col">
                    <Checkbox
                      label={
                        <span className="mf-sr">
                          {fa ? "انتخاب همه" : "Select all rows"}
                        </span>
                      }
                      checked={
                        table.getIsAllRowsSelected()
                          ? true
                          : table.getIsSomeRowsSelected()
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(v) =>
                        table.toggleAllRowsSelected(v === true)
                      }
                    />
                  </th>
                )}
                {group.headers.map((header, columnIndex) => (
                  <th
                    key={header.id}
                    data-column-id={header.column.id}
                    data-anchor={columnIndex ? "end" : "start"}
                    scope="col"
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : header.column.getCanSort()
                            ? "none"
                            : undefined
                    }
                  >
                    <div className="mf-table-column-heading">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? <button className="mf-table-sort" type="button" onClick={header.column.getToggleSortingHandler()}>
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        <IconSwap identity={String(header.column.getIsSorted())}><AnimatedIcon name={header.column.getIsSorted() === "asc" ? "arrow_upward" : header.column.getIsSorted() === "desc" ? "arrow_downward" : "unfold_more"} /></IconSwap>
                      </button> : flexRender(header.column.columnDef.header, header.getContext())}
                      {filterable && header.column.getCanFilter() && <TableColumnFilter column={header.column} />}
                    </div>
                    {columnIndex > 0 && header.column.getCanResize() && <button type="button" className="mf-column-resizer" role="separator" aria-orientation="vertical" aria-label={`${fa ? "تغییر عرض" : "Resize"} ${labelFor(header.column)}`} aria-valuenow={Math.round(header.column.getSize())} aria-valuemin={header.column.columnDef.minSize ?? 120} aria-valuemax={header.column.columnDef.maxSize ?? 900}
                      onPointerDown={event => {
                        if (event.button !== 0) return;
                        event.preventDefault(); event.stopPropagation();
                        const widths: ColumnSizingState = {};
                        container.current?.querySelectorAll<HTMLTableCellElement>("th[data-column-id]").forEach(cell => { widths[cell.dataset.columnId!] = cell.getBoundingClientRect().width || table.getColumn(cell.dataset.columnId!)!.getSize(); });
                        setColumnSizing(current => ({ ...current, ...widths }));
                        drag.current = { id: header.column.id, pointer: event.pointerId, start: event.clientX, width: widths[header.column.id] ?? header.column.getSize() };
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                      onPointerMove={event => { const state = drag.current; if (state?.pointer !== event.pointerId) return; const width = state.width - (event.clientX - state.start) * (dir === "rtl" ? -1 : 1); setColumnSizing(current => ({ ...current, [state.id]: Math.max(header.column.columnDef.minSize ?? 120, Math.min(header.column.columnDef.maxSize ?? 900, width)) })); }}
                      onPointerUp={event => { if (drag.current?.pointer !== event.pointerId) return; drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
                      onPointerCancel={event => { if (drag.current?.pointer === event.pointerId) drag.current = null; }}
                      onLostPointerCapture={event => { if (drag.current?.pointer === event.pointerId) drag.current = null; }}
                      onDoubleClick={() => fitColumn(header.column)}
                      onKeyDown={event => { if (event.key === "Enter" || event.key === "Home") { event.preventDefault(); fitColumn(header.column); } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); const delta = (event.key === "ArrowRight" ? -10 : 10) * (dir === "rtl" ? -1 : 1); setColumnSizing(current => ({ ...current, [header.column.id]: Math.max(header.column.columnDef.minSize ?? 120, Math.min(header.column.columnDef.maxSize ?? 900, header.column.getSize() + delta)) })); } }} />}

                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  {fa ? "در حال بارگذاری…" : "Loading rows…"}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-selected={row.getIsSelected() || undefined}
                >
                  {selectable && (
                    <td>
                      <Checkbox
                        label={
                          <span className="mf-sr">{`${fa ? "انتخاب ردیف" : "Select row"} ${row.index + 1}`}</span>
                        }
                        checked={row.getIsSelected()}
                        onCheckedChange={(v) => row.toggleSelected(v === true)}
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell, columnIndex) => (
                    <td key={cell.id} data-anchor={columnIndex ? "end" : "start"} title={typeof cell.getValue() === "string" || typeof cell.getValue() === "number" ? String(cell.getValue()) : undefined}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && !table.getFilteredRowModel().rows.length && (
        <EmptyState
          title={fa ? "نتیجه‌ای یافت نشد" : "No matching rows"}
          description={
            fa ? "عبارت جستجو را تغییر دهید." : "Try a different search."
          }
        />
      )}
      <div className="mf-table-footer">
        <span className="mf-muted">
          {fa ? "صفحه" : "Page"}{" "}
          <bdi dir="ltr">{(table.getState().pagination.pageIndex + 1).toLocaleString(locale)} /{" "}
          {Math.max(1, table.getPageCount()).toLocaleString(locale)}</bdi>
        </span>
        <div>
          <Button
            variant="text"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            {fa ? "قبلی" : "Previous"}
          </Button>
          <Button
            variant="text"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            {fa ? "بعدی" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
