import { Children, Fragment, isValidElement, forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Button, type ButtonProps } from "./controls";
import { Menu, type MenuItem } from "./overlays";
import { AnimatedIcon } from "./icons";
import { normalizeButtonSize, type ButtonSizeInput } from "./component-policy";
import { useComponentAppearance } from "./appearance";
import { useMaterialFluid } from "./provider";
import { ButtonCompositionContext } from "./internal-motion";
import { useCurveValue } from "./curve-value";
import { cx, useControllable } from "./utils";

export type SplitButtonItem = Omit<MenuItem,"label"|"items"> & {label?:ReactNode;text?:string;items?:SplitButtonItem[]};
export type SplitButtonEventType = "click"|"expand"|"collapse"|"change"|"select"|"open"|"close";
export interface SplitButtonEvent { splitButton:SplitButtonHandle|null; expanded:boolean; originalEvent:Event|null; item?:SplitButtonItem; value?:string; }
export interface SplitButtonProps extends Omit<ButtonProps,"children"|"size"|"onSelect"|"onChange"|"onOpen"|"onClose"> {
  size?:ButtonSizeInput; label?:string; children?:ReactNode;
  menuLabel?:string; trailingLabel?:string; groupLabel?:string;
  items?:SplitButtonItem[]; layer?:"top";
  expanded?:boolean; defaultExpanded?:boolean;
  onExpandedChange?:(expanded:boolean)=>void;
  onOpen?:(event:SplitButtonEvent)=>void; onClose?:(event:SplitButtonEvent)=>void;
  onExpand?:(event:SplitButtonEvent)=>void; onCollapse?:(event:SplitButtonEvent)=>void;
  onChange?:(event:SplitButtonEvent)=>void; onSelect?:(event:SplitButtonEvent)=>void;
  on?:Partial<Record<SplitButtonEventType,(event:SplitButtonEvent)=>void>>;
}
export interface SplitButtonItemProps extends Omit<SplitButtonItem,"id"> {id?:string;value?:string;children?:ReactNode;}
/** Declarative menu content, consumed by its parent SplitButton. */
export function SplitButtonItem(_props:SplitButtonItemProps){return null;}
const splitChildren=(children:ReactNode):ReactNode[]=>Children.toArray(children).flatMap(child=>isValidElement<{children?:ReactNode}>(child)&&child.type===Fragment?splitChildren(child.props.children):[child]);
/** Extends the original native leading-button ref for backwards compatibility. */
export interface SplitButtonHandle extends HTMLButtonElement {
  element:HTMLDivElement; leadingElement:HTMLButtonElement; trailingElement:HTMLButtonElement;
  setText(text:string):SplitButtonHandle; getText():string; setIcon(icon:ReactNode):SplitButtonHandle;
  setItems(items:SplitButtonItem[]):SplitButtonHandle; getItems():SplitButtonItem[];
  expand():SplitButtonHandle; collapse():SplitButtonHandle; isExpanded():boolean;
  enable():SplitButtonHandle; disable():SplitButtonHandle; isDisabled():boolean;
  on(event:SplitButtonEventType,handler:(event:SplitButtonEvent)=>void):SplitButtonHandle;
  off(event:SplitButtonEventType,handler:(event:SplitButtonEvent)=>void):SplitButtonHandle;
  destroy():void;
}
interface PartProps extends ButtonProps { end?:boolean; expanded?:boolean; inner:number; activeInner:number; }
const Part=forwardRef<HTMLButtonElement,PartProps>(function Part({end=false,expanded=false,inner,activeInner,onPointerEnter,onPointerLeave,onFocus,onBlur,...props},ref){
  const [hover,setHover]=useState(false),[focus,setFocus]=useState(false);
  const {motion:mode,reducedMotion}=useMaterialFluid();
  const corner=useCurveValue(inner);
  useLayoutEffect(()=>{const goal=hover||focus?activeInner:inner;if(mode!=="expressive"||reducedMotion)corner.jump(goal);else if(corner.get()!==goal)corner.setTarget(goal);},[hover,focus,inner,activeInner,corner,mode,reducedMotion]);
  return <ButtonCompositionContext.Provider value={{size:false,color:true,press:true,ripple:true,corners:end&&expanded?undefined:{first:!end,last:end,vertical:false,inner:corner}}}>
    <Button {...props} ref={ref} onPointerEnter={event=>{setHover(true);onPointerEnter?.(event);}} onPointerLeave={event=>{setHover(false);onPointerLeave?.(event);}} onFocus={event=>{setFocus(true);onFocus?.(event);}} onBlur={event=>{setFocus(false);onBlur?.(event);}}/>
  </ButtonCompositionContext.Provider>;
});
export const SplitButton=forwardRef<HTMLButtonElement|SplitButtonHandle,SplitButtonProps>(function SplitButton(rawProps,ref){
  const defaults=useComponentAppearance(),{motion:mode,reducedMotion,locale,dir}=useMaterialFluid();
  const [overrides,setOverrides]=useState<Partial<SplitButtonProps>>({});
  const {label,text,children,menuLabel,trailingLabel,groupLabel,items:providedItems,layer,expanded:controlled,defaultExpanded=false,onExpandedChange,onExpand,onCollapse,onOpen,onClose,onChange,onSelect,on,disabled=false,variant=defaults.variant??"filled",size:requestedSize=defaults.size??"sm",className,onClick,icon,...props}={...rawProps,...overrides};
  const content=splitChildren(children),declarations=content.filter(child=>isValidElement(child)&&child.type===SplitButtonItem),leadingContent=content.filter(child=>!isValidElement(child)||child.type!==SplitButtonItem);
  const declared=(child:ReactNode,index:number):SplitButtonItem=>{
    const {value,id,children,...item}=(child as React.ReactElement<SplitButtonItemProps>).props;
    const contents=splitChildren(children),nested=contents.filter(node=>isValidElement(node)&&node.type===SplitButtonItem),label=contents.filter(node=>!isValidElement(node)||node.type!==SplitButtonItem);
    return {...item,id:id??value??String(index),label:label.length===1?label[0]:label.length?label:item.label,items:item.items??(nested.length?nested.map(declared):undefined)};
  };
  const items:SplitButtonItem[]=providedItems??declarations.map(declared);
  const size=normalizeButtonSize(requestedSize),caption=leadingContent.length===1?leadingContent[0]:leadingContent.length?leadingContent:label??text;
  const trailingName=trailingLabel||menuLabel||(locale==="fa"?"گزینه‌های بیشتر":"More options");
  const [expanded,setExpanded]=useControllable(controlled,defaultExpanded,onExpandedChange);
  const [menuCreated,setHasMenu]=useState(items.length>0),[destroyed,setDestroyed]=useState(false);
  const hasMenu=items.length>0||overrides.items!==undefined&&menuCreated;
  useLayoutEffect(()=>{if(items.length)setHasMenu(true);},[items.length]);
  const root=useRef<HTMLDivElement>(null),leading=useRef<HTMLButtonElement>(null),trailing=useRef<HTMLButtonElement>(null),handle=useRef<SplitButtonHandle|null>(null);
  const current=useRef(expanded&&!disabled),original=useRef<Event|null>(null);current.current=expanded&&!disabled;
  const liveItems=useRef(items),liveCaption=useRef(caption),liveDisabled=useRef(disabled),dead=useRef(false);
  liveItems.current=items;liveCaption.current=caption;liveDisabled.current=disabled;
  const listeners=useRef(new Map<SplitButtonEventType,Set<(event:SplitButtonEvent)=>void>>());
  const emit=(type:SplitButtonEventType,extra:Partial<SplitButtonEvent>={})=>{
    const detail:SplitButtonEvent={splitButton:handle.current,expanded:current.current,originalEvent:original.current,...extra};
    if(type==="expand"){onExpand?.(detail);onOpen?.(detail);on?.open?.(detail);listeners.current.get("open")?.forEach(listener=>listener(detail));}else if(type==="collapse"){onCollapse?.(detail);onClose?.(detail);on?.close?.(detail);listeners.current.get("close")?.forEach(listener=>listener(detail));}else if(type==="change")onChange?.(detail);else if(type==="select")onSelect?.(detail);
    on?.[type]?.(detail);listeners.current.get(type)?.forEach(listener=>listener(detail));
  };
  const change=(next:boolean)=>{if(next&&(liveDisabled.current||dead.current)||current.current===next)return;current.current=next;setExpanded(next);emit(next?"expand":"collapse");emit("change");};
  const latestChange=useRef(change);latestChange.current=change;
  useEffect(()=>{if(disabled&&expanded){current.current=true;latestChange.current(false);}},[disabled,expanded]);
  useEffect(()=>{if(!expanded||destroyed)return;const remember=(event:Event)=>{original.current=event;};window.addEventListener("pointerdown",remember,true);window.addEventListener("keydown",remember,true);return()=>{window.removeEventListener("pointerdown",remember,true);window.removeEventListener("keydown",remember,true);};},[expanded,destroyed]);
  useImperativeHandle(ref,()=>{
    if(destroyed)return handle.current!;
    const button=leading.current! as SplitButtonHandle;handle.current=button;
    const setting=(patch:Partial<SplitButtonProps>)=>{setOverrides(previous=>({...previous,...patch}));return button;};
    return Object.assign(button,{element:root.current!,leadingElement:button,trailingElement:trailing.current!,
      setText:(text:string)=>{liveCaption.current=text;return setting({text,label:undefined,children:undefined,items:liveItems.current});},getText:()=>typeof liveCaption.current==="string"?liveCaption.current:button.textContent??"",setIcon:(icon:ReactNode)=>setting({icon}),
      setItems:(items:SplitButtonItem[])=>{liveItems.current=items;return setting({items});},getItems:()=>liveItems.current,
      expand:()=>{original.current=null;change(true);return button;},collapse:()=>{original.current=null;change(false);return button;},isExpanded:()=>current.current,
      enable:()=>{liveDisabled.current=false;return setting({disabled:false});},disable:()=>{liveDisabled.current=true;change(false);return setting({disabled:true});},isDisabled:()=>liveDisabled.current,
      on:(type:SplitButtonEventType,listener:(event:SplitButtonEvent)=>void)=>{if(!listeners.current.has(type))listeners.current.set(type,new Set());listeners.current.get(type)!.add(listener);return button;},
      off:(type:SplitButtonEventType,listener:(event:SplitButtonEvent)=>void)=>{listeners.current.get(type)?.delete(listener);return button;},
      destroy:()=>{dead.current=true;change(false);listeners.current.clear();setDestroyed(true);},
    });
  });
  const rotate=useCurveValue(current.current?180:0,"popup"),offset=useCurveValue(0,"popup");
  useLayoutEffect(()=>{const angle=current.current?180:0,x=current.current?0:({xs:1,sm:1,md:2,lg:2,xl:3})[size]*(dir==="rtl"?1:-1);if(mode!=="expressive"||reducedMotion){rotate.jump(angle);offset.jump(x);}else{rotate.setTarget(angle);offset.setTarget(x);}},[expanded,disabled,size,dir,mode,reducedMotion,rotate,offset]);
  const inner=({xs:4,sm:4,md:8,lg:12,xl:16})[size],activeInner=({xs:8,sm:10,md:12,lg:18,xl:20})[size];
  const menuItems=(entries:SplitButtonItem[]):MenuItem[]=>entries.map(item=>({...item,label:item.label??item.text??item.id,items:item.items?menuItems(item.items):undefined,onSelect:event=>{original.current=event??null;item.onSelect?.(event);emit("select",{item,value:item.id});}}));
  const trigger=<Part ref={trailing} end expanded={current.current} inner={inner} activeInner={activeInner} type="button" className="mf-split-button-trailing" size={size} variant={variant} disabled={disabled} aria-label={trailingName} aria-haspopup={hasMenu||items.length?"menu":"true"} aria-expanded={current.current}
    onPointerDownCapture={event=>{original.current=event.nativeEvent;}} onKeyDownCapture={event=>{original.current=event.nativeEvent;}}
    onClick={hasMenu||items.length?undefined:event=>{original.current=event.nativeEvent;change(!current.current);}}>
    <motion.span className="mf-split-button-chevron" style={{rotate,x:offset}} aria-hidden="true"><AnimatedIcon name="chevron-down"/></motion.span>
  </Part>;
  if(destroyed)return null;
  return <div ref={root} role="group" aria-label={groupLabel||(typeof caption==="string"&&caption?caption:trailingName)} aria-disabled={disabled||undefined} data-expanded={current.current||undefined} className={cx("mf-split-button",`mf-scale--${size}`,className)}>
    <Part {...props} ref={leading} className="mf-split-button-leading" size={size} variant={variant} disabled={disabled} inner={inner} activeInner={activeInner} icon={icon} ariaLabel={props.ariaLabel||(caption==null||caption===""?(locale==="fa"?"اقدام اصلی":"Primary action"):undefined)} onClick={event=>{original.current=event.nativeEvent;onClick?.(event);if(!event.defaultPrevented)emit("click");}}><span className="mf-split-button-label">{caption}</span></Part>
    {hasMenu||items.length?<Menu label={trailingName} open={current.current} onOpenChange={change} size={size==="xs"?"sm":size==="xl"?"lg":size} layer={layer} align="end" sideOffset={4} trigger={trigger} items={menuItems(items)}/>:trigger}
  </div>;
});
