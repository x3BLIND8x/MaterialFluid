import { expect, type Page } from "@playwright/test";

export async function selectSize(page: Page, size: string) {
  const trigger = page.locator("#component-size");
  await trigger.click();
  const labels: Record<string, RegExp> = {sm: /^(Small|کوچک)$/, md: /^(Medium|متوسط)$/, lg: /^(Large|بزرگ)$/};
  await page.getByRole("option", {name: labels[size]}).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
}
