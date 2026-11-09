import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { Button, IconButton, type ButtonProps } from "./controls";
import { MaterialFluidProvider } from "./provider";
import { isButtonToggleVariant, type ButtonSizeInput, type IconButtonWidth } from "./component-policy";
const ElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

/** Optional light-DOM adapter. Native inner buttons retain form submission/reset semantics. */
export class MaterialFluidButtonElement extends ElementBase {
  static observedAttributes = ["variant", "size", "text", "icon", "selected-icon", "icon-position", "toggle", "selected", "toggle-on-click", "disabled", "active", "loading", "loading-text", "progress", "show-progress", "indeterminate", "progress-label", "aria-label", "type", "name", "value", "form", "theme", "locale", "motion", "accent-seed", "color-preset", "button-class"];
  private root?: Root;
  private initialText = "";
  private capturedLabel = false;
  private pending = false;
  private completion: Promise<void> = Promise.resolve();
  get updateComplete() { return this.completion; }
  protected flag(name: string) { return this.hasAttribute(name) && this.getAttribute(name) !== "false"; }
  private reflect(name: string, value: boolean) { this.toggleAttribute(name, value); }
  connectedCallback() {
    if (!this.capturedLabel) { this.initialText = this.getAttribute("text") ?? this.textContent?.trim() ?? ""; this.capturedLabel = true; }
    if (!this.root) this.root = createRoot(this);
    this.schedule();
  }
  disconnectedCallback() { queueMicrotask(() => { if (!this.isConnected) { this.root?.unmount(); this.root = undefined; } }); }
  attributeChangedCallback() { if (this.isConnected) this.schedule(); }
  private schedule() {
    if (this.pending) return;
    this.pending = true;
    this.completion = new Promise(resolve => queueMicrotask(() => { this.pending = false; if (this.isConnected && this.root) flushSync(() => this.renderButton()); resolve(); }));
  }
  private renderButton() {
    const outer = this.parentElement?.closest<HTMLElement>(".mf-root");
    const rawProgress = this.getAttribute("progress");
    const progress = rawProgress === null ? undefined : rawProgress === "indeterminate" ? null : Number(rawProgress);
    const props: ButtonProps = {
      variant: this.variant, size: this.size, text: this.text, icon: this.icon || undefined,
      selectedIcon: this.selectedIcon || null,
      iconPosition: this.getAttribute("icon-position") === "end" ? "end" : "start",
      toggle: this.toggle, selected: this.selected, toggleOnClick: this.getAttribute("toggle-on-click") !== "false",
      disabled: this.disabled, active: this.flag("active"), loading: this.loading,
      loadingText: this.getAttribute("loading-text") ?? undefined,
      progress, progressLabel: this.getAttribute("progress-label") ?? undefined, showProgress: this.hasAttribute("show-progress") ? this.flag("show-progress") : undefined,
      indeterminate: this.hasAttribute("indeterminate") ? this.flag("indeterminate") : undefined,
      "aria-label": this.getAttribute("aria-label") ?? undefined,
      type: this.type, name: this.name, value: this.value, form: this.getAttribute("form") ?? undefined,
      className: this.getAttribute("button-class") ?? undefined,
      onFocus: event => this.dispatchEvent(new FocusEvent("focus", { relatedTarget: event.relatedTarget })),
      onBlur: event => this.dispatchEvent(new FocusEvent("blur", { relatedTarget: event.relatedTarget })),
      onSelectedChange: selected => {
        this.selected = selected;
        this.dispatchEvent(new CustomEvent("change", { detail: { selected, value: this.value }, bubbles: true, composed: true }));
      },
    };
    const theme = this.getAttribute("theme") ?? outer?.dataset.theme;
    const locale = this.getAttribute("locale") ?? outer?.lang;
    const motion = this.getAttribute("motion") ?? outer?.dataset.motion;
    this.root?.render(<MaterialFluidProvider theme={theme === "dark" || theme === "light" ? theme : "system"} locale={locale === "fa" ? "fa" : "en"} motion={motion === "minimal" || motion === "reduced" ? "minimal" : "expressive"} colorPreset={this.getAttribute("color-preset") === "standard" ? "standard" : "neutral"} accentSeed={this.getAttribute("accent-seed") ?? "#eedd96"}>{this.createButton(props)}</MaterialFluidProvider>);
  }
  protected createButton(props: ButtonProps) { return <Button {...props}/>; }
  get text() { return this.getAttribute("text") ?? this.initialText; } set text(value: string) { this.setAttribute("text", value); }
  get icon() { return this.getAttribute("icon") ?? ""; } set icon(value: string) { this.setAttribute("icon", value); }
  get selectedIcon() { return this.getAttribute("selected-icon") ?? ""; } set selectedIcon(value: string | null) { if (value == null) this.removeAttribute("selected-icon"); else this.setAttribute("selected-icon", value); }
  get variant() { const variant = this.getAttribute("variant") ?? "filled"; return (["filled", "tonal", "outlined", "ghost", "danger", "emphasize", "primary", "secondary", "tertiary", "outline", "text"].includes(variant) ? variant : "filled") as NonNullable<ButtonProps["variant"]>; } set variant(value: NonNullable<ButtonProps["variant"]>) { this.setAttribute("variant", value); }
  get size() { return (this.getAttribute("size") ?? "md") as ButtonSizeInput; } set size(value: ButtonSizeInput) { this.setAttribute("size", value); }
  get disabled() { return this.flag("disabled"); } set disabled(value: boolean) { this.reflect("disabled", value); }
  get toggle() { return this.flag("toggle"); } set toggle(value: boolean) { this.reflect("toggle", value); }
  get selected() { return this.flag("selected"); } set selected(value: boolean) { this.reflect("selected", value); }
  get loading() { return this.flag("loading"); } set loading(value: boolean) { this.reflect("loading", value); }
  get value() { return this.getAttribute("value") ?? ""; } set value(value: string) { this.setAttribute("value", value); }
  get name() { return this.getAttribute("name") ?? ""; } set name(value: string) { this.setAttribute("name", value); }
  get type() { const type = this.getAttribute("type"); return type === "submit" || type === "reset" ? type : "button"; } set type(value: "button" | "submit" | "reset") { this.setAttribute("type", value); }
  get form() { return this.querySelector("button")?.form ?? null; }
  override focus(options?: FocusOptions) { this.querySelector("button")?.focus(options); }
  override click() { this.querySelector("button")?.click(); }
  setSelected(value: boolean) { this.selected = value; return this; }
  isSelected() { return this.toggle && this.selected; }
  enable() { this.disabled = false; return this; } disable() { this.disabled = true; return this; } isDisabled() { return this.disabled || this.loading; }
  setText(value: string) { this.text = value; return this; } getText() { return this.text; }
  setIcon(value: string) { this.icon = value; return this; } getIcon() { return this.icon; } hasIcon() { return Boolean(this.icon); }
  setSelectedIcon(value: string | null) { this.selectedIcon = value; return this; } getSelectedIcon() { return this.selectedIcon; }
  setValue(value: string) { this.value = value; return this; } getValue() { return this.value; }
  setVariant(value: NonNullable<ButtonProps["variant"]>) { this.variant = value; return this; } getVariant() { return this.variant; }
  setSize(value: ButtonSizeInput) { this.size = value; return this; } getSize() { return this.size; }
  setActive(value: boolean) { this.reflect("active", value); return this; }
  setAriaLabel(value: string) { this.setAttribute("aria-label", value); return this; }
  addClass(...classes: string[]) { this.classList.add(...classes); return this; }
  removeClass(...classes: string[]) { this.classList.remove(...classes); return this; }
  showProgressSync() { this.setAttribute("show-progress", "true"); if (!this.hasAttribute("progress")) this.setAttribute("progress", "indeterminate"); return this; }
  hideProgressSync() { this.setAttribute("show-progress", "false"); return this; }
  setProgressSync(value: number) { this.setAttribute("progress", String(value)); this.setAttribute("indeterminate", "false"); return this; }
  setIndeterminateSync(value: boolean) { this.setAttribute("indeterminate", String(value)); return this; }
  setLoadingSync(value: boolean, text?: string) { this.loading = value; if (text !== undefined) { if (value) this.setAttribute("loading-text", text); else this.text = text; } return this; }
  async showProgress() { this.showProgressSync(); await this.updateComplete; return this; }
  async hideProgress() { this.hideProgressSync(); await this.updateComplete; return this; }
  async setProgress(value: number) { this.setProgressSync(value); await this.updateComplete; return this; }
  async setIndeterminate(value: boolean) { this.setIndeterminateSync(value); await this.updateComplete; return this; }
  async setLoading(value: boolean, text?: string) { this.setLoadingSync(value, text); await this.updateComplete; return this; }
  destroy() { this.remove(); }
}
export function defineMaterialFluidButton(tagName = "mf-button", registry: CustomElementRegistry = globalThis.customElements) {
  if (!registry) throw new Error("MaterialFluid elements require a browser CustomElementRegistry.");
  if (!registry.get(tagName)) registry.define(tagName, tagName === "mf-button" ? MaterialFluidButtonElement : class extends MaterialFluidButtonElement {});
  return tagName;
}
declare global { interface HTMLElementTagNameMap { "mf-button": MaterialFluidButtonElement } }

