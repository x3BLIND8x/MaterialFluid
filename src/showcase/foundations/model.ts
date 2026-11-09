export const foundationPages = [
  ["color", "Color", "رنگ"], ["typography", "Typography", "تایپوگرافی"], ["shape", "Shape", "شکل"],
  ["motion", "Motion", "حرکت"], ["accessibility", "Accessibility", "دسترس‌پذیری"],
] as const;
export type FoundationPageId = typeof foundationPages[number][0];
