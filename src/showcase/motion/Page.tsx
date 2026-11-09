import { FoundationMotionOverview } from "../foundations/motion-overview";
import { MotionPreviewContext } from "../../kit/internal-motion";
import { useEffect, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, LayoutGroup, motion, type Transition } from 'motion/react';
import { Tabs } from '../../kit/navigation';
import { Button, IconButton, Slider } from '../../kit/controls';
import { TextField, Select } from '../../kit/forms';
import { Accordion } from '../../kit/surfaces';
import { AlertDialog, Menu } from '../../kit/overlays';
import { AnimatedIcon } from '../../kit/icons';
import { MaterialFluidProvider, buttonMotionDefaults, useMaterialFluid } from '../../kit/provider';
import { settledSpring, springRest } from '../../kit/motion-engine';
import { defaults, examples, extras, loadSettings, physicalOnly, physics, storageKey, timing, type ExampleId, type Knob, type Settings } from './settings';
import './motion.css';

function transitionFor(config: Settings, disabled: boolean): Transition {
  const v=config.values;
  if(disabled)return {duration:0};
  if(config.engine==='tween')return {type:'tween',duration:v.duration,ease:config.ease,delay:v.delay};
  if(config.engine==='duration')return settledSpring({type:'spring',duration:v.duration,bounce:v.bounce,delay:v.delay});
  return settledSpring({type:'spring',stiffness:v.stiffness,damping:v.damping,mass:v.mass,velocity:v.velocity,restSpeed:v.restSpeed,restDelta:v.restDelta,delay:v.delay});
}
function Preview({id,config,run,fa}: {id:ExampleId;config:Settings;run:number;fa:boolean}) {
  const env=useMaterialFluid();
  const disabled=env.reducedMotion||env.motion==='minimal';
  const v=config.values;
  const transition=transitionFor(config,disabled);
  const [active,setActive]=useState(false);
  const [selected,setSelected]=useState('design');
  const [accordionValue,setAccordionValue]=useState('');
  const [items,setItems]=useState([1,2,3]);
  const serial=useRef(4);
  const dragBounds=useRef<HTMLDivElement>(null);
  const [keyboardPosition,setKeyboardPosition]=useState({x:0,y:0});
  const t=(en:string,persian:string)=>fa?persian:en;
  const hidden=disabled?{x:0,y:0,scale:1,rotate:0,opacity:1,filter:'blur(0px)'}:{x:v.x,y:v.y,scale:v.scale,rotate:v.rotate,opacity:v.opacity,filter:`blur(${v.blur}px)`};
  const visible={x:0,y:0,scale:1,rotate:0,opacity:1,filter:'blur(0px)'};
  const reset=()=>{setActive(false);setItems([1,2,3]);};
  const notify=()=>setItems(old=>[serial.current++,...old].slice(0,4));
  useEffect(()=>{
    if(!run)return;
    const frame=requestAnimationFrame(()=>{
      if(id==='spring'||id==='dialog'||id==='menu')setActive(true);
      if(id==='accordion')setAccordionValue('one');
      if(id==='tabs')setSelected('motion');
    });
    return ()=>cancelAnimationFrame(frame);
  },[id,run]);
  if(id==='button')return <MotionPreviewContext.Provider value={{ buttonMotion: {...buttonMotionDefaults,...v} }}><MaterialFluidProvider className="motion-button-provider" locale={env.locale} theme={env.theme} accentSeed={env.accentSeed} colorDesign={env.colorDesign} colorPreset={env.colorPreset} neutralColors={env.neutralColors} colorScheme={env.colorScheme} colorBehavior={env.colorBehavior} motion={env.motion}>
    <div className="motion-button-samples"><Button>{t('Hold me','من را نگه دارید')}</Button><Button variant="tonal">{t('Try a quick tap','سریع فشار دهید')}</Button><IconButton label={t('Press icon button','فشار دکمه آیکن')}><AnimatedIcon name="heart"/></IconButton></div>
  </MaterialFluidProvider></MotionPreviewContext.Provider>;
  if(id==='accordion')return <MotionPreviewContext.Provider value={{ accordion: {stiffness:v.stiffness,damping:v.damping,mass:v.mass,previewHeight:v.previewHeight,revealBlur:v.revealBlur,revealDuration:v.revealDuration} }}><div className="motion-example-width"><Accordion value={accordionValue} onValueChange={setAccordionValue} items={[
    {value:'one',title:t('Hold before opening','پیش از باز کردن نگه دارید'),content:<p>{t('A little anticipation, then the full reveal. The title stays still and the preview stays empty.','کمی انتظار، سپس نمایش کامل. عنوان ثابت و پیش‌نمایش خالی می‌ماند.')}</p>},
    {value:'two',title:t('Try closing and reopening','بستن و باز کردن دوباره را امتحان کنید'),content:<p>{t('Content stays clear while closing. Interrupt the spring to feel the continuity.','محتوا هنگام بسته شدن واضح می‌ماند. حرکت فنر را قطع کنید تا پیوستگی را حس کنید.')}</p>},
  ]}/></div></MotionPreviewContext.Provider>;
  if(id==='dialog')return <MotionPreviewContext.Provider value={{ dialog: {stiffness:v.stiffness,damping:v.damping,mass:v.mass,initialScale:v.initialScale,fadeDuration:v.fadeDuration} }}><AlertDialog open={active} onOpenChange={setActive} title={t('A moment of focus','لحظه‌ای برای تمرکز')} description={t('Tune the entrance, close, and open again. Escape and keyboard focus work as usual.','ورود را تنظیم کنید، ببندید و دوباره باز کنید. Escape و تمرکز صفحه‌کلید فعال‌اند.')} trigger={<Button>{t('Open spring dialog','باز کردن گفت‌وگوی فنری')}</Button>} confirmLabel={t('Looks good','خوب است')}/></MotionPreviewContext.Provider>;
  if(id==='tabs')return <MotionPreviewContext.Provider value={{ buttonMotion: {...buttonMotionDefaults,...v} }}><MaterialFluidProvider className="motion-button-provider" locale={env.locale} theme={env.theme} accentSeed={env.accentSeed} colorDesign={env.colorDesign} colorPreset={env.colorPreset} neutralColors={env.neutralColors} colorScheme={env.colorScheme} colorBehavior={env.colorBehavior} motion={env.motion}><LayoutGroup id={`motion-tabs-${run}`}><Tabs className="motion-selection" value={selected} onValueChange={setSelected} label={t('Motion selection','انتخاب حرکت')} items={['design','motion','code'].map((tab,index)=>({value:tab,label:[t('Design','طراحی'),t('Motion','حرکت'),t('Code','کد')][index],content:<div className="motion-tab-panel"><AnimatedIcon name={tab==='design'?'palette':tab==='motion'?'activity':'copy'}/><p>{tab==='design'?t('Hold or drag across tabs to change the pill depth and radius.','برای تغییر عمق و گردی نشانگر، زبانه را نگه دارید یا میان زبانه‌ها بکشید.'):tab==='motion'?t('Try the arrow keys to move the selection.','با کلیدهای جهت انتخاب را جابه‌جا کنید.'):t('Copy your settings when it feels right.','وقتی حس خوبی داشت، تنظیمات را کپی کنید.')}</p></div>}))}/></LayoutGroup></MaterialFluidProvider></MotionPreviewContext.Provider>;
  if(id==='menu')return <MotionPreviewContext.Provider value={{ menu: {x:v.x,y:v.y,scale:v.scale,rotate:v.rotate,opacity:v.opacity,blur:v.blur,transition} }}><Menu open={active} onOpenChange={setActive} label={t('Motion menu','منوی حرکت')} trigger={<Button variant="outline">{t('Open menu','باز کردن منو')}<AnimatedIcon name="chevron-down" size={18}/></Button>} items={['Save preset','Duplicate','Export settings'].map((name,index)=>({id:name,label:fa?['ذخیره پیش‌تنظیم','تکثیر','خروجی تنظیمات'][index]:name,icon:<AnimatedIcon name={index===0?'check':index===1?'copy':'download'} size={18}/>,onSelect:()=>setActive(false)}))}/></MotionPreviewContext.Provider>;
  if(id==='drag')return <div className="motion-drag-area" ref={dragBounds}><motion.button className="motion-drag-target" drag={!disabled} dragConstraints={dragBounds} dragElastic={disabled?0:v.elastic} dragSnapToOrigin dragMomentum={false} dragTransition={{bounceStiffness:v.returnStiffness,bounceDamping:v.returnDamping,...springRest.pixel}} animate={keyboardPosition} transition={disabled?{duration:0}:{type:'spring',stiffness:v.returnStiffness,damping:v.returnDamping,...springRest.pixel}} onKeyDown={event=>{
    if(event.key==='Home'){event.preventDefault();setKeyboardPosition({x:0,y:0});}
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();setKeyboardPosition(old=>({x:Math.max(-75,Math.min(75,old.x+(event.key==='ArrowLeft'?-15:event.key==='ArrowRight'?15:0))),y:Math.max(-50,Math.min(50,old.y+(event.key==='ArrowUp'?-15:event.key==='ArrowDown'?15:0)))}));}
  }}><AnimatedIcon name="sliders"/><span>{t('Drag me','من را بکشید')}</span></motion.button><span className="motion-drag-hint">{t('Arrow keys move · Home returns','کلیدهای جهت: حرکت · Home: بازگشت')}</span></div>;
  if(id==='spring')return <div className="motion-spring-demo"><div className="motion-target-track"><motion.div className="motion-target" animate={!disabled&&active?{x:v.x,y:v.y,scale:v.scale,rotate:v.rotate}:{x:0,y:0,scale:1,rotate:0}} transition={transition}><AnimatedIcon name="activity" size={32}/></motion.div></div><Button variant="outline" onClick={()=>setActive(!active)}>{active?t('Return','بازگشت'):t('Animate target','حرکت هدف')}</Button></div>;
  if(id==='reveal')return <div className="motion-reveal" aria-label={t('Made to move. Built to use.','برای حرکت. برای استفاده.')}><span aria-hidden="true">{(fa?'برای حرکت. برای استفاده.':'Made to move. Built to use.').split(' ').map((word,index)=><motion.span key={`${run}-${index}`} initial={hidden} animate={visible} transition={{...transition,delay:disabled?0:v.delay+index*v.stagger}}>{word} </motion.span>)}</span></div>;
  return <div className="motion-list-demo"><div className="motion-example-actions"><Button size="sm" onClick={id==='toast'?notify:()=>setItems(old=>[...old,serial.current++].slice(-6))}>{id==='toast'?t('Notify me','نمایش اعلان'):t('Add item','افزودن مورد')}</Button>{id==='list'&&<Button size="sm" variant="outline" onClick={()=>setItems(old=>[...old].reverse())}>{t('Reverse','معکوس')}</Button>}<Button size="sm" variant="ghost" onClick={reset}>{t('Reset items','بازنشانی موارد')}</Button></div>
    <div className="motion-demo-list" aria-label={id==='toast'?t('Notifications','اعلان‌ها'):t('Animated list','فهرست متحرک')}><AnimatePresence initial={run>0} mode="popLayout">{items.map((item,index)=><motion.div key={item} layout={!disabled} className="motion-demo-row" initial={hidden} animate={visible} exit={hidden} transition={{...transition,delay:disabled?0:v.delay+(id==='list'?index*v.stagger:0),filter:id==='list'?{...transition,delay:0}:undefined}} role={id==='toast'?'status':undefined}><AnimatedIcon name={id==='toast'?'check-check':'layers'} size={20}/><div><strong>{id==='toast'?t('Changes saved','تغییرات ذخیره شد'):t(`Motion study ${item}`,`مطالعه حرکت ${item}`)}</strong><span>{id==='toast'?t(`Notification ${item}`,`اعلان ${item}`):t('Add, remove, rearrange.','اضافه، حذف و جابه‌جا کنید.')}</span></div><IconButton size="sm" variant="ghost" label={t(`Dismiss item ${item}`,`بستن مورد ${item}`)} onClick={()=>setItems(old=>old.filter(value=>value!==item))}><AnimatedIcon name="close" size={16}/></IconButton></motion.div>)}</AnimatePresence>{!items.length&&<p className="mf-muted">{t('Add an item to see the entrance.','موردی اضافه کنید تا ورود را ببینید.')}</p>}</div>
  </div>;
}

