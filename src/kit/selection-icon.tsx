import { useEffect, type CSSProperties } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useMaterialFluid } from "./provider";
import { getMaterialIcon, type IconName } from "./icon-registry";

/** Crossfade the actual outline and filled artwork without altering either contour. */
export function SelectionIcon({name,selected,className,style}:{name:IconName;selected:boolean;className?:string;style?:CSSProperties}) {
  const {motion:mode,reducedMotion}=useMaterialFluid();
  const glyph=getMaterialIcon(name), fill=useMotionValue(selected?1:0);
  const outline=useTransform(fill,value=>1-value);
  const animated=mode==="expressive"&&!reducedMotion;
  useEffect(()=>{
    if(!animated){fill.jump(selected?1:0);return;}
    const animation=animate(fill,selected?1:0,{duration:.18,ease:[.2,0,0,1]});
    return()=>animation.stop();
  },[selected,animated,fill]);
  return <span className={`mf-animated-icon mf-selection-icon${className?` ${className}`:""}`} style={{width:22,height:22,...style}} aria-hidden="true" data-icon-name={name} data-icon-source="material-symbols-rounded" data-icon-fill={selected?"filled":"outlined"}>
    <svg viewBox={glyph.viewBox} fill="currentColor" aria-hidden="true">
      <motion.g className="mf-selection-icon-outline" style={{opacity:outline}}>{(glyph.outlinePaths??glyph.paths).map((d,index)=><path key={index} d={d}/>)}</motion.g>
      <motion.g className="mf-selection-icon-fill" style={{opacity:fill}}>{glyph.paths.map((d,index)=><path key={index} d={d}/>)}</motion.g>
    </svg>
  </span>;
}
