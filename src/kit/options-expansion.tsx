import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useMaterialFluid } from "./provider";

/** One outline surrounds the original field and its portalled options. */
export function useOptionsExpansion(open: boolean, anchor: RefObject<HTMLElement | null>) {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [side, setSide] = useState<"top" | "bottom">("bottom");
  const placed = useRef(false);
  useLayoutEffect(() => {
    const node = anchor.current;
    const surface = node?.matches(".mf-input-wrap, .mf-select-trigger") ? node : node?.querySelector<HTMLElement>(".mf-input-wrap, .mf-select-trigger");
    if (!surface) return;
    surface.dataset.optionsOpen = String(open);
    if (!open) placed.current = false;
    if (!panel || (!open && !panel.isConnected)) { delete surface.dataset.optionsExpanded; return; }
    if (open && !placed.current) {
      const rect = surface.getBoundingClientRect();
      const height = panel.querySelector<HTMLElement>(".mf-options-body")?.scrollHeight ?? 300;
      const below = window.innerHeight - rect.bottom - 8;
      setSide(below >= height || below >= rect.top - 8 ? "bottom" : "top");
      placed.current = true;
    }
    const css = getComputedStyle(surface);
    const radius = Math.max(...[css.borderTopLeftRadius, css.borderTopRightRadius, css.borderBottomLeftRadius, css.borderBottomRightRadius].map(parseFloat));
    if (!surface.dataset.optionsExpanded) panel.style.setProperty("--mf-options-radius", `${radius}px`);
    panel.style.setProperty("--mf-options-stroke", css.getPropertyValue(surface.closest(".mf-field--invalid") ? "--mf-error" : "--mf-palette-primary"));
    const sync = () => {
      surface.dataset.optionsSide = panel.dataset.side ?? "bottom";
      panel.style.setProperty("--mf-options-header-height", `${surface.getBoundingClientRect().height - 1}px`);
    };
    sync();
    surface.dataset.optionsExpanded = "true";
    const sideObserver = new MutationObserver(sync);
    sideObserver.observe(panel, { attributes: true, attributeFilter: ["data-side"] });
    const sizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    sizeObserver?.observe(surface);
    const restore = () => { delete surface.dataset.optionsExpanded; };
    panel.addEventListener("mf-options-unmount", restore);
    return () => { panel.removeEventListener("mf-options-unmount", restore); sideObserver.disconnect(); sizeObserver?.disconnect(); };
  }, [open, panel, anchor]);
  useLayoutEffect(() => {
    const node = anchor.current;
    const surface = node?.matches(".mf-input-wrap, .mf-select-trigger") ? node : node?.querySelector<HTMLElement>(".mf-input-wrap, .mf-select-trigger");
    return () => {
      if (surface) { delete surface.dataset.optionsExpanded; delete surface.dataset.optionsSide; delete surface.dataset.optionsOpen; }
    };
  }, [anchor]);
  return { panel: setPanel, side };
}

/** Retarget from the current height, including filtering and interrupted closes. */
export function OptionsExpansionBody({ children }: { children: ReactNode }) {
  const element = useRef<HTMLDivElement>(null);
  const { motion, reducedMotion } = useMaterialFluid();
  const expressive = motion === "expressive" && !reducedMotion;
  useLayoutEffect(() => {
    const body = element.current;
    const panel = body?.closest<HTMLElement>(".mf-options-popup");
    if (!body || !panel) return;
    let animation: Animation | undefined;
    let lastTarget = -1;
    const measure = () => {
      const target = panel.dataset.state === "closed" ? 0 : body.offsetHeight;
      if (target === lastTarget) return;
      lastTarget = target;
      const current = parseFloat(getComputedStyle(panel).getPropertyValue("--mf-options-reveal")) || 0;
      animation?.cancel();
      panel.style.height = `${body.offsetHeight}px`;
      panel.style.setProperty("--mf-options-reveal", `${target}px`);
      if (expressive && typeof panel.animate === "function" && Math.abs(current - target) > .5) {
        animation = panel.animate([{ "--mf-options-reveal": `${current}px` }, { "--mf-options-reveal": `${target}px` }], { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    };
    measure();
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(body);
    const state = new MutationObserver(measure);
    state.observe(panel, { attributes: true, attributeFilter: ["data-state"] });
    return () => { resize?.disconnect(); state.disconnect(); animation?.cancel(); panel.style.setProperty("--mf-options-reveal", "0px"); if (panel.dataset.state === "closed") panel.dispatchEvent(new Event("mf-options-unmount")); };
  }, [expressive]);
  return <div className="mf-options-viewport"><div ref={element} className="mf-options-body">{children}</div></div>;
}
