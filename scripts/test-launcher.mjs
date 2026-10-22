import { spawn } from "node:child_process";
import { resolve } from "node:path";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(".cache/playwright");
const { chromium } = await import("@playwright/test");
const child = spawn(
  process.execPath,
  ["scripts/launch-showcase.mjs", "--no-open"],
  { stdio: ["pipe", "pipe", "pipe"] },
);
let text = "";
const url = await new Promise((resolve, reject) => {
  const timer = setTimeout(
    () => reject(Error("Launcher did not become ready")),
    20000,
  );
  child.stdout.on("data", (chunk) => {
    text += chunk.toString();
    const match = text.match(/http:\/\/127\.0\.0\.1:\d+\//);
    if (match) {
      clearTimeout(timer);
      resolve(match[0]);
    }
  });
  child.on("error", reject);
});
try {
  const browser = await chromium.launch({ channel: "chromium", headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  await page.getByRole("heading", { name: "Button", exact: true }).waitFor();
  await page.close();
  await browser.close();
  if ((await fetch(url)).status !== 200)
    throw Error("Closing tab stopped server");
  console.log("Launcher: URL printed; browser close leaves server running.");
} finally {
  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));
}
try {
  await fetch(url);
  throw Error("Server remained running after terminal process ended");
} catch (error) {
  if (error.message.includes("remained running")) throw error;
}
console.log("Launcher: terminating its console process stops its server.");
