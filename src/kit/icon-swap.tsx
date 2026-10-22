import { type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMaterialFluid } from "./provider";

/** Keep the icon box fixed while state glyphs crossfade and scale. */
export function IconSwap({ identity, children, size = 22 }: { identity: string; children: ReactNode; size?: number }) {
  const { motion: mode, reducedMotion } = useMaterialFluid();
  const animated = mode === "expressive" && !reducedMotion;
  return <span className="mf-icon-swap" style={{ width: size, height: size }} aria-hidden="true">
    <AnimatePresence initial={false}>
      <motion.span key={identity}
        initial={animated ? { opacity: 0, scale: .65, rotate: -12 } : false}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: .65, rotate: 12 }}
        transition={{ duration: animated ? .18 : 0, ease: [.2, .65, .3, 1] }}>{children}</motion.span>
    </AnimatePresence>
  </span>;
}
