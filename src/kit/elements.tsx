import {useLayoutEffect,useRef} from "react";
import {ExtendedFAB,type ExtendedFABHandle,type ExtendedFABSize,type ExtendedFABWidth} from "./extended-fab";
import {FABMenu,type FABMenuHandle,type FABMenuProps,type FABMenuItem,type FABMenuColor,type FABMenuPresentation,type FABMenuPlacement} from "./fab-menu";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { Button, IconButton, Checkbox, type CheckboxHandle, type CheckboxChangePayload, type CheckboxTapPayload, type CheckboxSwipePayload, type ButtonProps } from "./controls";
import { MaterialFluidProvider } from "./provider";
import { isButtonToggleVariant, type ButtonSizeInput, type IconButtonWidth } from "./component-policy";
import { ButtonGroup, type ButtonGroupHandle, type ButtonGroupProps, type ButtonGroupValue, type ButtonGroupItemProps } from "./button-group";
import { SplitButton, type SplitButtonHandle, type SplitButtonItem, type SplitButtonEvent } from "./split-button";
import {FAB,type FABHandle,type FABSize,type FABVariant,type FABColor,type FABPlacement,type FABPosition} from "./fab";
import { AnimatedIcon, type IconName } from "./icons";
const ElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

/** Optional light-DOM adapter. Native inner buttons retain form submission/reset semantics. */
export class MaterialFluidButtonElement extends ElementBase {
  static observedAttributes = ["variant", "size", "text", "icon", "selected-icon", "icon-position", "toggle", "emphasize", "selected", "toggle-on-click", "disabled", "active", "loading", "loading-text", "progress", "show-progress", "indeterminate", "progress-label", "aria-label", "type", "name", "value", "form", "theme", "locale", "motion", "accent-seed", "color-preset", "button-class"];
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
      toggle: this.toggle, emphasize: this.emphasize, selected: this.selected, toggleOnClick: this.getAttribute("toggle-on-click") !== "false",
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
  get variant() { const variant = this.getAttribute("variant") ?? "filled"; return (["filled", "tonal", "outlined", "ghost", "danger", "primary", "secondary", "tertiary", "outline", "text"].includes(variant) ? variant : "filled") as NonNullable<ButtonProps["variant"]>; } set variant(value: NonNullable<ButtonProps["variant"]>) { this.setAttribute("variant", value); }
  get size() { return (this.getAttribute("size") ?? "md") as ButtonSizeInput; } set size(value: ButtonSizeInput) { this.setAttribute("size", value); }
  get disabled() { return this.flag("disabled"); } set disabled(value: boolean) { this.reflect("disabled", value); }
  get toggle() { return this.flag("toggle"); } set toggle(value: boolean) { this.reflect("toggle", value); }
  get emphasize() { return this.flag("emphasize"); } set emphasize(value: boolean) { this.reflect("emphasize", value); }
  setEmphasize(value: boolean) { this.emphasize = value; return this; }
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

/** Declarative item configuration; the parent owns native rendered buttons. */
export class MaterialFluidButtonGroupItemElement extends ElementBase {
  get value() { return this.getAttribute("value") ?? this.id; } set value(value: string) { this.setAttribute("value",value); }
  get selected() { return this.hasAttribute("selected") && this.getAttribute("selected") !== "false"; } set selected(value: boolean) { this.toggleAttribute("selected",value); }
  get disabled() { return this.hasAttribute("disabled") && this.getAttribute("disabled") !== "false"; } set disabled(value: boolean) { this.toggleAttribute("disabled",value); }
  get icon() { return this.getAttribute("icon") ?? ""; } set icon(value: string) { this.setAttribute("icon",value); }
  get selectedIcon() { return this.getAttribute("selected-icon"); } set selectedIcon(value: string | null) { if(value==null)this.removeAttribute("selected-icon");else this.setAttribute("selected-icon",value); }
  get text() { return this.getAttribute("text") ?? this.textContent ?? ""; } set text(value: string) { this.setAttribute("text",value); }
}
export class MaterialFluidButtonGroupElement extends ElementBase {
  static observedAttributes = ["kind","selection","required","labels","variant","size","orientation","density","equal-width","disabled","emphasize","value","aria-label","theme","locale","motion","color-preset","accent-seed"];
  private groupRoot?: Root;
  private mount?: HTMLDivElement;
  private handle: ButtonGroupHandle | null = null;
  private observer?: MutationObserver;
  private queued = false;
  connectedCallback() {
    if(!this.mount){this.mount=document.createElement("div");this.mount.style.display="contents";this.append(this.mount);}
    if(!this.groupRoot)this.groupRoot=createRoot(this.mount);
    this.observer=new MutationObserver(records=>{if(records.some(record=>!this.mount?.contains(record.target)&&!(record.type==="attributes"&&record.attributeName==="hidden")))this.schedule();});
    this.observer.observe(this,{childList:true,subtree:true,characterData:true,attributes:true});
    this.schedule();
  }
  disconnectedCallback() { this.observer?.disconnect();queueMicrotask(()=>{if(!this.isConnected){this.groupRoot?.unmount();this.groupRoot=undefined;this.handle=null;}}); }
  attributeChangedCallback() { this.schedule(); }
  private schedule() { if(this.queued||!this.isConnected||!this.groupRoot)return;this.queued=true;queueMicrotask(()=>{this.queued=false;if(this.isConnected)flushSync(()=>this.renderGroup());}); }
  get updateComplete() { return Promise.resolve().then(()=>{if(this.queued){this.queued=false;flushSync(()=>this.renderGroup());}}); }
  private flag(name: string) { return this.hasAttribute(name)&&this.getAttribute(name)!=="false"; }
  private items() { return Array.from(this.children).filter((node): node is MaterialFluidButtonGroupItemElement=>node.tagName.toLowerCase()==="mf-button-group-item"); }
  private renderGroup() {
    const outer=this.parentElement?.closest<HTMLElement>(".mf-root"),locale=this.getAttribute("locale")??outer?.lang,theme=this.getAttribute("theme")??outer?.dataset.theme,motion=this.getAttribute("motion")??outer?.dataset.motion;
    const items:ButtonGroupItemProps[]=this.items().map((item,index)=>{item.hidden=true;return {value:item.value||String(index),"data-group-id":item.id||undefined,text:item.text||undefined,icon:item.icon||undefined,selectedIcon:item.selectedIcon,selected:item.selected,disabled:item.disabled,ariaLabel:item.getAttribute("aria-label")??undefined,className:item.getAttribute("button-class")??undefined,type:item.getAttribute("type")==="submit"?"submit":item.getAttribute("type")==="reset"?"reset":"button",name:item.getAttribute("name")??undefined};});
    const props:ButtonGroupProps={buttons:items,kind:this.kind,selection:this.selection,required:this.required,labels:this.labels,variant:this.variant,size:this.size,orientation:this.orientation,density:this.density,equalWidth:this.equalWidth,disabled:this.disabled,emphasize:this.emphasize,label:this.getAttribute("aria-label")??"Button group",
      ...(this.hasAttribute("value")?{value:this.value}:{}),onValueChange:value=>{this.value=value;},
      onSelectionChange:detail=>this.dispatchEvent(new CustomEvent("change",{detail:{value:detail.value,values:detail.values},bubbles:true,composed:true})),
      onAction:detail=>this.dispatchEvent(new CustomEvent("action",{detail:{value:detail.value,index:detail.index},bubbles:true,composed:true})),
      onFocus:event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>(".mf-group-action");if(button)this.dispatchEvent(new CustomEvent("focus",{detail:{value:button.dataset.groupValue,index:this.handle?Array.from(this.handle.querySelectorAll(".mf-group-action")).indexOf(button):-1}}));},
      onBlur:event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>(".mf-group-action");if(button)this.dispatchEvent(new CustomEvent("blur",{detail:{value:button.dataset.groupValue}}));},
    };
    this.groupRoot?.render(<MaterialFluidProvider locale={locale==="fa"?"fa":"en"} theme={theme==="light"||theme==="dark"?theme:"system"} motion={motion==="minimal"||motion==="reduced"?"minimal":"expressive"} colorPreset={this.getAttribute("color-preset")==="standard"?"standard":"neutral"} accentSeed={this.getAttribute("accent-seed")??"#eedd96"}><ButtonGroup {...props} ref={value=>{this.handle=value as ButtonGroupHandle|null;}}/></MaterialFluidProvider>);
  }
  get kind() { return this.getAttribute("kind")==="connected"?"connected":"standard"; } set kind(value: "standard"|"connected") { this.setAttribute("kind",value); }
  get selection() { const value=this.getAttribute("selection");return value==="single"||value==="multi"?value:"none"; } set selection(value: "none"|"single"|"multi") { this.setAttribute("selection",value); }
  get required() { return this.flag("required"); } set required(value:boolean) { this.toggleAttribute("required",value); }
  get labels() { return this.getAttribute("labels")==="selected"?"selected":"always"; } set labels(value:"selected"|"always") { this.setAttribute("labels",value); }
  get variant() { const value=this.getAttribute("variant")??"outlined";return (["filled","tonal","outlined","ghost","text","danger","primary","secondary","outline","tertiary"].includes(value)?value:"outlined") as NonNullable<ButtonGroupProps["variant"]>; } set variant(value:NonNullable<ButtonGroupProps["variant"]>) { this.setAttribute("variant",value); }
  get size() { return (this.getAttribute("size")??"sm") as ButtonSizeInput; } set size(value:ButtonSizeInput) { this.setAttribute("size",value); }
  get orientation() { return this.getAttribute("orientation")==="vertical"?"vertical":"horizontal"; } set orientation(value:"horizontal"|"vertical") { this.setAttribute("orientation",value); }
  get density() { const value=this.getAttribute("density");return value==="comfortable"||value==="compact"?value:"default"; } set density(value:"default"|"comfortable"|"compact") { this.setAttribute("density",value); }
  get equalWidth() { return this.flag("equal-width"); } set equalWidth(value:boolean) { this.toggleAttribute("equal-width",value); }
  get disabled() { return this.flag("disabled"); } set disabled(value:boolean) { this.toggleAttribute("disabled",value); }
  get emphasize() { return this.flag("emphasize"); } set emphasize(value:boolean) { this.toggleAttribute("emphasize",value); }
  get value():ButtonGroupValue { const raw=this.getAttribute("value");if(raw==null)return null;if(this.selection!=="multi")return raw||null;try{const value:unknown=JSON.parse(raw);return Array.isArray(value)?value.map(String):raw?[raw]:[];}catch{return raw?[raw]:[];} } set value(value:ButtonGroupValue) { this.setAttribute("value",Array.isArray(value)?JSON.stringify(value):value??""); }
  get buttons() { return this.handle?Array.from(this.handle.querySelectorAll<HTMLButtonElement>(":scope > .mf-group-action")):[]; }
  getSelected() { return this.handle?.getSelected()??[]; } isSelected(value:string) { return this.getSelected().includes(value); }
  select(value:string) { this.handle?.select(value);return this; } deselect(value:string) { this.handle?.deselect(value);return this; } toggle(value:string) { this.handle?.toggle(value);return this; }
  getSelection() { return this.selection; } getKind() { return this.kind; }
  getButton(index:number) { return this.buttons[index]; } getButtonById(id:string) { return this.buttons.find(button=>button.id===id||button.dataset.groupId===id||button.dataset.groupValue===id); }
  setVariant(value:NonNullable<ButtonGroupProps["variant"]>) { this.variant=value;return this; } getVariant() { return this.variant; }
  setOrientation(value:"horizontal"|"vertical") { this.orientation=value;return this; } getOrientation() { return this.orientation; }
  setDensity(value:"default"|"comfortable"|"compact") { this.density=value;return this; } getDensity() { return this.density; }
  enable() { this.disabled=false;return this; } disable() { this.disabled=true;return this; }
  enableButton(index:number) { const item=this.items()[index];if(item)item.disabled=false;return this; } disableButton(index:number) { const item=this.items()[index];if(item)item.disabled=true;return this; }
  on(event:string,handler:EventListener) { this.addEventListener(event,handler);return this; } off(event:string,handler:EventListener) { this.removeEventListener(event,handler);return this; }
  override focus(options?:FocusOptions) { this.buttons.find(button=>!button.disabled)?.focus(options); }
  destroy() { this.remove(); }
}
export function defineMaterialFluidButtonGroup(tagName="mf-button-group",registry:CustomElementRegistry=globalThis.customElements) {
  if(!registry)throw new Error("MaterialFluid elements require a browser CustomElementRegistry.");
  if(!registry.get("mf-button-group-item"))registry.define("mf-button-group-item",MaterialFluidButtonGroupItemElement);
  if(!registry.get(tagName))registry.define(tagName,tagName==="mf-button-group"?MaterialFluidButtonGroupElement:class extends MaterialFluidButtonGroupElement{});
  return tagName;
}
declare global { interface HTMLElementTagNameMap { "mf-button-group": MaterialFluidButtonGroupElement; "mf-button-group-item": MaterialFluidButtonGroupItemElement } }

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
  isToggle() { return this.toggle && isButtonToggleVariant(this.variant, this.emphasize); }
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


