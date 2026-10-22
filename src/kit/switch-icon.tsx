import { useEffect, useRef } from "react";
import { motion } from "motion/react";

export type SwitchStateIcon = "check" | "lock" | "hotspot" | "vpn" | "bell" | "theme" | "flashlight" | "airplane" | "mobile-data" | "usb-tether" | "mute" | "color-inversion";
const flashlight = ["M8 3h8v5l-2 3v10h-4V11L8 8z", "M8 6h8"];
const airplane = ["M10 13.8 3.675 16.325Q3.075 16.575 2.538 16.212Q2 15.85 2 15.2V14.65Q2 14.35 2.138 14.075Q2.275 13.8 2.525 13.625L10 8.4V4Q10 3.175 10.588 2.587Q11.175 2 12 2Q12.825 2 13.413 2.587Q14 3.175 14 4V8.4L21.475 13.625Q21.725 13.8 21.863 14.075Q22 14.35 22 14.65V15.2Q22 15.85 21.462 16.212Q20.925 16.575 20.325 16.325L14 13.8V17.4L16.575 19.2Q16.775 19.35 16.888 19.562Q17 19.775 17 20.025V20.625Q17 21.125 16.587 21.438Q16.175 21.75 15.675 21.6L12 20.5L8.325 21.6Q7.825 21.75 7.412 21.438Q7 21.125 7 20.625V20.025Q7 19.775 7.113 19.562Q7.225 19.35 7.425 19.2L10 17.4Z"];
const mobileData = ["M7 3v18M3 7l4-4 4 4", "M17 21V3M13 17l4 4 4-4"];
const usb = ["M12 21V3m-2 3 2-3 2 3", "M12 16l-5-4V8M12 13l5-4V6", "M6 7h2v2H6zM16 4h2v2h-2z"];
const speaker = ["M4 9h4l5-4v14l-5-4H4z"];
const inversion = ["M12 3S4 11 4 15a8 8 0 0 0 16 0c0-4-8-12-8-12z", "M12 3v20"];
const slash = "M3 3l18 18";
const paths: Record<SwitchStateIcon, [string[], string[]]> = {
  flashlight: [[...flashlight, slash], flashlight],
  airplane: [[...airplane, slash], airplane],
  "mobile-data": [[...mobileData, slash], mobileData],
  "usb-tether": [[...usb, slash], usb],
  mute: [[...speaker, "M17 8a6 6 0 0 1 0 8M20 5a10 10 0 0 1 0 14"], [...speaker, "M17 9l5 6M22 9l-5 6"]],
  "color-inversion": [[...inversion, slash], inversion],
  check: [["M6 6l12 12M18 6L6 18"], ["M5 12l4 4L19 6"]],
  lock: [["M8 10V7a4 4 0 0 1 8 0", "M6 10h12v11H6z", "M12 14v3"], ["M8 10V7a4 4 0 0 1 8 0v3", "M6 10h12v11H6z", "M12 14v3"]],
  hotspot: [["M12 11v2", "M8 8a6 6 0 0 0 0 8M16 8a6 6 0 0 1 0 8", "M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14", "M4 4l16 16"], ["M12 11v2", "M8 8a6 6 0 0 0 0 8M16 8a6 6 0 0 1 0 8", "M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"]],
  vpn: [["M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z", "M9 9l6 6M15 9l-6 6"], ["M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z", "M8 12l3 3 5-6"]],
  bell: [["M5 17h14l-2-3V9a5 5 0 0 0-10 0v5z", "M10 21h4", "M3 3l18 18"], ["M5 17h14l-2-3V9a5 5 0 0 0-10 0v5z", "M10 21h4", "M3 7V5M21 7V5"]],
  theme: [["M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10"], ["M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0", "M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"]],
};

export function SwitchIcon({ name, active, animated, duration = 1, stagger = .07, slashDelay = .15, strokeWidth = 2 }: {
  name: SwitchStateIcon; active: boolean; animated: boolean;
  duration?: number; stagger?: number; slashDelay?: number; strokeWidth?: number;
}) {
  const statePaths = paths[name][active ? 1 : 0];
  const isSlash = (d: string) => d === slash || d === "M4 4l16 16";
  const slashed = statePaths.some(isSlash);
  const previousSlash = useRef<boolean | null>(null);
  const retractSlash = previousSlash.current === true && !slashed;
  useEffect(() => { previousSlash.current = slashed; }, [slashed]);
  const strands = statePaths.filter(d => !isSlash(d)).flatMap(d => d.match(/M[^M]+/g) ?? [d]);
  const filledPlane = name === "airplane" && active;
  return <svg key={`${name}-${active}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "color-inversion" && active && <motion.path d="M12 3v20a8 8 0 0 0 8-8c0-4-8-12-8-12z" fill="currentColor" stroke="none" initial={animated ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: animated ? .35 * duration : 0 }} />}
    {strands.map((d, i) => <motion.path key={i} d={d}
      fill={filledPlane ? "currentColor" : "none"}
      strokeWidth={name === "airplane" ? (active ? 0 : 1.5) : strokeWidth}
      initial={animated ? { pathLength: 0, opacity: 0, fillOpacity: 0 } : false}
      animate={{ pathLength: 1, opacity: 1, fillOpacity: 1 }}
      transition={{ duration: animated ? .35 * duration : 0, delay: animated ? i * stagger * duration : 0, ease: "easeOut" }} />)}
    {(slashed || retractSlash) && <motion.path d={slash}
      initial={animated ? { pathLength: retractSlash ? 1 : 0, opacity: 1 } : false}
      animate={{ pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 }}
      transition={{ duration: animated ? .35 * duration : 0, delay: animated ? slashDelay * duration : 0, ease: "easeOut" }} />}
  </svg>;
}
