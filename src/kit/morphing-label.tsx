import { useState, useEffect } from "react";
import { motion, useAnimate } from "motion/react";
import { useMaterialFluid } from "./provider";

export function MorphingLabel({
  text,
  animated,
  onVisibleTextChange,
  fade: fadeOverride,
}: {
  text: string;
  animated: boolean;
  onVisibleTextChange?: () => void;
  fade?: number;
}) {
  const { textMorph: { duration, blur, fade: inheritedFade } } = useMaterialFluid();
  const fade = fadeOverride ?? inheritedFade;
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const [visibleText, setVisibleText] = useState(text);

  useEffect(() => {
    if (visibleText === text) return;
    if (!animated) {
      setVisibleText(text);
      onVisibleTextChange?.();
      return;
    }

    const halfDuration = duration / 2000;
    const blurAnimation = animate(
      scope.current,
      { filter: `blur(${blur}px)`, scale: 0.97, opacity: 1 - Math.max(0, Math.min(100, fade)) / 100 },
      { duration: halfDuration, ease: "easeInOut" },
    );
    const swapTimer = window.setTimeout(() => {
      setVisibleText(text);
      onVisibleTextChange?.();
      animate(
        scope.current,
        { filter: "blur(0px)", scale: 1, opacity: 1 },
        { duration: halfDuration, ease: "easeOut" },
      );
    }, duration / 2);

    return () => {
      window.clearTimeout(swapTimer);
      blurAnimation.stop();
    };
  }, [
    animate,
    animated,
    blur,
    duration,
    fade,
    onVisibleTextChange,
    scope,
    text,
    visibleText,
  ]);

  return (
    <motion.span ref={scope} className="mf-morph-label">
      {visibleText}
    </motion.span>
  );
}