/** Hidden declarative menu data; the shared Menu owns actual menuitem semantics. */
export class MaterialFluidMenuItemElement extends ElementBase {
  get value(){return this.getAttribute("value")??this.id;} set value(value:string){this.setAttribute("value",value);}
  get disabled(){return this.hasAttribute("disabled")&&this.getAttribute("disabled")!=="false";} set disabled(value:boolean){this.toggleAttribute("disabled",value);}
  get icon(){return this.getAttribute("icon")??"";} set icon(value:string){this.setAttribute("icon",value);}
}
export class MaterialFluidSplitButtonElement extends ElementBase {
  static observedAttributes=["text","label","icon","variant","size","disabled","expanded","trailing-label","menu-label","group-label","aria-label","layer","type","name","value","form","theme","locale","motion","accent-seed","color-preset","button-class"];
  private splitRoot?:Root; private mount?:HTMLDivElement; private handle:SplitButtonHandle|null=null;
  private observer?:MutationObserver; private queued=false; private initialText=""; private captured=false; private itemData?:SplitButtonItem[];
  connectedCallback(){
    if(!this.captured){const text=Array.from(this.childNodes).filter(node=>node.nodeType===Node.TEXT_NODE);this.initialText=text.map(node=>node.textContent).join("").trim();text.forEach(node=>node.remove());this.captured=true;}
    if(!this.mount){this.mount=document.createElement("div");this.mount.style.display="contents";this.append(this.mount);}
    if(!this.splitRoot){this.splitRoot=createRoot(this.mount);this.mount.addEventListener("click",event=>{if(!(event.target as Element).closest(".mf-split-button-leading"))event.stopPropagation();});}
    this.observer=new MutationObserver(records=>{if(records.some(record=>!this.mount?.contains(record.target)&&!(record.type==="attributes"&&record.attributeName==="hidden")))this.schedule();});
    this.observer.observe(this,{childList:true,subtree:true,characterData:true,attributes:true});this.schedule();
  }
  disconnectedCallback(){this.observer?.disconnect();queueMicrotask(()=>{if(!this.isConnected){this.splitRoot?.unmount();this.splitRoot=undefined;this.handle=null;}});}
  attributeChangedCallback(){this.schedule();}
  private schedule(){if(this.queued||!this.isConnected||!this.splitRoot)return;this.queued=true;queueMicrotask(()=>{this.queued=false;if(this.isConnected)flushSync(()=>this.renderSplit());});}
  get updateComplete(){return Promise.resolve().then(()=>{if(this.queued){this.queued=false;flushSync(()=>this.renderSplit());}});}
  private flag(name:string){return this.hasAttribute(name)&&this.getAttribute(name)!=="false";}
  private readItems():SplitButtonItem[]{
    const read=(parent:Element):SplitButtonItem[]=>Array.from(parent.children).filter((node):node is MaterialFluidMenuItemElement=>node.localName==="mf-menu-item").map((item,index)=>{
      item.hidden=true;const nested=read(item);const text=item.getAttribute("label")??Array.from(item.childNodes).filter(node=>!(node instanceof Element)||node.localName!=="mf-menu-item").map(node=>node.textContent??"").join("").trim();
      return {id:item.value||String(index),text,disabled:item.disabled,destructive:item.hasAttribute("destructive"),kind:item.hasAttribute("separator")?"separator":item.hasAttribute("heading")?"label":"item",...(nested.length?{items:nested}:{}),icon:item.icon?<AnimatedIcon name={item.icon as IconName}/>:undefined};
    });return this.itemData??read(this);
  }
  private event(type:string,detail:SplitButtonEvent){this.dispatchEvent(new CustomEvent(type,{detail:{expanded:detail.expanded,originalEvent:detail.originalEvent,...(detail.value!==undefined?{value:detail.value}:{}),...(detail.item?{item:detail.item}:{})},bubbles:true,composed:true}));}
  private renderSplit(){
    const loose=Array.from(this.childNodes).filter(node=>node.nodeType===Node.TEXT_NODE);
    if(loose.length){this.initialText=loose.map(node=>node.textContent??"").join("").trim();loose.forEach(node=>node.remove());}
    if(this.mount&&!this.contains(this.mount)){this.splitRoot?.unmount();this.append(this.mount);this.splitRoot=createRoot(this.mount);}
    const locale=this.getAttribute("locale"),theme=this.getAttribute("theme"),motion=this.getAttribute("motion");
    this.splitRoot?.render(<MaterialFluidProvider locale={locale==="fa"?"fa":"en"} theme={theme==="light"||theme==="dark"?theme:"system"} motion={motion==="minimal"||motion==="reduced"?"minimal":"expressive"} colorPreset={this.getAttribute("color-preset")==="standard"?"standard":"neutral"} accentSeed={this.getAttribute("accent-seed")??"#eedd96"}>
      <SplitButton ref={value=>{this.handle=value as SplitButtonHandle|null;}} text={this.text} icon={this.icon||undefined} variant={this.variant} size={this.size} disabled={this.disabled} expanded={this.expanded} onExpandedChange={expanded=>{this.expanded=expanded;}} trailingLabel={this.trailingLabel||undefined} groupLabel={this.getAttribute("group-label")??undefined} ariaLabel={this.getAttribute("aria-label")??undefined} items={this.readItems()} layer={this.layer} className={this.getAttribute("button-class")??undefined} type={this.getAttribute("type")==="submit"?"submit":this.getAttribute("type")==="reset"?"reset":"button"} name={this.getAttribute("name")??undefined} value={this.getAttribute("value")??undefined} form={this.getAttribute("form")??undefined}
        onExpand={event=>{this.event("expand",event);this.event("open",event);}} onCollapse={event=>{this.event("collapse",event);this.event("close",event);}} onChange={event=>this.event("change",event)} onSelect={event=>this.event("select",event)}/>
    </MaterialFluidProvider>);
  }
  get text(){return this.getAttribute("text")??this.getAttribute("label")??this.initialText;} set text(value:string){this.setAttribute("text",value);}
  get icon(){return this.getAttribute("icon")??"";} set icon(value:string){this.setAttribute("icon",value);}
  get variant():NonNullable<ButtonProps["variant"]>{const value=this.getAttribute("variant")??"filled";return (["filled","tonal","outlined","ghost","text","primary","secondary","tertiary","outline","danger"].includes(value)?value:"filled") as NonNullable<ButtonProps["variant"]>;} set variant(value:NonNullable<ButtonProps["variant"]>){this.setAttribute("variant",value);}
  get size(){return (this.getAttribute("size")??"sm") as ButtonSizeInput;} set size(value:ButtonSizeInput){this.setAttribute("size",value);}
  get disabled(){return this.flag("disabled");} set disabled(value:boolean){this.toggleAttribute("disabled",value);}
  get expanded(){return this.flag("expanded");} set expanded(value:boolean){this.toggleAttribute("expanded",value);}
  get trailingLabel(){return this.getAttribute("trailing-label")??this.getAttribute("menu-label")??"";} set trailingLabel(value:string){this.setAttribute("trailing-label",value);}
  get layer(){return this.getAttribute("layer")==="top"?"top":undefined;} set layer(value:"top"|undefined){if(value)this.setAttribute("layer",value);else this.removeAttribute("layer");}
  get element(){return this.handle?.element??null;} get leadingElement(){return this.handle?.leadingElement??null;} get trailingElement(){return this.handle?.trailingElement??null;}
  get items(){return this.readItems();} set items(items:SplitButtonItem[]){this.itemData=items;this.schedule();}
  setText(value:string){this.text=value;return this;} getText(){return this.text;} setIcon(value:string){this.icon=value;return this;} setItems(items:SplitButtonItem[]){this.items=items;return this;} getItems(){return this.items;}
  setVariant(value:NonNullable<ButtonProps["variant"]>){this.variant=value;return this;} getVariant(){return this.variant;} setSize(value:ButtonSizeInput){this.size=value;return this;} getSize(){return this.size;}
  expand(){if(!this.disabled)this.handle?.expand();return this;} collapse(){this.handle?.collapse();return this;} isExpanded(){return this.expanded;}
  enable(){this.disabled=false;return this;} disable(){this.collapse();this.disabled=true;return this;} isDisabled(){return this.disabled;}
  on(type:string,handler:EventListener){this.addEventListener(type,handler);return this;} off(type:string,handler:EventListener){this.removeEventListener(type,handler);return this;}
  override focus(options?:FocusOptions){this.leadingElement?.focus(options);} destroy(){this.remove();}
}
export function defineMaterialFluidSplitButton(tagName="mf-split-button",registry:CustomElementRegistry=globalThis.customElements){
  if(!registry)throw new Error("MaterialFluid elements require a browser CustomElementRegistry.");
  if(!registry.get("mf-menu-item"))registry.define("mf-menu-item",MaterialFluidMenuItemElement);
  if(!registry.get(tagName))registry.define(tagName,tagName==="mf-split-button"?MaterialFluidSplitButtonElement:class extends MaterialFluidSplitButtonElement{});
  return tagName;
}
declare global {interface HTMLElementTagNameMap {"mf-split-button":MaterialFluidSplitButtonElement;"mf-menu-item":MaterialFluidMenuItemElement;}}


