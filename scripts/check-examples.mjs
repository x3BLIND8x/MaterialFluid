import { mkdir, writeFile, rm } from "node:fs/promises";
import { catalogue } from "../src/showcase/catalogue.ts";
import { usageFor } from "../src/showcase/usage.ts";
import { spawnSync } from "node:child_process";
const folder = ".cache/package-smoke/examples";
await rm(folder, { recursive: true, force: true });
await mkdir(folder, { recursive: true });
for (const entry of catalogue) {
  await writeFile(`${folder}/${entry.id}.tsx`, usageFor(entry));
  await writeFile(`${folder}/${entry.id}-appearance.tsx`, usageFor(entry, {variant:"tertiary", size:"sm"}));
}
await writeFile(`${folder}/presentation-policy.tsx`, `
import { Progress, FileInput, type ProgressWaveOptions } from "materialfluid";
const wave: ProgressWaveOptions = { waveLength: 60, waveHeight: 20, waveVelocity: 31, direction: "tail", waveThickness: 5, trackThickness: 20, incremental: true };
// @ts-expect-error FileInput intentionally has no Large variant.
const unsupported = <FileInput label="Attachment" size="lg" />;
void unsupported;
export default function Presentations() { return <>
  <Progress label="Upload" value={65} wave={wave} />
  <Progress label="Upload" value={30} presentation="segmented" segments={8} />
  <Progress label="Update" value={30} presentation="status" status="Updating" remaining="8s left" />
  <FileInput label="Attachment" size="sm" />
  <FileInput label="Attachment" size="md" />
</>; }
`);
await writeFile(
  ".cache/package-smoke/tsconfig.examples.json",
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
    },
    include: ["examples/*.tsx"],
  }),
);
const result = spawnSync(
  process.execPath,
  [
    "node_modules/typescript/bin/tsc",
    "-p",
    ".cache/package-smoke/tsconfig.examples.json",
  ],
  { encoding: "utf8" },
);
if (result.status !== 0) throw Error(result.stdout || result.stderr);
console.log(
  `All ${catalogue.length} default and ${catalogue.length} size examples, plus Progress presentations and the FileInput size policy, typecheck against the installed package.`,
);
