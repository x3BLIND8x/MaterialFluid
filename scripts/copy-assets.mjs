import { cp, copyFile } from "node:fs/promises";
await cp("public/fonts", "dist/fonts", { recursive: true });
await copyFile("public/fonts.css", "dist/fonts.css");
