import { spawnSync } from "node:child_process";
import { mkdir, writeFile, readFile, cp } from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
const root = process.cwd();
const npmCLI = process.env.npm_execpath ?? [
  join(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js"),
  join(dirname(process.execPath), "../lib/node_modules/npm/bin/npm-cli.js"),
].find(existsSync);
if (!npmCLI) throw Error("Run this check with npm run smoke so npm can be located.");
const npmEntry = realpathSync(npmCLI);
const run = (args, cwd = root) => {
  const r = spawnSync(
    process.execPath,
    [npmEntry, ...args, "--cache", join(root, ".cache/npm")],
    { cwd, encoding: "utf8" },
  );
  if (r.status !== 0) throw Error(r.stderr || r.stdout);
  if (!r.stdout.trim() && args.includes("--json")) throw Error("npm returned no package metadata; check npm cache permissions.");
  return r.stdout;
};
const packResult = JSON.parse(run(["pack", "--json", "--offline", "--ignore-scripts"]));
const packed = Array.isArray(packResult) ? packResult[0] : Object.values(packResult)[0];
const digest = createHash("sha256")
  .update(await readFile(packed.filename))
  .digest("hex")
  .slice(0, 16);
const tarball = resolve(".cache/smoke-packs", `materialfluid-${digest}.tgz`);
await mkdir(dirname(tarball), { recursive: true });
await cp(resolve(packed.filename), tarball);
const dir = resolve(".cache/package-smoke");
await mkdir(dir, { recursive: true });
await writeFile(
  join(dir, "package.json"),
  JSON.stringify({
    name: "materialfluid-smoke",
    private: true,
    type: "module",
    dependencies: {
      materialfluid: `file:${tarball.replaceAll("\\", "/")}`,
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
  }),
);
run(["install", "--prefer-offline", "--ignore-scripts", "--no-audit", "--no-fund"], dir);
await writeFile(
  join(dir, "smoke.mjs"),
  `import React from 'react';import { renderToStaticMarkup } from 'react-dom/server';import * as kit from 'materialfluid';const html=renderToStaticMarkup(React.createElement(kit.Button,null,'Working'));if(!html.includes('Working'))throw Error('Render failed');const expected=${JSON.stringify(["Button", "IconButton", "FAB", "Toggle", "ToggleGroup", "Checkbox", "RadioGroup", "Switch", "Slider", "TextField", "Textarea", "PasswordField", "NumberField", "SearchField", "Select", "Combobox", "MultiSelect", "OTPInput", "FileInput", "FormField", "Calendar", "DatePicker", "DateRangePicker", "TimePicker", "Tabs", "Breadcrumbs", "Pagination", "TopAppBar", "NavigationRail", "SideNavigation", "TableOfContents", "Stepper", "Link", "Card", "List", "Avatar", "AvatarGroup", "Badge", "Accordion", "Divider", "DataTable", "Alert", "Toast", "Snackbar", "NotificationCenter", "useNotifications", "Progress", "Spinner", "Skeleton", "EmptyState", "Dialog", "AlertDialog", "Drawer", "BottomSheet", "Popover", "Menu", "Tooltip", "AnimatedIcon"])};for(const name of expected)if(!kit[name])throw Error('Missing '+name);console.log(expected.length+' exports and server render passed');`,
);
const result = spawnSync(process.execPath, ["smoke.mjs"], {
  cwd: dir,
  encoding: "utf8",
});
if (result.status !== 0) throw Error(result.stderr);
console.log(result.stdout.trim());
await writeFile(
  join(dir, "icons-smoke.mjs"),
  `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnimatedIcon, MaterialFluidProvider, registerMaterialIcons } from 'materialfluid';
import { materialIcons } from 'materialfluid/icons';
if (Object.keys(materialIcons).length !== 4322) throw Error('Incomplete icon pack');
registerMaterialIcons({ rocket_launch: materialIcons.rocket_launch });
const html = renderToStaticMarkup(React.createElement(MaterialFluidProvider, null,
  React.createElement(AnimatedIcon, {name:'rocket_launch'})));
if (!html.includes(materialIcons.rocket_launch.paths[0])) throw Error('Optional icon registration failed');
console.log('Complete optional icon pack and registered icon render passed');
`,
);
const iconSmoke = spawnSync(process.execPath, ["icons-smoke.mjs"], {
  cwd: dir,
  encoding: "utf8",
});
if (iconSmoke.status !== 0) throw Error(iconSmoke.stderr);
console.log(iconSmoke.stdout.trim());
const installedEntry = await readFile(
  join(dir, "node_modules/materialfluid/dist/index.js"),
);
const currentEntry = await readFile("dist/index.js");
if (!installedEntry.equals(currentEntry))
  throw Error("Consumer installed a stale package build.");
for (const path of [
  "dist/index.d.ts",
  "dist/styles.css",
  "dist/fonts.css",
  "dist/fonts/vazirmatn-rd.woff2",
])
  await readFile(path);
await cp(resolve(packed.filename), join(dir, packed.filename));
console.log("Package assets present:", packed.filename);
const examples = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "scripts/check-examples.mjs"],
  { encoding: "utf8" },
);
if (examples.status !== 0) throw Error(examples.stderr || examples.stdout);
console.log(examples.stdout.trim());
