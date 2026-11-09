import type { CSSProperties } from "react";
import { settledSpring, springRestForExtent } from './spring-rest';
import { savedMotionPresets } from './motion-presets';
import { motionTransition } from './bounded-motion';
import type { Transition } from 'motion/react';

interface MotionSurfaceAnimation {
  style?: CSSProperties;
  initial: false | Record<string, string | number>;
  animate: Record<string, string | number>;
  transition: Transition;
}

/** One source of truth for every exported overlay and its playground preview. */
export const dialogMotionDefaults = {stiffness:500,damping:30,mass:1,initialScale:.95,fadeDuration:.15};
export type DialogMotionSettings = typeof dialogMotionDefaults;
export const motionEngine = {
  dialog(enabled:boolean, overrides:Partial<DialogMotionSettings> = {}, resize=true, offsetY=0): MotionSurfaceAnimation {
    const config={...dialogMotionDefaults,...overrides};
    return {
      style: { '--mf-dialog-exit-scale': resize ? config.initialScale : 1, '--mf-dialog-fade': `${enabled ? config.fadeDuration : 0}s` } as CSSProperties,
      initial: enabled ? {'--mf-dialog-scale':resize?config.initialScale:1,'--mf-dialog-offset-y':offsetY,opacity:0} : false as const,
      animate: {'--mf-dialog-scale':1,'--mf-dialog-offset-y':0,opacity:1},
      transition: enabled ? {...motionTransition("dialog"),'--mf-dialog-offset-y':motionTransition("dialog"),opacity:{duration:config.fadeDuration}} : {duration:0},
    };
  },
  rangeSpring(pixelsPerUnit:number) { return {stiffness:360,damping:26.56,mass:1,...springRestForExtent(pixelsPerUnit)}; },
  layout(enabled:boolean): Transition { return enabled?settledSpring({type:'spring',stiffness:500,damping:30,mass:1}):{duration:0}; },
  popup(enabled:boolean): MotionSurfaceAnimation {
    const v=savedMotionPresets.menu.values;
    return {initial:enabled?{opacity:0,y:v.y,scale:v.scale,filter:`blur(${v.blur}px)`}:false as const,animate:{opacity:1,y:0,scale:1,filter:'blur(0px)'},transition:enabled?{...motionTransition("popup"),opacity:{duration:.15},filter:{duration:.15}}:{duration:0}};
  },
  tooltip(enabled:boolean, width:number): MotionSurfaceAnimation {
    return {initial:enabled?{opacity:0,width:0}:false as const,animate:{opacity:1,width},transition:enabled?{opacity:{duration:.1},width:{duration:.24,delay:.04,ease:'easeOut' as const}}:{duration:0}};
  },
};

export { settledSpring, springRest, springRestForExtent } from "./spring-rest";
