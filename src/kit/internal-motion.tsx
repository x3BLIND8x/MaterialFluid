import { createContext } from "react";
import type { AccordionMotionSettings } from "./surfaces";
import type { AlertDialogMotionSettings, MenuMotionSettings } from "./overlays";
import type { ButtonMotionSettings, TextMorphSettings } from "./provider";

// Private composition behavior and isolated showcase experiments; no package export.
export const ButtonCompositionContext = createContext({ size: true, color: true, press: true, ripple: true });
export const MotionPreviewContext = createContext<{ buttonMotion?: Partial<ButtonMotionSettings>; textMorph?: Partial<TextMorphSettings>; accordion?: Partial<AccordionMotionSettings>; dialog?: Partial<AlertDialogMotionSettings>; menu?: Partial<MenuMotionSettings> }>({});
