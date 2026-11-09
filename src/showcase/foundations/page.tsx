import type { FoundationPageId } from "./model";
import type { FoundationProps } from "./frame";
import { TypographyFoundation } from "./typography";
import { ShapeFoundation } from "./shape";
import { AccessibilityFoundation } from "./accessibility";

export default function FoundationPage({ id, ...props }: FoundationProps & { id: Exclude<FoundationPageId, "color" | "motion"> }) {
  return id === "typography" ? <TypographyFoundation {...props}/> : id === "shape" ? <ShapeFoundation {...props}/> : <AccessibilityFoundation {...props}/>;
}