/** FAB adapter shares native Button form semantics and the registered icon catalogue. */
export class MaterialFluidFABElement extends ElementBase {
  static observedAttributes=["variant","color","size","icon","placement","position","aria-label","disabled","active","value","type","name","form","theme","locale","motion","accent-seed","color-preset","button-class"];
  private fabRoot?:Root;private mount?:HTMLDivElement;private handle:FABHandle|null=null;private queued=false;
  connectedCallback(){if(!this.mount){this.mount=document.createElement("div");this.mount.style.display="contents";this.append(this.mount);}if(!this.fabRoot)this.fabRoot=createRoot(this.mount);this.schedule();}
  disconnectedCallback(){queueMicrotask(()=>{if(!this.isConnected){this.fabRoot?.unmount();this.fabRoot=undefined;this.handle=null;}});}
  attributeChangedCallback(){this.schedule();}
  private schedule(){if(this.queued||!this.isConnected||!this.fabRoot)return;this.queued=true;queueMicrotask(()=>{this.queued=false;if(this.isConnected)flushSync(()=>this.renderFAB());});}
  get updateComplete(){return Promise.resolve().then(()=>{if(this.queued){this.queued=false;flushSync(()=>this.renderFAB());}});}
  private flag(name:string){return this.hasAttribute(name)&&this.getAttribute(name)!=="false";}
  private renderFAB(){
    const outer=this.parentElement?.closest<HTMLElement>(".mf-root"),theme=this.getAttribute("theme")??outer?.dataset.theme,locale=this.getAttribute("locale")??outer?.lang,motion=this.getAttribute("motion")??outer?.dataset.motion;
    this.fabRoot?.render(<MaterialFluidProvider theme={theme==="light"||theme==="dark"?theme:"system"} locale={locale==="fa"?"fa":"en"} motion={motion==="minimal"||motion==="reduced"?"minimal":"expressive"} colorPreset={this.getAttribute("color-preset")==="standard"?"standard":"neutral"} accentSeed={this.getAttribute("accent-seed")??"#eedd96"}>
      <FAB ref={value=>{this.handle=value as FABHandle|null;}} variant={this.variant} color={this.color} size={this.size} icon={this.icon||undefined} placement={this.placement} position={this.position} ariaLabel={this.getAttribute("aria-label")??undefined} disabled={this.disabled} active={this.active} type={this.type} name={this.name} value={this.value} form={this.getAttribute("form")??undefined} className={this.getAttribute("button-class")??undefined}
        onFocus={event=>this.dispatchEvent(new FocusEvent("focus",{relatedTarget:event.relatedTarget}))} onBlur={event=>this.dispatchEvent(new FocusEvent("blur",{relatedTarget:event.relatedTarget}))}/>
    </MaterialFluidProvider>);
  }
  get element(){return this.handle as HTMLButtonElement|null;}
  get variant(){const value=this.getAttribute("variant")??"primary-container";return (["primary-container","secondary-container","tertiary-container","primary","secondary","tertiary","filled","tonal","outlined","outline","ghost","text","danger"].includes(value)?value:"primary-container") as FABVariant;}set variant(value:FABVariant){this.setAttribute("variant",value);}
  get color(){const value=this.getAttribute("color");return value&&["primary-container","secondary-container","tertiary-container","primary","secondary","tertiary"].includes(value)?value as FABColor:undefined;}set color(value:FABColor|undefined){if(value)this.setAttribute("color",value);else this.removeAttribute("color");}
  get size(){const value=this.getAttribute("size")??"default";return (["default","medium","large","xs","sm","md","lg","xl","s","m","l"].includes(value)?value:"default") as FABSize;}set size(value:FABSize){this.setAttribute("size",value);}
  get icon(){return this.getAttribute("icon")??"";}set icon(value:string){this.setAttribute("icon",value);}
  get placement(){const value=this.getAttribute("placement");return value&&["none","top-start","top-end","bottom-start","bottom-end"].includes(value)?value as FABPlacement:undefined;}set placement(value:FABPlacement|undefined){if(value)this.setAttribute("placement",value);else this.removeAttribute("placement");}
  get position(){const value=this.getAttribute("position");return value&&["top-left","top-right","bottom-left","bottom-right"].includes(value)?value as FABPosition:undefined;}set position(value:FABPosition|undefined){if(value)this.setAttribute("position",value);else this.removeAttribute("position");}
  get disabled(){return this.flag("disabled");}set disabled(value:boolean){this.toggleAttribute("disabled",value);}
  get active(){return this.flag("active");}set active(value:boolean){this.toggleAttribute("active",value);}
  get type(){const value=this.getAttribute("type");return value==="submit"||value==="reset"?value:"button";}set type(value:"button"|"submit"|"reset"){this.setAttribute("type",value);}
  get name(){return this.getAttribute("name")??"";}set name(value:string){this.setAttribute("name",value);}
  get value(){return this.getAttribute("value")??"";}set value(value:string){this.setAttribute("value",value);}
  setValue(value:string){this.value=value;return this;}getValue(){return this.value;}setIcon(value:string){this.icon=value;return this;}getIcon(){return this.icon;}
  setVariant(value:FABVariant){this.variant=value;return this;}getVariant(){return this.variant;}setColor(value:FABColor){this.color=value;return this;}getColor(){return this.color;}
  setSize(value:FABSize){this.size=value;return this;}getSize(){return this.size;}setAriaLabel(value:string){this.setAttribute("aria-label",value);return this;}
  setPosition(value:FABPosition|undefined){this.position=value;return this;}getPosition(){return this.placement===undefined?this.position??null:null;}
  setPlacement(value:FABPlacement|undefined){this.placement=value;return this;}getPlacement(){return this.placement??"none";}
  enable(){this.disabled=false;return this;}disable(){this.disabled=true;return this;}isDisabled(){return this.disabled;}
  on(name:string,callback:EventListener){this.addEventListener(name,callback);return this;}off(name:string,callback:EventListener){this.removeEventListener(name,callback);return this;}
  addClass(...classes:string[]){this.setAttribute("button-class",[...new Set([...(this.getAttribute("button-class")??"").split(/\s+/).filter(Boolean),...classes])].join(" "));return this;}getClass(name:string){return ({fab:"mf-fab",root:"mf-fab",icon:"mf-action-icon",ripple:"mf-button-ripple"} as Record<string,string>)[name]??`mf-${name}`;}
  override focus(options?:FocusOptions){this.element?.focus(options);}destroy(){this.remove();}
}
export function defineMaterialFluidFAB(tagName="mf-fab",registry:CustomElementRegistry=globalThis.customElements){if(!registry)throw new Error("MaterialFluid elements require a browser CustomElementRegistry.");if(!registry.get(tagName))registry.define(tagName,tagName==="mf-fab"?MaterialFluidFABElement:class extends MaterialFluidFABElement{});return tagName;}
declare global{interface HTMLElementTagNameMap{"mf-fab":MaterialFluidFABElement;}}

