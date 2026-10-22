import type { Column } from "@tanstack/react-table";
import { Popover } from "./overlays";
import { SearchField } from "./forms";
import { Button, IconButton } from "./controls";
import { AnimatedIcon } from "./icons";
import { useMaterialFluid } from "./provider";
export interface TableFilterValue { search: string; values: string[] }
export function TableColumnFilter<T>({ column }: { column: Column<T, unknown> }) {
  const { locale } = useMaterialFluid();
  const fa = locale === "fa";
  const label = typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
  const filter = (column.getFilterValue() as TableFilterValue | undefined) ?? { search: "", values: [] };
  const set = (next: TableFilterValue) => column.setFilterValue(next.search || next.values.length ? next : undefined);
  const values = [...new Set([...column.getFacetedUniqueValues().keys()].map(value => String(value ?? "")))].sort((a, b) => a.localeCompare(b, locale));
  return <Popover className="mf-column-filter" label={`${fa ? "فیلتر" : "Filter"} ${label}`} trigger={<IconButton variant="ghost" size="sm" aria-pressed={column.getIsFiltered()} label={`${fa ? "فیلتر" : "Filter"} ${label}`}><AnimatedIcon name="filter_list" /></IconButton>}>
    <SearchField label={`${fa ? "جستجو در" : "Search"} ${label}`} value={filter.search} onChange={event => set({ ...filter, search: event.target.value })} />
    <p className="mf-column-filter-label">{fa ? "انتخاب مقدارها" : "Choose values"}</p>
    <div className="mf-column-filter-values" role="listbox" aria-label={`${label}: ${fa ? "مقدارها" : "values"}`} aria-multiselectable="true">
      {values.map(value => <button key={value} type="button" role="option" aria-selected={filter.values.includes(value)} onClick={() => set({ ...filter, values: filter.values.includes(value) ? filter.values.filter(item => item !== value) : [...filter.values, value] })}>{value || (fa ? "خالی" : "(Empty)")}</button>)}
    </div>
    <Button variant="ghost" size="sm" disabled={!column.getIsFiltered()} onClick={() => column.setFilterValue(undefined)}>{fa ? "پاک کردن فیلتر" : "Clear filter"}</Button>
  </Popover>;
}