export default function MotionPage({fa,heading}: {fa:boolean;heading:RefObject<HTMLHeadingElement|null>}) {
  const env=useMaterialFluid();
  const [id,setId]=useState<ExampleId>('accordion');
  const [saved,setSaved]=useState(loadSettings);
  const [run,setRun]=useState(0);
  const [notice,setNotice]=useState('');
  const [showCode,setShowCode]=useState(false);
  const settingsId = id === 'tabs' ? 'button' : id;
  const config=saved[settingsId],v=config.values;
  const t=(en:string,persian:string)=>fa?persian:en;
  const example=examples.find(entry=>entry[0]===id)!;
  const disabled=env.reducedMotion||env.motion==='minimal';
  const change=(patch:Partial<Settings>)=>setSaved(old=>({...old,[settingsId]:{...old[settingsId],...patch}}));
  const changeNumber=(key:string,value:number)=>change({values:{...v,[key]:value}});
  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{setNotice(fa?'ذخیره محلی در دسترس نیست.':'Local saving is unavailable.');}},[saved,fa]);
  useEffect(()=>{setNotice('');},[id]);
  const exported = { example: id, engine: config.engine, ease: config.ease, values: v };
  const code=`// ${example[1]} · playground experiment\nconst experimentSettings = ${JSON.stringify(exported,null,2)};`;
  const copy=async()=>{try{await navigator.clipboard.writeText(code);setNotice(t('Configuration copied.','تنظیمات کپی شد.'));}catch{setShowCode(true);setNotice(t('Select and copy the configuration below.','تنظیمات زیر را انتخاب و کپی کنید.'));}};
  const download=()=>{const blob=new Blob([JSON.stringify({version:1,examples:saved},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='materialfluid-motion.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice(t('All example settings exported.','تنظیمات همه نمونه‌ها خروجی گرفته شد.'));};
  const knobs=(list:readonly Knob[])=>list.map(([key,en,persian,min,max,step,unit])=><div className="motion-knob" key={key}><Slider label={`${fa?persian:en}${unit?` (${unit})`:''}`} value={[v[key]]} min={min} max={max} step={step} onValueChange={([value])=>changeNumber(key,value)}/><TextField type="number" inputMode="decimal" label={t(`${en} value`,`مقدار ${persian}`)} labelPosition="none" size="sm" value={v[key]} min={min} max={max} step={step} onChange={event=>{if(event.target.value!==''&&Number.isFinite(event.target.valueAsNumber))changeNumber(key,Math.max(min,Math.min(max,event.target.valueAsNumber)));}}/></div>);
  const physicsKnobs=id==='drag'?[]:physicalOnly(id)?physics.slice(0,3):config.engine==='physics'?physics:[];
  return <div className="motion-page">
    <header className="motion-page-heading"><div><h1 ref={heading} tabIndex={-1}>{t('Motion playground','آزمایشگاه حرکت')}</h1><p>{t('Tune the feel. Hold, interrupt, replay. Make the motion yours.','حس حرکت را تنظیم کنید. نگه دارید، قطع کنید و دوباره ببینید.')}</p></div><Button variant="outline" size="sm" onClick={download}><AnimatedIcon name="download" size={18}/>{t('Export all','خروجی همه')}</Button></header>
    <FoundationMotionOverview/>
    <nav className="motion-example-picker" aria-label={t('Motion examples','نمونه‌های حرکت')}>{examples.map(([value,en,persian])=><Button key={value} variant={id===value?'tonal':'ghost'} size="sm" aria-pressed={id===value} onClick={()=>{setId(value);setRun(0);}}>{fa?persian:en}</Button>)}</nav>
    {disabled&&<p className="motion-notice" role="status">{env.reducedMotion?t('System reduced motion is enabled. Previews remain interactive with motion removed.','کاهش حرکت سیستم فعال است. نمونه‌ها بدون حرکت قابل استفاده‌اند.'):t('Minimal mode is enabled. Choose Fluid in the header to preview springs.','حالت کمینه فعال است. برای دیدن فنرها، حالت روان را از بالای صفحه انتخاب کنید.')}</p>}
    <div className="motion-workspace"><section className="motion-preview-panel" aria-labelledby="motion-preview-heading"><div className="motion-preview-toolbar"><div><h2 id="motion-preview-heading">{fa?example[2]:example[1]}</h2><p>{fa?example[4]:example[3]}</p></div><Button size="sm" variant="outline" onClick={()=>setRun(old=>old+1)}><AnimatedIcon name="activity" size={18}/>{id==='button'||id==='drag'?t('Reset preview','بازنشانی پیش‌نمایش'):t('Replay','اجرای دوباره')}</Button></div>
      <div className="motion-stage"><Preview key={`${id}-${run}`} id={id} config={config} run={run} fa={fa}/></div>
      <div className="motion-preview-footer"><span>{id==='tabs'?t('Shares Button press & ripple depth and radius. Hold a tab, then release.','عمق و گردی مشترک با فشار دکمه و موج. زبانه را نگه دارید و رها کنید.'):t('Settings are saved on this device, separately for each example.','تنظیمات هر نمونه جداگانه در این دستگاه ذخیره می‌شود.')}</span><span>{t('Your other components keep their defaults.','پیش‌فرض دیگر کامپوننت‌ها تغییر نمی‌کند.')}</span></div>
      <div className="motion-code-actions"><Button variant="ghost" size="sm" aria-expanded={showCode} aria-controls="motion-code" onClick={()=>setShowCode(!showCode)}>{t('View configuration','نمایش تنظیمات')}</Button><Button variant="outline" size="sm" onClick={copy}>{t('Copy configuration','کپی تنظیمات')}</Button></div>
      {showCode&&<pre id="motion-code" className="motion-code" tabIndex={0} dir="ltr"><code>{code}</code></pre>}
      <p className="motion-status" role="status">{notice}</p>
    </section>
    <aside className="motion-settings" aria-label={t('Animation parameters','پارامترهای انیمیشن')}><div className="motion-settings-heading"><h2>{t('Parameters','پارامترها')}</h2><Button size="sm" variant="ghost" onClick={()=>{setSaved(old=>({...old,[settingsId]:defaults(settingsId)}));setRun(old=>old+1);}}>{t('Reset','بازنشانی')}</Button></div>
      {id==='tabs'&&<p className="motion-settings-note">{t('Linked to Button press & ripple. These controls tune the pill’s press depth, radius and return spring.','به فشار دکمه و موج متصل است. این کنترل‌ها عمق فشار، گردی و فنر بازگشت نشانگر را تنظیم می‌کنند.')}</p>}
      {id!=='drag'&&<div className="motion-presets" aria-label={t('Spring presets','پیش‌تنظیم فنر')}>{[['Soft',180,24,1.2],['Snappy',650,34,.7],['Bouncy',360,12,1]].map(([label,stiffness,damping,mass])=><Button key={label} size="sm" variant="outline" onClick={()=>{change({engine:'physics',values:{...v,stiffness:Number(stiffness),damping:Number(damping),mass:Number(mass)}});setRun(old=>old+1);}}>{fa?label==='Soft'?'نرم':label==='Snappy'?'سریع':'جهشی':label}</Button>)}</div>}
      {!physicalOnly(id)&&<Select size="sm" label={t('Animation engine','موتور انیمیشن')} value={config.engine} onValueChange={value=>change({engine:value as Settings['engine']})} options={[{value:'physics',label:t('Physical spring','فنر فیزیکی')},{value:'duration',label:t('Duration spring','فنر زمانی')},{value:'tween',label:t('Tween / easing','زمان و منحنی')}]}/>}
      {!!physicsKnobs.length&&<fieldset><legend>{t('Spring physics','فیزیک فنر')}</legend>{knobs(physicsKnobs)}</fieldset>}
      {!physicalOnly(id)&&<fieldset><legend>{t('Timing','زمان‌بندی')}</legend>{knobs(config.engine==='physics'?timing.slice(2):config.engine==='duration'?timing:[timing[0],timing[2]])}{config.engine==='tween'&&<Select size="sm" label={t('Easing','منحنی حرکت')} value={config.ease} onValueChange={value=>change({ease:value as Settings['ease']})} options={['easeOut','easeInOut','linear'].map(value=>({value,label:value}))}/>}</fieldset>}
      {!!extras[id].length&&<fieldset><legend>{t('Interaction & appearance','تعامل و ظاهر')}</legend>{knobs(extras[id])}</fieldset>}
      <p className="motion-settings-note">{t('Changes apply live. Replay reveals and entrances after adjusting. Durations use seconds unless marked ms.','تغییرات زنده اعمال می‌شوند. پس از تنظیم، ورود را دوباره اجرا کنید. زمان‌ها ثانیه‌اند مگر با ms مشخص شده باشند.')}</p>
    </aside></div>
    <p className="motion-reference">{t('Example coverage inspired by the ','پوشش نمونه‌ها با الهام از ')}<a href="https://motion.dev/examples" target="_blank" rel="noreferrer">Motion examples gallery</a>{t('. Built with MaterialFluid controls and its own motion.','؛ ساخته‌شده با کنترل‌ها و حرکت MaterialFluid.')}</p>
  </div>;
}
