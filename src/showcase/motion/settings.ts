import { buttonMotionDefaults } from '../../kit/provider';
import { accordionMotionDefaults } from '../../kit/surfaces';
import { alertDialogMotionDefaults } from '../../kit/overlays';
import { springRest } from '../../kit/motion-engine';
import { savedMotionPresets } from '../../kit/motion-presets';
export const examples = [
  ['spring', 'Spring & transform', 'فنر و تبدیل', 'Move, scale and rotate a target.', 'حرکت، اندازه و چرخش یک هدف.'],
  ['button', 'Button press & ripple', 'فشار دکمه و موج', 'Hold, release and rapidly press the original button.', 'دکمه اصلی را نگه دارید، رها کنید و سریع فشار دهید.'],
  ['accordion', 'Accordion', 'آکاردئون', 'An empty hold preview, spring height and an opening-only reveal.', 'پیش‌نمایش خالی، ارتفاع فنری و نمایان شدن هنگام باز شدن.'],
  ['dialog', 'Alert dialog', 'گفت‌وگوی هشدار', 'A centered spring entrance with real focus management.', 'ورود فنری با مدیریت واقعی تمرکز.'],
  ['tabs', 'Moving selection', 'انتخاب متحرک', 'A shared indicator follows keyboard and pointer selection.', 'نشانگر مشترک انتخاب صفحه‌کلید و اشاره‌گر را دنبال می‌کند.'],
  ['menu', 'Dropdown menu', 'منوی بازشو', 'Enter and exit with offset, scale, blur and opacity.', 'ورود و خروج با جابه‌جایی، اندازه، تاری و شفافیت.'],
  ['list', 'Stagger & layout', 'توالی و چیدمان', 'Add, remove and reverse a list without losing continuity.', 'افزودن، حذف و معکوس کردن فهرست با حفظ پیوستگی.'],
  ['toast', 'Notification stack', 'پشته اعلان‌ها', 'Stack and dismiss messages with entrance and layout motion.', 'چیدن و بستن پیام‌ها با حرکت ورود و چیدمان.'],
  ['drag', 'Drag & return', 'کشیدن و بازگشت', 'Drag within bounds; tune elasticity and the return spring.', 'در محدوده بکشید؛ کشسانی و فنر بازگشت را تنظیم کنید.'],
  ['reveal', 'Text reveal', 'نمایان شدن متن', 'A short, staggered phrase with adjustable blur and distance.', 'عبارت کوتاه و متوالی با تاری و فاصله قابل تنظیم.'],
] as const;
export type ExampleId = typeof examples[number][0];
export interface Settings { engine: 'physics' | 'duration' | 'tween'; ease: 'easeOut' | 'easeInOut' | 'linear'; values: Record<string, number>; settlingVersion?: 1 }
export const springTransformDefaults: Settings = {
  engine: 'duration', ease: 'easeOut',
  values: {duration: .5, bounce: .3, delay: 0, x: 80, y: 0, scale: 1.15, rotate: 0},
};
export type SavedSettings = Record<ExampleId, Settings>;
export type Knob = readonly [string, string, string, number, number, number, string?];
export const physics: readonly Knob[] = [
  ['stiffness','Stiffness','سختی فنر',20,1000,5], ['damping','Damping','میرایی',1,80,1],
  ['mass','Mass','جرم',.1,5,.1], ['velocity','Initial velocity','سرعت اولیه',-100,100,1],
  ['restSpeed','Rest speed','سرعت توقف',.01,10,.01,'px/s'], ['restDelta','Rest distance','فاصله توقف',.001,2,.001,'px'],
];
export const timing: readonly Knob[] = [
  ['duration','Duration','مدت',.05,3,.05,'s'], ['bounce','Bounce','جهش',0,.9,.05], ['delay','Delay','تأخیر',0,2,.05,'s'],
];
export const transform: readonly Knob[] = [
  ['x','Horizontal distance','فاصله افقی',-200,200,1,'px'], ['y','Vertical distance','فاصله عمودی',-100,100,1,'px'],
  ['scale','Scale','مقیاس',.2,1.5,.01,'×'], ['rotate','Rotation','چرخش',-180,180,1,'°'],
  ['opacity','Starting opacity','شفافیت آغاز',0,1,.05], ['blur','Starting blur','تاری آغاز',0,20,.5,'px'],
];
export const extras: Record<ExampleId, readonly Knob[]> = {
  spring: [...transform.slice(0,4)],
  button: [
    ['pressDepth','Press depth','عمق فشار',0,20,1,'%'], ['radiusDepthRatio','Radius reduction per depth','کاهش گردی با عمق',0,15,.5],
    ['colorDuration','Color duration','مدت رنگ',0,1200,10,'ms'], ['sizeDamping','Resize damping','میرایی تغییر اندازه',10,80,1],
    ['rippleDuration','Ripple duration','مدت موج',100,1500,10,'ms'], ['rippleOpacity','Ripple opacity','شفافیت موج',0,30,1,'%'],
    ['rippleFastStart','Ripple fast start','شروع سریع موج',0,95,1,'%'], ['rippleReleaseSpeed','Ripple release speed','سرعت رهاسازی موج',1,5,.25,'×'],
  ],
  accordion: [['previewHeight','Hold preview height','ارتفاع پیش‌نمایش نگه داشتن',0,32,1,'px'], ['revealBlur','Reveal blur','تاری نمایان شدن',0,20,.5,'px'], ['revealDuration','Reveal duration','مدت نمایان شدن',0,1,.01,'s']],
  dialog: [['initialScale','Entrance scale','مقیاس ورود',.5,1.2,.01,'×'], ['fadeDuration','Fade duration','مدت نمایان شدن',0,1,.01,'s']],
  tabs: [['pressDepth','Press depth','عمق فشار',0,20,1,'%'], ['radiusDepthRatio','Radius reduction per depth','کاهش گردی با عمق',0,15,.5]],
  menu: transform,
  list: [...transform, ['stagger','Item stagger','تأخیر هر مورد',0,.4,.01,'s']],
  toast: transform,
  drag: [['elastic','Drag elasticity','کشسانی کشیدن',0,1,.05], ['returnStiffness','Return stiffness','سختی بازگشت',20,1000,5], ['returnDamping','Return damping','میرایی بازگشت',1,80,1]],
  reveal: [...transform, ['stagger','Word stagger','تأخیر هر واژه',0,.4,.01,'s']],
};
export const physicalOnly = (id: ExampleId) => ['button','accordion','dialog','drag','tabs'].includes(id);
export function defaults(id: ExampleId): Settings {
  const config: Settings = {engine:'physics',ease:'easeOut',settlingVersion:1,values:{
    ...buttonMotionDefaults,stiffness:460,damping:id==='accordion'?26:id==='button'||id==='dialog'?12:20,mass:1,velocity:0,...springRest.pixel,
    duration:.4,bounce:.25,delay:0,x:id==='spring'?80:0,y:id==='spring'?0:18,scale:id==='spring'?1.15:.94,rotate:0,opacity:0,blur:5,
    previewHeight:8,revealBlur:5,revealDuration:.2,initialScale:.94,fadeDuration:.16,stagger:.07,elastic:.2,returnStiffness:460,returnDamping:26,
  }};
  if(id==='spring')return {...config,...springTransformDefaults,values:{...config.values,...springTransformDefaults.values}};
  if(id==='button'||id==='tabs')Object.assign(config.values,buttonMotionDefaults);
  if(id==='accordion')Object.assign(config.values,accordionMotionDefaults);
  if(id==='dialog')Object.assign(config.values,alertDialogMotionDefaults);
  if(id in savedMotionPresets) {
    const saved = savedMotionPresets[id as keyof typeof savedMotionPresets];
    return {...config,engine:saved.engine,ease:saved.ease,values:{...config.values,...saved.values}};
  }
  return config;
}
export function freshSettings(): SavedSettings {
  return Object.fromEntries(examples.map(([id])=>[id,defaults(id)])) as SavedSettings;
}
export const storageKey='materialfluid.motion-playground.v1';
export function loadSettings(): SavedSettings {
  const result=freshSettings();
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey)??'null');
    for (const [id] of examples) {
      const config=saved?.[id];if(!config)continue;
      if(['physics','duration','tween'].includes(config.engine))result[id].engine=config.engine;
      if(['easeOut','easeInOut','linear'].includes(config.ease))result[id].ease=config.ease;
      for(const [key,,,min,max] of [...physics,...timing,...extras[id]]){
        const value=config.values?.[key];if(typeof value==='number'&&Number.isFinite(value))result[id].values[key]=Math.min(max,Math.max(min,value));
      }
      if(!config.settlingVersion&&config.values?.restSpeed===.1&&config.values?.restDelta===.01)Object.assign(result[id].values,springRest.pixel);
      if(id==='toast')result[id].values.y=-Math.abs(result[id].values.y);
    }
  } catch { /* Invalid or unavailable storage uses the authored defaults. */ }
  return result;
}
