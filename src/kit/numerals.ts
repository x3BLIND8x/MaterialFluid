/** Normalize user-facing digits without changing signs, separators or padding. */
export function latinDigits(value: string) {
  return value.replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632));
}
export function localizeDigits(value: string, locale: "en" | "fa") {
  const normalized = latinDigits(value);
  return locale === "fa" ? normalized.replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]) : normalized;
}
