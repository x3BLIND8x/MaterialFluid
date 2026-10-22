import { createServer } from "vite";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const server = await createServer({
  root,
  server: { host: "127.0.0.1", port: 5173, strictPort: false, open: false },
});
await server.listen();
const address = server.httpServer.address();
const url = `http://127.0.0.1:${address.port}/`;
console.log("\nMaterialFluid local showcase");
console.log(`IP: 127.0.0.1    Port: ${address.port}`);
console.log(
  process.stdout.isTTY ? `\u001b]8;;${url}\u0007${url}\u001b]8;;\u0007` : url,
);
console.log("\nClosing the browser does not stop the server.");
console.log("Close this terminal or press Ctrl+C to stop it.\n");
if (!process.argv.includes("--no-open")) {
  if (process.platform === "win32") {
    const browser = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Start-Process -FilePath '${url}'`,
      ],
      { windowsHide: true, encoding: "utf8" },
    );
    if (browser.status !== 0)
      console.error("Could not open the default browser. Open the link above.");
  } else {
    const browser = spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], {
      detached: true,
      stdio: "ignore",
    });
    browser.on("error", () => console.error("Could not open the default browser. Open the link above."));
    browser.on("exit", (code) => {
      if (code !== 0) console.error("Could not open the default browser. Open the link above.");
    });
    browser.unref();
  }
}
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  await server.close();
  console.log("Showcase server stopped.");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
