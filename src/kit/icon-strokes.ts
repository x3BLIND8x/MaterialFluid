import { getMaterialIcon, type IconName } from "./icon-registry";
// Only connection state transitions need hand-authored semantics.
const wifi = [
  "M2 8a16 16 0 0 1 20 0",
  "M5 12a11 11 0 0 1 14 0",
  "M8 16a6 6 0 0 1 8 0",
  "M12 20h.01",
];
const bluetooth = ["M7 7l10 10-5 5V2l5 5L7 17"];
export const connectionStrokes: Partial<Record<IconName, readonly string[]>> = {
  wifi,
  "wifi-off": wifi,
  wifi_off: wifi,
  bluetooth,
  "bluetooth-off": bluetooth,
  bluetooth_disabled: bluetooth,
};
export const isStrokeIcon = (name: IconName) =>
  !!(connectionStrokes[name] ?? getMaterialIcon(name).strokes);
