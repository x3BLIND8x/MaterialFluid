import { useState, type HTMLAttributes, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMaterialFluid } from '../provider';
import { motionEngine } from '../motion-engine';
import { cx } from '../utils';
export interface ChartProps extends HTMLAttributes<HTMLDivElement> {
  data: {label:string;value:number;secondary?:number}[];
  label:string;
  variant?:'bar'|'line'|'area'|'pie';
  valueLabel?:string;
  secondaryLabel?:string;
}
export function Chart({data,label,variant='bar',valueLabel='Activity',secondaryLabel='Previous period',className,...props}:ChartProps) {
  const [active,setActive]=useState<number|null>(null);
  const {motion:mode,reducedMotion}=useMaterialFluid();
  const enabled=mode==='expressive'&&!reducedMotion,transition=motionEngine.layout(enabled);
  const values=data.flatMap(d=>[d.value,d.secondary??0]).filter(Number.isFinite);
  const min=Math.min(0,...values),max=Math.max(1,...values),span=max-min||1;
  const left=48,right=598,top=20,bottom=235,step=(right-left)/Math.max(1,data.length);
  const x=(i:number)=>left+step*(i+.5),y=(v:number)=>bottom-(v-min)/span*(bottom-top);
  const baseline=y(0),hasSecondary=data.some(d=>d.secondary!==undefined);
  const points=(secondary=false)=>data.map((d,i)=>`${x(i)},${y(secondary?d.secondary??0:d.value)}`).join(' ');
  const hit=(i:number)=>({tabIndex:0,role:'img' as const,'aria-label':`${data[i].label}: ${valueLabel} ${data[i].value}${data[i].secondary===undefined?'':`, ${secondaryLabel} ${data[i].secondary}`}`,onPointerEnter:()=>setActive(i),onPointerLeave:(event:PointerEvent<SVGElement>)=>{if(document.activeElement!==event.currentTarget)setActive(null);},onFocus:()=>setActive(i),onBlur:()=>setActive(null)});
  const total=data.reduce((sum,d)=>sum+Math.max(0,d.value),0)||1;let pieOffset=0;
  return <figure {...props} className={cx('mf-pattern-chart',className)} data-variant={variant}>
    <figcaption>{label}</figcaption>
    <div className="mf-chart-plot">
      <svg viewBox="0 0 620 280" role="group" aria-label={label}>
        {variant!=='pie'&&<>
          {[0,.25,.5,.75,1].map(t=><g key={t}><line x1={left} x2={right} y1={top+t*(bottom-top)} y2={top+t*(bottom-top)} className="mf-chart-grid"/><text x={left-8} y={top+t*(bottom-top)+4} textAnchor="end">{Math.round(max-t*span)}</text></g>)}
          {variant==='area'&&<polygon points={`${left+step/2},${baseline} ${points()} ${x(data.length-1)},${baseline}`} className="mf-chart-area"/>}
          {(variant==='line'||variant==='area')&&<><polyline points={points()} className="mf-chart-line"/>{hasSecondary&&<polyline points={points(true)} className="mf-chart-line mf-chart-secondary"/>}</>}
          {data.map((d,i)=><g key={d.label}>
            {variant==='bar'?<><motion.rect x={x(i)-step*.3} width={step*(hasSecondary?.27:.6)} initial={false} animate={{y:y(Math.max(0,d.value)),height:Math.abs(y(d.value)-baseline)}} rx={5} className="mf-chart-bar" transition={transition}/>{hasSecondary&&<motion.rect x={x(i)+step*.03} width={step*.27} initial={false} animate={{y:y(Math.max(0,d.secondary??0)),height:Math.abs(y(d.secondary??0)-baseline)}} rx={5} className="mf-chart-bar mf-chart-secondary" transition={transition}/>}</>:<><circle cx={x(i)} cy={y(d.value)} r={active===i?6:4} className="mf-chart-point"/>{hasSecondary&&<circle cx={x(i)} cy={y(d.secondary??0)} r={4} className="mf-chart-point mf-chart-secondary"/>}</>}
            <rect {...hit(i)} x={x(i)-step/2} y={top} width={step} height={bottom-top} fill="transparent" className="mf-chart-hit"/>
            <text x={x(i)} y={260} textAnchor="middle">{d.label}</text>
          </g>)}
        </>}
        {variant==='pie'&&data.map((d,i)=>{const fraction=Math.max(0,d.value)/total,start=pieOffset;pieOffset+=fraction;return <circle key={d.label} {...hit(i)} cx={310} cy={135} r={85} fill="none" stroke={`var(--mf-misc-${['blue','teal','green','amber','rose','violet'][i%6]})`} strokeWidth={48} pathLength={100} strokeDasharray={`${Math.max(0,fraction*100-.8)} ${100-fraction*100+.8}`} strokeDashoffset={-start*100} transform="rotate(-90 310 135)"/>;})}
      </svg>
      <AnimatePresence>{active!==null&&data[active]&&<motion.div key={active} {...motionEngine.popup(enabled)} role="tooltip" className="mf-tooltip mf-chart-tooltip" style={{insetInlineStart:`${variant==='pie'?50:Math.max(18,Math.min(82,x(active)/620*100))}%`}}><strong>{data[active].label}</strong><span>{valueLabel}: {data[active].value}</span>{data[active].secondary!==undefined&&<span>{secondaryLabel}: {data[active].secondary}</span>}</motion.div>}</AnimatePresence>
    </div>
    <div className="mf-chart-legend">{variant==='pie'?data.map(d=><span key={d.label}>{d.label} · {d.value}</span>):<><span>{valueLabel}</span>{hasSecondary&&<span>{secondaryLabel}</span>}</>}</div>
  </figure>;
}
