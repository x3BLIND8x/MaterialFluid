import { useLayoutEffect, useRef } from "react";

function entryRects(input: HTMLInputElement | HTMLTextAreaElement) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  if (start === null || end === null || start === end) return [];
  const style = getComputedStyle(input);
  const bounds = input.getBoundingClientRect();
  const mirror = document.createElement("div");
  for (const property of ["font", "font-size", "font-family", "font-weight", "font-style", "line-height", "letter-spacing", "text-indent", "text-align", "text-transform", "direction", "tab-size", "padding", "border", "box-sizing", "word-spacing"]) {
    mirror.style.setProperty(property, style.getPropertyValue(property));
  }
  const multiline = input instanceof HTMLTextAreaElement;
  Object.assign(mirror.style, {
    position: "fixed", left: `${bounds.left}px`, top: `${bounds.top}px`,
    width: `${input.offsetWidth}px`, height: `${input.offsetHeight}px`,
    visibility: "hidden", pointerEvents: "none", overflow: "hidden",
    whiteSpace: multiline ? "pre-wrap" : "pre", overflowWrap: "break-word",
  });
  mirror.textContent = input.value;
  mirror.setAttribute("aria-hidden", "true");
  document.body.append(mirror);
  // Match the actual content viewport, including textarea scrollbars.
  const borderWidth = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  mirror.style.width = `${style.boxSizing === "border-box" ? input.clientWidth + borderWidth : input.clientWidth - paddingWidth}px`;
  const range = document.createRange();
  range.setStart(mirror.firstChild!, start);
  range.setEnd(mirror.firstChild!, end);
  const rects = Array.from(range.getClientRects(), rect => {
    const top = multiline ? rect.top - input.scrollTop : bounds.top + (bounds.height - rect.height) / 2;
    const left = Math.max(bounds.left + input.clientLeft, rect.left - input.scrollLeft);
    const right = Math.min(bounds.left + input.clientLeft + input.clientWidth, rect.right - input.scrollLeft);
    return { left, right, top: Math.max(bounds.top + input.clientTop, top), bottom: Math.min(bounds.top + input.clientTop + input.clientHeight, top + rect.height) };
  }).filter(rect => rect.right > rect.left && rect.bottom > rect.top);
  mirror.remove();
  return rects;
}

/** Paint native document selection without replacing its copy or keyboard behavior. */
export function RoundedSelection() {
  const layer = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const overlay = layer.current;
    const root = overlay?.closest<HTMLElement>(".mf-root");
    if (!overlay || !root) return;
    root.setAttribute("data-rounded-selection", "");
    let paintedEntry: HTMLInputElement | HTMLTextAreaElement | null = null;
    let frame = 0;
    const paint = () => {
      frame = 0;
      overlay.replaceChildren();
      paintedEntry?.removeAttribute("data-rounded-entry");
      paintedEntry = null;
      if (matchMedia("(forced-colors: active)").matches) return;
      const active = document.activeElement;
      if ((active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) && root.contains(active)) {
        if (active instanceof HTMLInputElement && !["text", "search", "url", "tel"].includes(active.type)) return;
        const rects = entryRects(active);
        for (const rect of rects) {
          const highlight = document.createElement("span");
          Object.assign(highlight.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.right - rect.left}px`, height: `${rect.bottom - rect.top}px` });
          overlay.append(highlight);
        }
        if (rects.length) {
          active.setAttribute("data-rounded-entry", "");
          paintedEntry = active;
        }
        return;
      }
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount ||
        !root.contains(selection.anchorNode) || !root.contains(selection.focusNode) ||
        matchMedia("(forced-colors: active)").matches) return;
      const lines: { left: number; top: number; right: number; bottom: number }[] = [];
      const ranges: Range[] = [];
      for (let i = 0; i < selection.rangeCount; i++) {
        const selected = selection.getRangeAt(i);
        const walker = document.createTreeWalker(selected.commonAncestorContainer, NodeFilter.SHOW_TEXT);
        const nodes: Node[] = [];
        if (selected.commonAncestorContainer.nodeType === Node.TEXT_NODE) nodes.push(selected.commonAncestorContainer);
        else { let node; while ((node = walker.nextNode())) if (selected.intersectsNode(node)) nodes.push(node); }
        for (const node of nodes) {
          const parent = node.parentElement;
          if (!node.textContent?.trim() || !parent || parent.closest(
            "script, style, svg, button, select, option, [aria-hidden='true'], [inert], [role='slider'], [role='checkbox'], [role='radio'], [role='switch']",
          )) continue;
          let selectable = true;
          for (let ancestor: HTMLElement | null = parent; ancestor && ancestor !== root; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            if (style.userSelect === "none" || style.visibility === "hidden" || style.display === "none") {
              selectable = false;
              break;
            }
          }
          if (!selectable) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          if (node === selected.startContainer) range.setStart(node, selected.startOffset);
          if (node === selected.endContainer) range.setEnd(node, selected.endOffset);
          ranges.push(range);
        }
      }
      for (const range of ranges) {
        for (const rect of range.getClientRects()) {
          if (rect.width < .5 || rect.height < .5) continue;
          const line = lines.find(line => Math.abs(line.top - rect.top) < 1 &&
            Math.abs(line.bottom - rect.bottom) < 1 && rect.left <= line.right + 1 && rect.right >= line.left - 1);
          if (line) { line.left = Math.min(line.left, rect.left); line.right = Math.max(line.right, rect.right); }
          else lines.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
        }
      }
      for (const rect of lines) {
        const highlight = document.createElement("span");
        Object.assign(highlight.style, {
          left: `${rect.left}px`, top: `${rect.top}px`,
          width: `${rect.right - rect.left}px`, height: `${rect.bottom - rect.top}px`,
        });
        overlay.append(highlight);
      }

    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    document.addEventListener("selectionchange", paint);
    const entryEvents = ["select", "input", "keyup", "pointerup", "focusin", "focusout"];
    entryEvents.forEach(event => document.addEventListener(event, schedule, true));
    document.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.addEventListener("blur", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      paintedEntry?.removeAttribute("data-rounded-entry");
      entryEvents.forEach(event => document.removeEventListener(event, schedule, true));
      document.removeEventListener("selectionchange", paint);
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("blur", schedule);
      root.removeAttribute("data-rounded-selection");
    };
  }, []);
  return <div ref={layer} className="mf-rounded-selection" aria-hidden="true" />;
}
