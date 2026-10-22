import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const cli = resolve(dirname(require.resolve("playwright/package.json")), "cli.js");
const result = spawnSync(process.execPath, [cli, "install", "chromium"], {
  stdio: "inherit",
  env: { ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? resolve(".cache/playwright"),
    PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT: process.env.PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT ?? "300000",
  },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
