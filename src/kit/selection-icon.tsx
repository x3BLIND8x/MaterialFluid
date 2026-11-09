import { useEffect, useId, type CSSProperties } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useMaterialFluid } from "./provider";
import { getMaterialIcon, type IconName } from "./icon-registry";

/** Private toggle fill: official outline stays visible while the filled contour reveals from its center. */
export function SelectionIcon({name,selected,pressed,className,style}:{name:IconName;selected:boolean;pressed:MotionValue<number>;className?:string;style?:CSSProperties}) {
  const {motion:mode,reducedMotion,buttonMotion}=useMaterialFluid();
  const glyph=getMaterialIcon(name),[x,y,width,height]=glyph.viewBox.split(/\s+/).map(Number);
  const id=`mf-selection-icon-${useId().replaceAll(":","")}`;
  const fill=useMotionValue(selected?1:0),extent=Math.hypot(width,height)/2;
  const animated=mode==="expressive"&&!reducedMotion;
  const radius=useTransform([fill,pressed],([progress,depth]:number[])=>extent*Math.max(0,Math.min(1,progress*(1-(animated?depth*.75:0))+(1-progress)*(animated?depth*.25:0))));
  useEffect(()=>{
    if(!animated){fill.jump(selected?1:0);return;}
    const animation=animate(fill,selected?1:0,{duration:buttonMotion.rippleDuration/1000,ease:[1-Math.min(.95,Math.max(0,buttonMotion.rippleFastStart/100)),1,.3,1]});
    return()=>animation.stop();
  },[selected,animated,fill,buttonMotion.rippleDuration,buttonMotion.rippleFastStart]);
  return <span className={`mf-animated-icon mf-selection-icon${className?` ${className}`:""}`} style={{width:22,height:22,...style}} aria-hidden="true" data-icon-name={name} data-icon-source="material-symbols-rounded" data-icon-fill={selected?"filled":"outlined"}>
    <svg viewBox={glyph.viewBox} fill="currentColor" aria-hidden="true"><defs><clipPath id={id}><motion.circle cx={x+width/2} cy={y+height/2} style={{r:radius}}/></clipPath></defs>
      {(glyph.outlinePaths??glyph.paths).map((d,index)=><path className="mf-selection-icon-outline" key={index} d={d}/>)}
      <g clipPath={`url(#${id})`}>{glyph.paths.map((d,index)=><path className="mf-selection-icon-fill" key={index} d={d}/>)}</g>
    </svg>
  </span>;
}
