import { test, expect } from "@playwright/test";
import { selectSize } from "./helpers";

test("file upload supports keyboard selection, real progress rows, drop validation and sizing", async ({ page }) => {
  await page.goto("/#/components/file-input");
  const stage = page.locator(".live-stage");
  const target = stage.locator(".mf-file-surface").first();
  for (const [size, height] of [["sm", 100], ["md", 210], ["lg", 240]] as const) {
    await selectSize(page, size);
    await expect(target).toHaveCSS("border-top-style", "dashed");
    await expect(target).toHaveCSS("display", size === "sm" ? "grid" : "flex");
    await expect(target.locator(".mf-file-limit")).toHaveText("Up to 1 file");
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(height);
  }
  await target.focus();
  const chooser = page.waitForEvent("filechooser");
  await target.press("Enter");
  await (await chooser).setFiles({ name: "report.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(10240) });
  const row = stage.locator(".mf-file-row");
  await expect(row).toHaveCount(1);
  const progress = row.getByRole("progressbar");
  await expect(progress).toHaveAttribute("aria-valuenow", /\d+/);
  await expect(row).toHaveAttribute("data-status", "completed");
  await expect(progress).toHaveAttribute("aria-valuenow", "100");
  const input = stage.locator('input[type="file"]').first();
  expect(await input.evaluate((node: HTMLInputElement) => node.files?.[0].name)).toBe("report.pdf");
  await row.getByRole("button", { name: "Remove report.pdf" }).click();
  await expect(row).toHaveCount(0);
  expect(await input.evaluate((node: HTMLInputElement) => node.files?.length)).toBe(0);
  const drop = stage.locator(".mf-file-drop").first();
  await drop.evaluate(node => {
    const transfer = new DataTransfer(); transfer.items.add(new File(["wrong"], "wrong.txt", { type: "text/plain" }));
    node.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  });
  await expect(stage.getByRole("alert")).toHaveText("Choose a supported file type.");
  await drop.evaluate(node => {
    const transfer = new DataTransfer(); transfer.items.add(new File(["pdf"], "dropped.pdf", { type: "application/pdf" }));
    node.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  });
  await expect(drop).toHaveAttribute("data-drop-state", "active");
  await expect(target).toContainText("Drop your files here");
  await drop.evaluate(node => {
    const transfer = new DataTransfer(); transfer.items.add(new File(["pdf"], "dropped.pdf", { type: "application/pdf" }));
    node.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  });
  await expect(row).toHaveCount(1);
  await expect(stage.getByRole("alert")).toHaveCount(0);
});

test("file upload fits Persian mobile, localizes progress and honors reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/components/file-input");
  await page.evaluate(() => localStorage.setItem("materialfluid.preferences", JSON.stringify({ locale: "fa", motion: "expressive" })));
  await page.reload();
  const stage = page.locator(".live-stage");
  await selectSize(page, "sm");
  await expect(stage.locator(".mf-file-limit").nth(1)).toHaveText("حداکثر ۵ فایل");
  await stage.locator('input[type="file"]').first().setInputFiles({ name: "گزارش-پروژه.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(10240) });
  await expect(stage.locator(".mf-file-status")).toContainText(/[۰-۹]/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".mf-root").first()).toHaveAttribute("data-motion", "reduced");
  await expect(stage.locator(".mf-file-row")).toHaveAttribute("data-status", "completed");
});
