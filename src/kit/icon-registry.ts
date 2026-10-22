import { materialIcons } from "./icon-map";
import type { IconName } from "./icon-names";
import type { MaterialIconData } from "./icon-types";
const registry: Record<string, MaterialIconData> = { ...materialIcons };
/** Register an optional full pack or a picked subset before rendering its icons. */
export function registerMaterialIcons(icons: Record<string, MaterialIconData>) {
  Object.assign(registry, icons);
}
export function getMaterialIcon(name: IconName): MaterialIconData {
  return registry[name] ?? registry.help;
}
export type { IconName, MaterialIconData };
