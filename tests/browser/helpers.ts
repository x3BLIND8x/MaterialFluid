import { expect, type Page } from "@playwright/test";

export async function selectSize(page: Page, size: string) {
  const labels: Record<string, RegExp> = {sm: /^(Small|کوچک)$/, md: /^(Medium|متوسط)$/, lg: /^(Large|بزرگ)$/};
  const segmented = page.locator('.mf-toggle-group[aria-label="Size"], .mf-toggle-group[aria-label="اندازه"]');
  if (await segmented.count()) { await segmented.getByRole("button", {name: labels[size]}).click(); return; }
  const trigger = page.locator("#component-size");
  await trigger.click();
  await page.getByRole("option", {name: labels[size]}).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
}