/** Declarative actions are hidden; the menu owns their accessible action controls. */
export class MaterialFluidFABMenuItemElement extends ElementBase {
  connectedCallback(){this.hidden=true;}
  get value(){return this.getAttribute("value")??"";}set value(value:string){this.setAttribute("value",value);}
  get label(){return this.getAttribute("label")??this.textContent?.trim()??"";}set label(value:string){this.setAttribute("label",value);}
  get icon(){return this.getAttribute("icon")??"";}set icon(value:string){this.setAttribute("icon",value);}
  get disabled(){return this.hasAttribute("disabled")&&this.getAttribute("disabled")!=="false";}set disabled(value:boolean){this.toggleAttribute("disabled",value);}
}
const fabMenuDeclarations=new WeakMap<Element,{signature:string;items:FABMenuItem[]}>();
export class MaterialFluidFABMenuElement extends ElementBase {
  static observedAttributes=["aria-label","label","icon","close-icon","color","size","presentation","placement","open","disabled","active","theme","locale","motion","accent-seed","color-preset","menu-class"];
  private menuRoot?:Root;private mount?:HTMLDivElement;private handle:FABMenuHandle|null=null;private observer?:MutationObserver;private queued=false;private itemData?:FABMenuItem[];private customMenu?:FABMenuProps["menu"];
  connectedCallback(){if(!this.mount){this.mount=document.createElement("div");this.mount.style.display="contents";this.append(this.mount);}if(!this.menuRoot)this.menuRoot=createRoot(this.mount);this.observer=new MutationObserver(records=>{if(records.some(record=>!this.mount?.contains(record.target)))this.schedule();});this.observer.observe(this,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["value","label","icon","disabled","destructive"]});this.schedule();}
  disconnectedCallback(){this.observer?.disconnect();queueMicrotask(()=>{if(!this.isConnected){this.menuRoot?.unmount();this.menuRoot=undefined;this.handle=null;}});}
  attributeChangedCallback(name:string){if(name==="disabled"&&this.disabled&&this.open)this.hide();this.schedule();}
  private flag(name:string){return this.hasAttribute(name)&&this.getAttribute(name)!=="false";}
  private schedule(){if(this.queued||!this.isConnected||!this.menuRoot)return;this.queued=true;queueMicrotask(()=>{this.queued=false;if(this.isConnected)flushSync(()=>this.renderMenu());});}
  get updateComplete(){return Promise.resolve().then(()=>{if(this.queued){this.queued=false;flushSync(()=>this.renderMenu());}});}
  private emit(name:string,detail:Record<string,unknown>={}){this.dispatchEvent(new CustomEvent(name,{detail,bubbles:true,composed:true}));}
  private readItems():FABMenuItem[]{
    if(this.itemData)return this.itemData;
    const items:FABMenuItem[]=Array.from(this.children).filter(child=>child.localName===`${this.localName}-item`).map((child,index)=>{(child as HTMLElement).hidden=true;const text=child.getAttribute("label")??child.textContent?.trim()??"";return {id:child.getAttribute("value")??(text||String(index)),text,icon:child.getAttribute("icon")||undefined,disabled:child.hasAttribute("disabled")&&child.getAttribute("disabled")!=="false",destructive:child.hasAttribute("destructive")};});
    const signature=JSON.stringify(items),cached=fabMenuDeclarations.get(this);if(cached?.signature===signature)return cached.items;fabMenuDeclarations.set(this,{signature,items});return items;
  }

  private renderMenu(){const outer=this.parentElement?.closest<HTMLElement>(".mf-root"),locale=this.getAttribute("locale")??outer?.lang,theme=this.getAttribute("theme")??outer?.dataset.theme,motion=this.getAttribute("motion")??outer?.dataset.motion;
    this.menuRoot?.render(<MaterialFluidProvider locale={locale==="fa"?"fa":"en"} theme={theme==="light"||theme==="dark"?theme:"system"} motion={motion==="minimal"||motion==="reduced"?"minimal":"expressive"} colorPreset={this.getAttribute("color-preset")==="standard"?"standard":"neutral"} accentSeed={this.getAttribute("accent-seed")??"#eedd96"}>
      <FABMenu ref={value=>{this.handle=value;}} ariaLabel={this.getAttribute("aria-label")??this.getAttribute("label")??undefined} icon={this.icon} closeIcon={this.closeIcon} color={this.color} size={this.size} presentation={this.presentation} placement={this.placement} open={this.open} disabled={this.disabled} active={this.active} items={this.readItems()} menu={this.customMenu} className={this.getAttribute("menu-class")??undefined} onOpenChange={value=>{this.open=value;}} onOpen={()=>this.emit("open")} onClose={()=>this.emit("close")} onSelect={event=>this.emit("select",{value:event.value,id:event.id})}/>
    </MaterialFluidProvider>);
  }
  get element(){return this.handle?.element??null;}get fab(){return this.handle?.fab??null;}get list(){return this.handle?.list??null;}
  get icon(){return this.getAttribute("icon")??"plus";}set icon(value:string){this.setAttribute("icon",value);}
  get closeIcon(){return this.getAttribute("close-icon")??"close";}set closeIcon(value:string){this.setAttribute("close-icon",value);}
  get color(){const value=this.getAttribute("color");return (value&&["primary","secondary","tertiary"].includes(value)?value:"primary") as FABMenuColor;}set color(value:FABMenuColor){this.setAttribute("color",value);}
  get size(){const value=this.getAttribute("size")??"default";return (["default","medium","large","xs","sm","md","lg","xl","s","m","l"].includes(value)?value:"default") as FABSize;}set size(value:FABSize){this.setAttribute("size",value);}
  get presentation(){const value=this.getAttribute("presentation");return (value&&["auto","list","menu"].includes(value)?value:"auto") as FABMenuPresentation;}set presentation(value:FABMenuPresentation){this.setAttribute("presentation",value);}
  get placement(){const value=this.getAttribute("placement");return (value&&["none","bottom-start","bottom-end"].includes(value)?value:"none") as FABMenuPlacement;}set placement(value:FABMenuPlacement){this.setAttribute("placement",value);}
  get open(){return this.flag("open");}set open(value:boolean){this.toggleAttribute("open",value);}
  get disabled(){return this.flag("disabled");}set disabled(value:boolean){if(value&&this.open)this.hide();this.toggleAttribute("disabled",value);}
  get active(){return this.flag("active");}set active(value:boolean){this.toggleAttribute("active",value);}
  get items(){return this.readItems();}set items(value:FABMenuItem[]){this.itemData=value;this.schedule();}
  get menu(){return this.customMenu;}set menu(value:FABMenuProps["menu"]){this.customMenu=value;this.schedule();}
  show(){if(!this.disabled&&!this.open){this.open=true;this.emit("open");}return this;}hide(){if(this.open){this.open=false;this.emit("close");}return this;}toggle(){return this.open?this.hide():this.show();}isOpen(){return this.open;}getPresentation(){return this.handle?.getPresentation()??(this.presentation==="auto"?window.matchMedia('(min-width: 600px)').matches?"menu":"list":this.presentation);}
  setItems(value:FABMenuItem[]){this.items=value;return this;}getItems(){return this.items;}setIcon(value:string){this.icon=value;return this;}setCloseIcon(value:string){this.closeIcon=value;return this;}setAriaLabel(value:string){this.setAttribute("aria-label",value);return this;}
  setSize(value:FABSize){this.size=value;return this;}setColor(value:FABMenuColor){this.color=value;return this;}setPresentation(value:FABMenuPresentation){this.presentation=value;return this;}setPlacement(value:FABMenuPlacement){this.placement=value;return this;}
  enable(){this.disabled=false;return this;}disable(){this.disabled=true;return this;}isDisabled(){return this.disabled;}
  on(name:string,callback:EventListener){this.addEventListener(name,callback);return this;}off(name:string,callback:EventListener){this.removeEventListener(name,callback);return this;}
  addClass(...classes:string[]){this.setAttribute("menu-class",[...new Set([...(this.getAttribute("menu-class")??"").split(/\s+/).filter(Boolean),...classes])].join(" "));return this;}getClass(name:string){return ({root:"mf-fab-menu",fab:"mf-fab-menu-trigger",list:"mf-fab-menu-list",item:"mf-fab-menu-item"} as Record<string,string>)[name]??`mf-fab-menu-${name}`;}
  override focus(options?:FocusOptions){this.fab?.focus(options);}destroy(){this.remove();}
}
export function defineMaterialFluidFABMenu(tagName="mf-fab-menu",registry:CustomElementRegistry=globalThis.customElements){if(!registry)throw new Error("MaterialFluid elements require a browser CustomElementRegistry.");const itemTag=`${tagName}-item`;if(!registry.get(itemTag))registry.define(itemTag,itemTag==="mf-fab-menu-item"?MaterialFluidFABMenuItemElement:class extends MaterialFluidFABMenuItemElement{});if(!registry.get(tagName))registry.define(tagName,tagName==="mf-fab-menu"?MaterialFluidFABMenuElement:class extends MaterialFluidFABMenuElement{});return tagName;}
declare global{interface HTMLElementTagNameMap{"mf-fab-menu":MaterialFluidFABMenuElement;"mf-fab-menu-item":MaterialFluidFABMenuItemElement;}}

