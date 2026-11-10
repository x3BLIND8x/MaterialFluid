import {forwardRef,useEffect,useImperativeHandle,useRef,useState,type ReactNode} from "react";
import {Button,type ButtonProps} from "./controls";
import {useComponentAppearance} from "./appearance";
import {fabSizes,type ButtonSizeInput} from "./component-policy";
import {cx} from "./utils";
export const fabColors=["primary-container","secondary-container","tertiary-container","primary","secondary","tertiary"] as const;
export type FABColor=(typeof fabColors)[number];
export type FABSize=ButtonSizeInput|(typeof fabSizes)[number];
export type FABPosition="top-right"|"top-left"|"bottom-right"|"bottom-left";
export type FABPlacement="none"|"top-start"|"top-end"|"bottom-start"|"bottom-end";
export type FABVariant=NonNullable<ButtonProps["variant"]>|FABColor;
export interface FABProps extends Omit<ButtonProps,"size"|"variant"> {
  size?:FABSize; variant?:FABVariant; color?:FABColor;
  placement?:FABPlacement; position?:FABPosition;
}
export interface FABEvent<E extends Event=Event> {event:E;originalEvent:E;element:HTMLButtonElement;}
export type FABEventType="click"|"focus"|"blur"|"touchstart"|"touchmove"|"touchend"|"touchcancel";
export interface FABHandle extends HTMLButtonElement {
  element:HTMLButtonElement;setValue(value:string):FABHandle;getValue():string;
  setIcon(icon:ReactNode):FABHandle;getIcon():ReactNode;setSize(size:FABSize):FABHandle;getSize():FABSize;
  setVariant(variant:FABVariant):FABHandle;getVariant():FABVariant;setColor(color:FABColor):FABHandle;getColor():FABColor|undefined;
  setPosition(position:FABPosition|undefined):FABHandle;getPosition():FABPosition|null;
  setPlacement(placement:FABPlacement|undefined):FABHandle;getPlacement():FABPlacement;
  enable():FABHandle;disable():FABHandle;isDisabled():boolean;
  on(event:FABEventType,listener:(event:FABEvent)=>void):FABHandle;off(event:FABEventType,listener:(event:FABEvent)=>void):FABHandle;
  addClass(...classes:string[]):FABHandle;getClass(name:string):string;destroy():void;
}
/** Reference additions keep native Button refs, existing variants and authored motion. */
export const FAB=forwardRef<HTMLButtonElement|FABHandle,FABProps>(function FAB(rawProps,ref){
  const defaults=useComponentAppearance();
  const [overrides,setOverrides]=useState<Partial<FABProps>>({}),[extraClasses,setExtraClasses]=useState<string[]>([]),[destroyed,setDestroyed]=useState(false);
  const {size:requestedSize,color:requestedColor,variant:requestedVariant,placement,position,icon,disabled=false,className,...props}={...rawProps,...overrides};
  const container=requestedVariant?.endsWith("-container")?requestedVariant as FABColor:undefined;
  const modern=requestedColor!==undefined||container!==undefined;
  const size=requestedSize??(modern?"default":defaults.size??"lg");
  const reference=fabSizes.includes(size as (typeof fabSizes)[number]);
  const color=requestedColor??container??(reference&&(!requestedVariant||fabColors.includes(requestedVariant as FABColor))?(requestedVariant as FABColor??"primary-container"):undefined);
  const buttonSize:ButtonSizeInput=size==="default"?"md":size==="medium"||size==="large"?"lg":size;
  const variant=container?"filled":requestedVariant as ButtonProps["variant"]??defaults.variant;
  const element=useRef<HTMLButtonElement>(null),handle=useRef<FABHandle|null>(null),alive=useRef(true);
  const current=useRef({icon,disabled,size,color,variant:requestedVariant??"filled",placement,position});current.current={icon,disabled,size,color,variant:requestedVariant??"filled",placement,position};
  const listeners=useRef(new Map<FABEventType,Map<(event:FABEvent)=>void,EventListener>>());
  const cleanup=()=>{for(const [name,callbacks]of listeners.current)for(const callback of callbacks.values())(handle.current??element.current)?.removeEventListener(name,callback);listeners.current.clear();};
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;cleanup();};},[]);
  useImperativeHandle(ref,()=>{
    if(destroyed)return handle.current!;
    const button=element.current! as FABHandle;handle.current=button;
    const update=(patch:Partial<FABProps>)=>{if(alive.current)setOverrides(previous=>({...previous,...patch}));return button;};
    return Object.assign(button,{element:button,
      setValue:(value:string)=>{button.value=value;return update({value});},getValue:()=>button.value,
      setIcon:(next:ReactNode)=>{current.current.icon=next;return update({icon:next});},getIcon:()=>current.current.icon,
      setSize:(next:FABSize)=>{current.current.size=next;return update({size:next});},getSize:()=>current.current.size,
      setVariant:(next:FABVariant)=>{current.current.variant=next;return update({variant:next,color:undefined});},getVariant:()=>current.current.variant,
      setColor:(next:FABColor)=>{current.current.color=next;return update({color:next});},getColor:()=>current.current.color,
      setPosition:(next:FABPosition|undefined)=>{current.current.position=next;return update({position:next});},getPosition:()=>current.current.placement===undefined?current.current.position??null:null,
      setPlacement:(next:FABPlacement|undefined)=>{current.current.placement=next;return update({placement:next});},getPlacement:()=>current.current.placement??"none",
      enable:()=>{current.current.disabled=false;button.disabled=false;return update({disabled:false});},disable:()=>{current.current.disabled=true;button.disabled=true;return update({disabled:true});},isDisabled:()=>current.current.disabled,
      on:(name:FABEventType,callback:(event:FABEvent)=>void)=>{if(!alive.current)return button;if(!listeners.current.has(name))listeners.current.set(name,new Map());const map=listeners.current.get(name)!;if(!map.has(callback)){const listener:EventListener=event=>{if(name!=="click"||!button.disabled)callback({event,originalEvent:event,element:button});};map.set(callback,listener);button.addEventListener(name,listener);}return button;},
      off:(name:FABEventType,callback:(event:FABEvent)=>void)=>{const listener=listeners.current.get(name)?.get(callback);if(listener)button.removeEventListener(name,listener);listeners.current.get(name)?.delete(callback);return button;},
      addClass:(...classes:string[])=>{button.classList.add(...classes);setExtraClasses(previous=>[...new Set([...previous,...classes])]);return button;},getClass:(name:string)=>({fab:"mf-fab",root:"mf-fab",icon:"mf-action-icon",ripple:"mf-button-ripple"} as Record<string,string>)[name]??`mf-${name}`,
      destroy:()=>{alive.current=false;cleanup();setDestroyed(true);},
    });
  });
  if(destroyed)return null;
  return <Button {...props} ref={element} icon={icon} disabled={disabled} variant={variant} size={buttonSize} className={cx("mf-fab",`mf-fab--${size}`,className,...extraClasses)} data-fab-size={reference?size:undefined} data-fab-color={color} data-fab-placement={placement} data-fab-position={placement===undefined?position:undefined}/>;
});