/** Icon-only adapter reuses the Button lifecycle, native form semantics and state events. */
export class MaterialFluidIconButtonElement extends MaterialFluidButtonElement {
  static override observedAttributes = [...MaterialFluidButtonElement.observedAttributes, "width", "selected-label"];
  protected override createButton(props: ButtonProps) {
    return <IconButton {...props} text={undefined} label={this.getAttribute("aria-label") || this.text || "Icon action"} selectedLabel={this.selectedLabel || undefined} selectedIcon={this.selectedIcon || null} width={this.width}/>;
  }
  override get variant() { return this.hasAttribute("variant") ? super.variant : "ghost"; }
  override set variant(value: NonNullable<ButtonProps["variant"]>) { super.variant = value; }
  get width(): IconButtonWidth { const value = this.getAttribute("width"); return value === "narrow" || value === "wide" ? value : "default"; }
  set width(value: IconButtonWidth) { this.setAttribute("width", value); }
  setWidth(value: IconButtonWidth) { this.width = value; return this; }
  getWidth() { return this.width; }
  getAriaLabel() { return this.getAttribute("aria-label") ?? this.text; }
  get selectedLabel() { return this.getAttribute("selected-label") ?? ""; }
  set selectedLabel(value: string) { this.setAttribute("selected-label", value); }
  setSelectedLabel(value: string) { this.selectedLabel=value; return this; }
  getSelectedLabel() { return this.selectedLabel; }
  isToggle() { return this.toggle && isButtonToggleVariant(this.variant); }
  override isSelected() { return this.isToggle() && this.selected; }
  select() { if (this.isToggle()) this.selected = true; return this; }
  deselect() { if (this.isToggle()) this.selected = false; return this; }
  toggleSelected() { if (this.isToggle()) this.selected = !this.selected; return this; }
}
export function defineMaterialFluidIconButton(tagName = "mf-icon-button", registry: CustomElementRegistry = globalThis.customElements) {
  if (!registry) throw new Error("MaterialFluid elements require a browser CustomElementRegistry.");
  if (!registry.get(tagName)) registry.define(tagName, tagName === "mf-icon-button" ? MaterialFluidIconButtonElement : class extends MaterialFluidIconButtonElement {});
  return tagName;
}
declare global { interface HTMLElementTagNameMap { "mf-icon-button": MaterialFluidIconButtonElement } }
