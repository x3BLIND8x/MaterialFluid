import { useState, type ReactNode, type Ref } from "react";
import { Tabs } from "../../kit/navigation";
import { ToggleGroup, type ChoiceOption } from "../../kit/controls";
import { useMaterialFluid } from "../../kit/provider";
import { foundationPages, type FoundationPageId } from "./model";
import "./styles.css";

export interface FoundationProps { heading: Ref<HTMLHeadingElement>; onEnableMotion: () => void; }
export function FoundationFrame({ id, heading, configuration, documentation }: { id: FoundationPageId; heading: Ref<HTMLHeadingElement>; configuration: ReactNode; documentation: ReactNode }) {
  const { locale } = useMaterialFluid(), fa = locale === "fa";
  const [view, setView] = useState("configuration");
  const title = foundationPages.find(item => item[0] === id)!;
  return <div className="foundation-page"><div className="component-intro"><div><h1 ref={heading} tabIndex={-1}>{fa ? title[2] : title[1]}</h1></div></div><Tabs label={fa ? "نمای زیرساخت" : "Foundation view"} value={view} onValueChange={setView} items={[
    { value: "configuration", label: fa ? "پیکربندی" : "Configuration", content: configuration },
    { value: "documentation", label: fa ? "مستندات" : "Documentation", content: documentation },
  ]}/></div>;
}
export function Choice({ label, ...props }: { label: string; value: string; onValueChange: (value: string) => void; options: ChoiceOption[] }) {
  return <fieldset className="foundation-control-group"><legend>{label}</legend><ToggleGroup {...props} label={label} size="sm"/></fieldset>;
}