function ProjectedExtendedLabel({nodes}:{nodes:Node[]}){const slot=useRef<HTMLSpanElement>(null);useLayoutEffect(()=>{for(const node of nodes)slot.current?.append(node);},[nodes]);return <span ref={slot}/>;}
export class MaterialFluidExtendedFABElement extends ElementBase {
  static observedAttributes=["label","aria-label","icon","icon-position","color","variant","size","width","placement","position","collapsed","collapse-on-scroll","disabled","active","type","name","value","form","theme","locale","motion","accent-seed","color-preset","button-class"];
  private fabRoot?:Root;private mount?:HTMLDivElement;private handle:ExtendedFABHandle|null=null;private queued=false;private nodes:Node[]=[];private observer?:MutationObserver;
  connectedCallback(){if(!this.mount){this.mount=document.createElement("div");this.mount.style.display="contents";}this.capture();if(!this.contains(this.mount))this.append(this.mount);if(!this.fabRoot)this.fabRoot=createRoot(this.mount);this.observer=new MutationObserver(records=>{if(records.some(record=>!this.mount?.contains(record.target)))this.schedule();});this.observer.observe(this,{subtree:true,childList:true,characterData:true});this.schedule();}
  disconnectedCallback(){this.observer?.disconnect();queueMicrotask(()=>{if(!this.isConnected){this.fabRoot?.unmount();this.fabRoot=undefined;this.handle=null;}});}
  attributeChangedCallback(){this.schedule();}
  private capture(){for(const node of Array.from(this.childNodes))if(node!==this.mount&&!this.nodes.includes(node))this.nodes.push(node);}
  private flag(name:string){return this.hasAttribute(name)&&this.getAttribute(name)!=="false";}
  private schedule(){if(this.queued||!this.isConnected||!this.fabRoot)return;this.queued=true;queueMicrotask(()=>{this.queued=false;if(this.isConnected)flushSync(()=>this.renderFAB());});}
  get updateComplete(){return Promise.resolve().then(()=>{if(this.queued){this.queued=false;flushSync(()=>this.renderFAB());}});}
  private renderFAB(){if(this.mount&&!this.contains(this.mount)){this.nodes=[];this.fabRoot?.unmount();this.capture();this.append(this.mount);this.fabRoot=createRoot(this.mount);}this.capture();const outer=this.parentElement?.closest<HTMLElement>(".mf-root"),theme=this.getAttribute("theme")??outer?.dataset.theme,locale=this.getAttribute("locale")??outer?.lang,motion=this.getAttribute("motion")??outer?.dataset.motion;
    this.fabRoot?.render(<MaterialFluidProvider theme={theme==="light"||theme==="dark"?theme:"system"} locale={locale==="fa"?"fa":"en"} motion={motion==="minimal"||motion==="reduced"?"minimal":"expressive"} colorPreset={this.getAttribute("color-preset")==="standard"?"standard":"neutral"} accentSeed={this.getAttribute("accent-seed")??"#eedd96"}>
      <ExtendedFAB ref={value=>{this.handle=value as ExtendedFABHandle|null;}} icon={this.icon||null} iconPosition={this.iconPosition} color={this.color} size={this.size} width={this.width} placement={this.placement} position={this.position} ariaLabel={this.getAttribute("aria-label")??undefined} disabled={this.disabled} active={this.active} type={this.type} name={this.name} value={this.value} form={this.getAttribute("form")??undefined} collapsed={this.collapsed} collapseOnScroll={this.collapseOnScroll} onCollapsedChange={value=>{this.collapsed=value;}} className={this.getAttribute("button-class")??undefined} onFocus={event=>this.dispatchEvent(new FocusEvent("focus",{relatedTarget:event.relatedTarget}))} onBlur={event=>this.dispatchEvent(new FocusEvent("blur",{relatedTarget:event.relatedTarget}))}>{this.hasAttribute("label")?this.label:<ProjectedExtendedLabel nodes={this.nodes}/>}</ExtendedFAB>
    </MaterialFluidProvider>);
  }
  get element(){return this.handle as HTMLButtonElement|null;}
  get label(){return this.getAttribute("label")??this.nodes.map(node=>node.textContent??"").join("").trim();}set label(value:string){this.setAttribute("label",value);}
  get icon(){return this.getAttribute("icon")??"";}set icon(value:string){this.setAttribute("icon",value);}
  get iconPosition(){return this.getAttribute("icon-position")==="end"?"end":"start";}set iconPosition(value:"start"|"end"){this.setAttribute("icon-position",value);}
  get color(){const value=this.getAttribute("color")??this.getAttribute("variant")??"primary-container";return (["primary-container","secondary-container","tertiary-container","primary","secondary","tertiary"].includes(value)?value:"primary-container") as FABColor;}set color(value:FABColor){this.setAttribute("color",value);}
  get variant(){return this.color;}set variant(value:FABColor){this.removeAttribute("color");this.setAttribute("variant",value);}
  get size(){const value=this.getAttribute("size");return (value==="medium"||value==="large"?value:"small") as ExtendedFABSize;}set size(value:ExtendedFABSize){this.setAttribute("size",value);}
  get width(){return this.getAttribute("width")==="fluid"?"fluid":"fixed";}set width(value:ExtendedFABWidth){this.setAttribute("width",value);}
  get placement(){const value=this.getAttribute("placement");return value&&["none","top-start","top-end","bottom-start","bottom-end"].includes(value)?value as FABPlacement:undefined;}set placement(value:FABPlacement|undefined){if(value)this.setAttribute("placement",value);else this.removeAttribute("placement");}
  get position(){const value=this.getAttribute("position");return value&&["top-left","top-right","bottom-left","bottom-right"].includes(value)?value as FABPosition:undefined;}set position(value:FABPosition|undefined){if(value)this.setAttribute("position",value);else this.removeAttribute("position");}
  get collapsed(){return this.flag("collapsed");}set collapsed(value:boolean){this.toggleAttribute("collapsed",value);}
  get collapseOnScroll(){return this.flag("collapse-on-scroll");}set collapseOnScroll(value:boolean){this.toggleAttribute("collapse-on-scroll",value);}
  get disabled(){return this.flag("disabled");}set disabled(value:boolean){this.toggleAttribute("disabled",value);}
  get active(){return this.flag("active");}set active(value:boolean){this.toggleAttribute("active",value);}
  get type(){const value=this.getAttribute("type");return value==="submit"||value==="reset"?value:"button";}set type(value:"button"|"submit"|"reset"){this.setAttribute("type",value);}
  get name(){return this.getAttribute("name")??"";}set name(value:string){this.setAttribute("name",value);}
  get value(){return this.getAttribute("value")??"";}set value(value:string){this.setAttribute("value",value);}
  setText(value:string){this.label=value;return this;}getText(){return this.label;}setIcon(value:string){this.icon=value;return this;}getIcon(){return this.icon;}
  setValue(value:string){this.value=value;return this;}getValue(){return this.value;}setSize(value:ExtendedFABSize){this.size=value;return this;}getSize(){return this.size;}setWidth(value:ExtendedFABWidth){this.width=value;return this;}getWidth(){return this.width;}
  setVariant(value:FABColor){this.variant=value;return this;}getVariant(){return this.variant;}setColor(value:FABColor){this.color=value;return this;}getColor(){return this.color;}
  setPlacement(value:FABPlacement|undefined){this.placement=value;return this;}getPlacement(){return this.placement??"none";}setPosition(value:FABPosition|undefined){this.position=value;return this;}getPosition(){return this.placement===undefined?this.position??null:null;}
  collapse(){this.collapsed=true;this.handle?.collapse();return this;}expand(){this.collapsed=false;this.handle?.expand();return this;}isCollapsed(){return this.collapsed;}
  enable(){this.disabled=false;return this;}disable(){this.disabled=true;return this;}isDisabled(){return this.disabled;}
  on(name:string,callback:EventListener){this.addEventListener(name,callback);return this;}off(name:string,callback:EventListener){this.removeEventListener(name,callback);return this;}
  addClass(...classes:string[]){this.setAttribute("button-class",[...new Set([...(this.getAttribute("button-class")??"").split(/\s+/).filter(Boolean),...classes])].join(" "));return this;}getClass(name:string){return ({root:"mf-extended-fab",icon:"mf-action-icon",label:"mf-extended-fab-label",text:"mf-extended-fab-label",ripple:"mf-button-ripple"} as Record<string,string>)[name]??`mf-extended-fab-${name}`;}
  override focus(options?:FocusOptions){this.element?.focus(options);}destroy(){this.remove();}
}
export function defineMaterialFluidExtendedFAB(tagName="mf-extended-fab",registry:CustomElementRegistry=globalThis.customElements){if(!registry)throw new Error("MaterialFluid elements require a browser CustomElementRegistry.");if(!registry.get(tagName))registry.define(tagName,tagName==="mf-extended-fab"?MaterialFluidExtendedFABElement:class extends MaterialFluidExtendedFABElement{});return tagName;}
declare global{interface HTMLElementTagNameMap{"mf-extended-fab":MaterialFluidExtendedFABElement;}}

