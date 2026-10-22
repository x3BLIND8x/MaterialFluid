import { useState, type HTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMaterialFluid } from "./provider";
import { cx } from "./utils";

export interface RollingNumberProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  format?: (value: number) => string;
}
/** Individual digit reels move up for increases and down for decreases. */
export function RollingNumber({ value, format = String, className, ...props }: RollingNumberProps) {
  const { motion: mode, reducedMotion } = useMaterialFluid();
  const [previous, setPrevious] = useState({ value, direction: 1 });
  if (previous.value !== value) setPrevious({ value, direction: value > previous.value ? 1 : -1 });
  const text = format(value);
  if (mode !== "expressive" || reducedMotion || !Number.isFinite(value)) return <span {...props} className={className}>{text}</span>;
  const direction = previous.direction;
  return <span {...props} className={cx("mf-rolling-number", className)}>
    <span className="mf-sr">{text}</span>
    <span className="mf-number-measure" aria-hidden="true">{text}</span>
    <span aria-hidden="true" className="mf-number-reels" dir="ltr">
      {Array.from(text).map((character, index) => /\p{N}/u.test(character) ? <span className="mf-number-digit" key={text.length - index}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.span key={character} custom={direction}
            variants={{ enter: (d: number) => ({ y: `${d * 100}%` }), visible: { y: "0%" }, exit: (d: number) => ({ y: `${d * -100}%` }) }}
            initial="enter" animate="visible" exit="exit"
            transition={{ duration: .18, ease: [.2, .65, .3, 1] }}>{character}</motion.span>
        </AnimatePresence>
      </span> : <span key={`separator-${text.length - index}`}>{character}</span>)}
    </span>
  </span>;
}
