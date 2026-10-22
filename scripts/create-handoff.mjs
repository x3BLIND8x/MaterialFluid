import { deflateRawSync } from "node:zlib";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stageRoot = resolve(root, ".cache", `handoff-stage-${Date.now()}`);
const payload = join(stageRoot, "MaterialFluid");
const zipPath = join(root, "MaterialFluid-v0.1.zip");
const omittedDirectories = new Set([
  ".cache",
  ".codex",
  ".agents",
  ".aws",
  ".git",
  ".impeccable",
  ".vite",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "showcase-dist",
  "snapshots",
  "test-results",
  "__pycache__",
]);
const omittedFiles = new Set(["materialfluid-0.1.0.tgz"]);
const omittedPath = (path) =>
  path.split(/[\\/]/).some((part) => omittedDirectories.has(part)) ||
  path === "src/kit/vendor/material" ||
  path.startsWith("src/kit/vendor/material/");
const withinRoot = (path) => path === root || path.startsWith(`${root}${sep}`);

for (const path of [stageRoot, payload]) {
  if (!withinRoot(path))
    throw Error(`Refusing to stage outside project: ${path}`);
}
await mkdir(payload, { recursive: true });

const included = [];
const excluded = new Map();
async function copyTree(source, destination, rel = "") {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const nextRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (omittedPath(nextRel)) {
      const key =
        nextRel.split("/").find((part) => omittedDirectories.has(part)) ??
        nextRel;
      excluded.set(key, (excluded.get(key) ?? 0) + 1);
      continue;
    }
    if (entry.isSymbolicLink()) {
      excluded.set("symbolic links", (excluded.get("symbolic links") ?? 0) + 1);
      continue;
    }
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) {
      await mkdir(to, { recursive: true });
      await copyTree(from, to, nextRel);
    } else if (
      entry.isFile() &&
      !omittedFiles.has(nextRel) &&
      !/\.(?:tar|tgz|zip|log|tmp)$/i.test(entry.name) &&
      (!/^\.env(?:\.|$)/i.test(entry.name) ||
        entry.name.toLowerCase() === ".env.example")
    ) {
      await mkdir(dirname(to), { recursive: true });
      await copyFile(from, to);
      included.push(nextRel);
    } else {
      excluded.set(
        "generated archives, logs, and local environment files",
        (excluded.get(
          "generated archives, logs, and local environment files",
        ) ?? 0) + 1,
      );
    }
  }
}
await copyTree(root, payload);
const manifest = [
  "# MaterialFluid handoff archive",
  "",
  `Included source files: ${included.length}`,
  `Excluded residual entries: ${[...excluded.values()].reduce((sum, n) => sum + n, 0)}`,
  "",
  "Excluded dependency folders, build outputs, caches, reviews, test reports, generated package archives, and the obsolete pre-generated Material SVG folder. The icon generator, generated icon data, complete showcase, public fonts, licenses, package lock, and Linux/Windows launchers are included.",
  "",
  "After extracting MaterialFluid-v0.1.zip:",
  "1. Open the MaterialFluid folder.",
  "2. Run `npm ci`.",
  "3. Run `./Open Showcase.sh` on Linux or `Open Showcase.cmd` on Windows.",
  "",
  "Node.js 22.12+ and npm are required. Python icon-generation requirements are documented in README.md.",
  "",
  "Excluded categories:",
  ...[...excluded.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => `- ${name}: ${count}`),
].join("\n");
await writeFile(join(payload, "HANDOFF_MANIFEST.md"), `${manifest}\n`);

// Standard ZIP with Unix permissions; no platform-specific archiver is required.
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = (n >>> 1) ^ (n & 1 ? 0xedb88320 : 0);
  return n >>> 0;
});
const crc32 = bytes => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255];
  return (crc ^ 0xffffffff) >>> 0;
};
const local = [], central = [];
let offset = 0;
const files = [...new Set([...included, "HANDOFF_MANIFEST.md"])].sort();
for (const file of files) {
  const bytes = await readFile(join(payload, file));
  const packed = deflateRawSync(bytes);
  const name = Buffer.from(`MaterialFluid/${file}`);
  const crc = crc32(bytes);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x800, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(33, 12); // 1980-01-01, reproducible archive timestamp
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(packed.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(name.length, 26);
  const directory = Buffer.alloc(46);
  directory.writeUInt32LE(0x02014b50);
  directory.writeUInt16LE(0x0314, 4);
  header.copy(directory, 6, 4, 30);
  const mode = file.endsWith(".sh") ? 0o100755 : 0o100644;
  directory.writeUInt32LE((mode * 65536) >>> 0, 38);
  directory.writeUInt32LE(offset, 42);
  local.push(header, name, packed);
  central.push(directory, name);
  offset += header.length + name.length + packed.length;
}
const directoryBytes = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directoryBytes.length, 12);
end.writeUInt32LE(offset, 16);
const zipBytes = Buffer.concat([...local, directoryBytes, end]);
await writeFile(zipPath, zipBytes);
const zipStat = await stat(zipPath);
const digest = createHash("sha256").update(zipBytes).digest("hex");
console.log(JSON.stringify({ archive: zipPath, includedFiles: files.length,
  zipBytes: zipStat.size, sha256: digest, excluded: Object.fromEntries(excluded) }, null, 2));
