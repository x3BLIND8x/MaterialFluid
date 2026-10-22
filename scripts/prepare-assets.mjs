import {
  mkdir,
  copyFile,
  writeFile,
  readdir,
  readFile,
} from "node:fs/promises";
await mkdir("public/fonts", { recursive: true });
for (const [family, output] of [
  ["nunito", "nunito-latin.woff2"],
  ["jetbrains-mono", "jetbrains-mono-latin.woff2"],
]) {
  const base = `node_modules/@fontsource-variable/${family}`;
  const files = await readdir(`${base}/files`);
  const file =
    files.find((f) => f === `${family}-latin-wght-normal.woff2`) ??
    files.find((f) => f.includes("latin-wght-normal") && !f.includes("ext"));
  if (!file) throw Error(`Missing font ${family}`);
  await copyFile(`${base}/files/${file}`, `public/fonts/${output}`);
  await copyFile(`${base}/LICENSE`, `licenses/${family}.txt`);
}
await writeFile(
  "public/fonts.css",
  `@font-face{font-family:'Nunito Variable';src:url('./fonts/nunito-latin.woff2') format('woff2');font-weight:200 1000;font-style:normal;font-display:swap;unicode-range:U+0000-024F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF}\n@font-face{font-family:'Vazirmatn RD';src:url('./fonts/vazirmatn-rd.woff2') format('woff2');font-weight:100 900;font-style:normal;font-display:swap;unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F}\n@font-face{font-family:'JetBrains Mono Variable';src:url('./fonts/jetbrains-mono-latin.woff2') format('woff2');font-weight:100 800;font-style:normal;font-display:swap}\n`,
);
const notices = [
  "# Third-party notices",
  "Material Symbols Rounded vector contours are extracted from Google's official variable font and bundled locally under Apache-2.0. A build-time script estimates centerline reveal masks for thin, fill-invariant symbols; original vector artwork remains visible. Only Wi-Fi and Bluetooth use hand-authored state/slash drawings adapted from the earlier Forma SwitchGlyph. Motion drives animation; no icon service or CDN is used.",
  "Dependency licenses are retained in node_modules and apply to their respective packages. Material Color Utilities is Apache-2.0; React, Radix, Motion, TanStack Table and React DayPicker are MIT.",
];
for (const file of await readdir("licenses"))
  notices.push(`## ${file}\n\n${await readFile(`licenses/${file}`, "utf8")}`);
await writeFile("THIRD_PARTY_NOTICES.md", notices.join("\n\n"));
