import type { Entry } from "./catalogue";
import type { AppearanceProps } from "../kit/appearance";
export function usageFor(entry: Entry, appearance?: AppearanceProps) {
  const names = new Set([entry.name, "MaterialFluidProvider"]);
  for (const match of entry.code.matchAll(/<([A-Z][A-Za-z]+)/g))
    names.add(match[1]);
  const declarations: string[] = [];
  const fixedAppearance = ["forms", "navigation", "surfaces", "feedback", "overlays"].includes(entry.family) || ["toggle", "toggle-group", "checkbox", "radio-group", "switch", "slider"].includes(entry.id);
  const variantAttribute = fixedAppearance ? "" : ` variant="${appearance?.variant ?? "primary"}"`;
  const code = appearance
    ? entry.code
        .replace(
          new RegExp(`<${entry.name}(?=[\\s/>])([^>]*?)>`),
          (_match, attributes: string) => {
            const clean = attributes.replace(/\s+(?:variant|size)=(?:"[^"]*"|\{[^}]*\})/g, "");
            const size = entry.name === "NotificationCenter" ? "" : ` size="${appearance.size ?? "md"}"`;
            return `<${entry.name}${variantAttribute}${size}${clean}>`;
          },
        )
    : entry.code;
  if (/\benabled\b/.test(code))
    declarations.push("const [enabled, setEnabled] = useState(true);");
  if (/\bsetSelected\b/.test(code))
    declarations.push("const [selected, setSelected] = useState(true);");
  if (/\bsetOpen\b/.test(code))
    declarations.push("const [open, setOpen] = useState(true);");
  if (/\bsetRange\b/.test(code))
    declarations.push(
      'const [range, setRange] = useState<DateRangeValue>({ from: "2026-10-14", to: "2026-10-20" });',
    );
  const options =
    '[{ value: "design", label: "Design" }, { value: "development", label: "Development" }]';
  for (const variable of [
    "views",
    "options",
    "roles",
    "countries",
    "skills",
    "tags",
  ])
    if (
      new RegExp(`\\b${variable}\\b`).test(code) &&
      new RegExp(`(?:options=\\{${variable}\\})`).test(code)
    )
      declarations.push(`const ${variable} = ${options};`);
  if (/\btabs\b/.test(code))
    declarations.push(
      'const tabs = [{ value: "overview", label: "Overview", content: <p>Project overview.</p> }, { value: "details", label: "Details", content: <p>Project details.</p> }];',
    );
  if (/\bdestinations\b/.test(code))
    declarations.push(
      'const destinations = [{ value: "home", label: "Home" }, { value: "settings", label: "Settings" }];',
    );
  if (/\bsteps\b/.test(code))
    declarations.push(
      'const steps = [{ value: "account", label: "Account" }, { value: "details", label: "Details" }];',
    );
  if (/\bsections\b/.test(code))
    declarations.push(
      'const sections = [{ value: "details", title: "Details", content: <p>Supporting information.</p> }];',
    );
  if (/\bitems\b/.test(code) && entry.name === "List")
    declarations.push(
      'const items = [{ id: "1", title: "Nora Chen", description: "Designer" }];',
    );
  if (/\bactions\b/.test(code) && entry.name === "Menu")
    declarations.push(
      'const actions = [{ id: "copy", label: "Duplicate", onSelect: () => console.log("Duplicate") }];',
    );
  if (/\barchive\b/.test(code))
    declarations.push(
      'const archive = () => console.log("Archive confirmed");',
    );
  if (entry.name === "DataTable")
    declarations.push(
      'const people = [{ id: "1", name: "Nora Chen" }, { id: "2", name: "Arman Rezaei" }];',
      'const columns: ColumnDef<(typeof people)[number]>[] = [{ accessorKey: "name", header: "Name" }];',
    );
  const imports = [
    ...(declarations.some((d) => d.includes("useState"))
      ? ['import { useState } from "react";']
      : []),
    `import { ${[...names].join(", ")}${code.includes("setRange") ? ", type DateRangeValue" : ""} } from "materialfluid";`,
    ...(entry.name === "DataTable"
      ? ['import type { ColumnDef } from "@tanstack/react-table";']
      : []),
    'import "materialfluid/styles.css";',
    'import "materialfluid/fonts.css";',
  ];
  return `${imports.join("\n")}\n\nexport default function Example() {\n${declarations.map((d) => "  " + d).join("\n")}${declarations.length ? "\n" : ""}  return (\n    <MaterialFluidProvider>\n      ${code}\n    </MaterialFluidProvider>\n  );\n}`;
}
