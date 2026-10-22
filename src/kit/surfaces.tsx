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
  useRef,
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
import { cx } from "./utils";
import { useMaterialFluid } from "./provider";
import { Button, Checkbox } from "./controls";
import { SearchField } from "./forms";
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
  src?: string;
  size?: "sm" | "md" | "lg";
}
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar(rawProps, ref) {
    const {
      name,
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
  tone?: "neutral" | "primary" | "success" | "error" | "warning" | "info";
}
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(rawProps, ref) {
    const {
      tone = "primary",
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    return (
      <span
        {...props}
        ref={ref}
        className={cx("mf-badge", `mf-tone--${tone}`, className)}
      />
    );
  },
);
export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "dir">, AppearanceProps {
  dir?: "ltr" | "rtl";
  items: {
    value: string;
    title: ReactNode;
    content: ReactNode;
    disabled?: boolean;
  }[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(rawProps, ref) {
    const { items, className, ...props } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const { dir } = useMaterialFluid();
    return (
      <AccordionPrimitive.Root
        dir={dir}
        {...props}
        ref={ref}
        type="single"
        collapsible
        className={cx("mf-accordion", className)}
      >
        {items.map((item) => (
          <AccordionPrimitive.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="mf-accordion-item"
          >
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="mf-accordion-trigger">
                {item.title}
                <AnimatedIcon name="chevron-down" size={18} />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="mf-accordion-content">
              <div className="mf-accordion-inner">{item.content}</div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    );
  },
);
export const Divider = forwardRef<
  HTMLHRElement,
  HTMLAttributes<HTMLHRElement> & AppearanceProps
>(function Divider(rawProps, ref) {
  const { className, ...props } = useAppearanceProps({ ...rawProps, variant: "outline" });

  return <hr {...props} ref={ref} className={cx("mf-divider", className)} />;
});
export interface DataTableProps<T> extends AppearanceProps {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId?: (row: T) => string;
  pageSize?: number;
  caption: string;
  loading?: boolean;
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
    selectable = true,
    filterable = false,
    onSelectionChange,
    className,
  } = useAppearanceProps({ ...rawProps, variant: "outline" });

  const { locale, dir } = useMaterialFluid();
  const fa = locale === "fa";
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
  return (
    <div ref={container} className={cx("mf-data-table", className)} aria-busy={loading}>
      <div className="mf-table-toolbar">
        <SearchField
          label={fa ? "جستجو در جدول" : "Filter rows"}
          placeholder={fa ? "نام، نقش…" : "Name, role…"}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
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
          {(table.getState().pagination.pageIndex + 1).toLocaleString(locale)} /{" "}
          {Math.max(1, table.getPageCount()).toLocaleString(locale)}
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