export class MaterialFluidCheckboxElement extends ElementBase {
 static observedAttributes=["checked","disabled","required","error","value","name","form","label","label-position","aria-label","size","theme","locale","motion","accent-seed","color-preset"];
 private checkRoot?:Root;private mount?:HTMLDivElement;private handle:CheckboxHandle|null=null;private nodes:Node[]=[];private queued=false;private observer?:MutationObserver;private dirty=false;private live=false;private mixed=false;private ownerForm:HTMLFormElement|null=null;
 private reset=()=>queueMicrotask(()=>{this.dirty=false;this.live=this.defaultChecked;this.mixed=false;this.schedule();});
 private tap=(payload:CheckboxTapPayload)=>this.emit('tap',payload);private swipe=(payload:CheckboxSwipePayload)=>this.emit('swipe',payload);
 connectedCallback(){if(!this.mount){this.nodes=Array.from(this.childNodes);this.mount=document.createElement('div');this.mount.style.display='contents';this.mount.addEventListener('change',event=>event.stopPropagation());this.append(this.mount);}if(!this.checkRoot)this.checkRoot=createRoot(this.mount);if(!this.dirty)this.live=this.defaultChecked;this.observer=new MutationObserver(records=>{if(records.some(record=>!this.mount?.contains(record.target)))this.schedule();});this.observer.observe(this,{childList:true,subtree:true,characterData:true});this.schedule();}
 disconnectedCallback(){this.observer?.disconnect();this.ownerForm?.removeEventListener('reset',this.reset);this.ownerForm=null;queueMicrotask(()=>{if(!this.isConnected){this.checkRoot?.unmount();this.checkRoot=undefined;this.handle=null;}});}
 attributeChangedCallback(name:string){if(name==='checked'&&!this.dirty)this.live=this.defaultChecked;this.schedule();}
 private flag(name:string){return this.hasAttribute(name)&&this.getAttribute(name)!=='false';}
 private schedule(){if(this.queued||!this.isConnected||!this.checkRoot)return;this.queued=true;queueMicrotask(()=>{this.queued=false;if(this.isConnected){flushSync(()=>this.renderCheckbox());this.syncForm();}});}
 get updateComplete(){return Promise.resolve().then(()=>{if(this.queued){this.queued=false;flushSync(()=>this.renderCheckbox());this.syncForm();}});}
 private syncForm(){if(this.input)this.input.defaultChecked=this.defaultChecked;const form=this.input?.form??null;if(form!==this.ownerForm){this.ownerForm?.removeEventListener('reset',this.reset);this.ownerForm=form;form?.addEventListener('reset',this.reset);}}
 private emit(name:string,detail:unknown){this.dispatchEvent(new CustomEvent(name,{detail,bubbles:true,composed:true}));}
 private renderCheckbox(){for(const node of Array.from(this.childNodes))if(node!==this.mount&&!this.nodes.includes(node))this.nodes.push(node);const outer=this.parentElement?.closest<HTMLElement>('.mf-root'),theme=this.getAttribute('theme')??outer?.dataset.theme,locale=this.getAttribute('locale')??outer?.lang,motion=this.getAttribute('motion')??outer?.dataset.motion;
 this.checkRoot?.render(<MaterialFluidProvider theme={theme==='light'||theme==='dark'?theme:'system'} locale={locale==='fa'?'fa':'en'} motion={motion==='minimal'||motion==='reduced'?'minimal':'expressive'} colorPreset={this.getAttribute('color-preset')==='standard'?'standard':'neutral'} accentSeed={this.getAttribute('accent-seed')??'#eedd96'}><Checkbox ref={value=>{this.handle=value as CheckboxHandle|null;this.handle?.on('tap',this.tap).on('swipe',this.swipe);}} checked={this.checked} indeterminate={this.indeterminate} onCheckedChange={value=>{this.dirty=true;this.live=value===true;this.mixed=false;this.schedule();}} onChange={(event:CheckboxChangePayload)=>this.emit('change',event)} error={this.error} required={this.required} disabled={this.disabled} name={this.name} value={this.value} form={this.getAttribute('form')??undefined} ariaLabel={this.getAttribute('aria-label')??undefined} labelPosition={this.labelPosition} size={this.size}>{this.hasAttribute('label')?this.label:<ProjectedExtendedLabel nodes={this.nodes}/>}</Checkbox></MaterialFluidProvider>);
 }
 get element(){return this.handle?.element??null;}get input(){return this.handle?.input??null;}get form(){return this.input?.form??null;}
 get checked(){return this.dirty?this.live:this.defaultChecked;}set checked(value:boolean){this.dirty=true;this.live=!!value;this.mixed=false;this.schedule();}
 get defaultChecked(){return this.flag('checked');}set defaultChecked(value:boolean){this.toggleAttribute('checked',value);}
 get indeterminate(){return this.mixed;}set indeterminate(value:boolean){this.mixed=!!value;this.schedule();}
 get error(){return this.flag('error');}set error(value:boolean){this.toggleAttribute('error',value);}
 get disabled(){return this.flag('disabled');}set disabled(value:boolean){this.toggleAttribute('disabled',value);}
 get required(){return this.flag('required');}set required(value:boolean){this.toggleAttribute('required',value);}
 get name(){return this.getAttribute('name')??'';}set name(value:string){this.setAttribute('name',value);}
 get value(){return this.getAttribute('value')??'on';}set value(value:string){this.setAttribute('value',value);}
 get label(){return this.getAttribute('label')??this.nodes.map(node=>node.textContent??'').join('').trim();}set label(value:string){this.setAttribute('label',value);}
 get labelPosition(){return this.getAttribute('label-position')==='start'?'start':'end';}set labelPosition(value:'start'|'end'){this.setAttribute('label-position',value);}
 get size(){const value=this.getAttribute('size');return value==='sm'||value==='lg'?value:'md';}set size(value:'sm'|'md'|'lg'){this.setAttribute('size',value);}
 check(){this.checked=true;return this;}uncheck(){this.checked=false;return this;}toggle(){this.checked=!this.checked;return this;}isChecked(){return this.checked;}getValue(){return this.checked;}setValue(value:boolean|string){this.checked=value===true||value==='true'||value==='1';return this;}
 getValueAttribute(){return this.value;}setValueAttribute(value:string){this.value=value;return this;}getLabel(){return this.label;}setLabel(value:string){this.label=value;return this;}setIndeterminate(value:boolean){this.indeterminate=value;return this;}setError(value:boolean){this.error=value;return this;}
 enable(){this.disabled=false;return this;}disable(){this.disabled=true;return this;}isDisabled(){return this.disabled||this.input?.matches(':disabled')||false;}
 on(name:string,callback:EventListener){this.addEventListener(name,callback);return this;}off(name:string,callback:EventListener){this.removeEventListener(name,callback);return this;}
 checkValidity(){return this.input?.checkValidity()??true;}reportValidity(){return this.input?.reportValidity()??true;}
 override focus(options?:FocusOptions){this.handle?.focus(options);}override click(){this.handle?.click();}destroy(){this.remove();}
}
export function defineMaterialFluidCheckbox(tagName='mf-checkbox',registry:CustomElementRegistry=globalThis.customElements){if(!registry)throw new Error('MaterialFluid elements require a browser CustomElementRegistry.');if(!registry.get(tagName))registry.define(tagName,tagName==='mf-checkbox'?MaterialFluidCheckboxElement:class extends MaterialFluidCheckboxElement{});return tagName;}
declare global{interface HTMLElementTagNameMap{'mf-checkbox':MaterialFluidCheckboxElement;}}
