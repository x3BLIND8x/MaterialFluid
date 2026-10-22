import {
  useAppearanceProps,
  type AppearanceProps,
  type ComponentSize,
} from "./appearance";
import {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  useState,
  useId,
  type HTMLAttributes,
  type CSSProperties,
} from "react";
import { motion } from "motion/react";
import { useMaterialFluid } from "./provider";
import { cx, setRef } from "./utils";
import { connectionStrokes, isStrokeIcon } from "./icon-strokes";
import { getMaterialIcon, type IconName } from "./icon-registry";
export type { IconName } from "./icon-names";
export { registerMaterialIcons } from "./icon-registry";
export type { MaterialIconData } from "./icon-types";
// Temporarily pause all internal glyph animations; retain their implementation.
const ICON_ANIMATIONS_ENABLED = false;
export interface AnimatedIconProps
  extends HTMLAttributes<HTMLSpanElement>, Omit<AppearanceProps, "size"> {
  name?: IconName;
  stagger?: number;
  slashDelay?: number;
  fillDuration?: number;
  fillEaseStrength?: number;
  size?: number | ComponentSize;
  duration?: number;
  strokeWidth?: number;
  animated?: boolean;
  animateOnMount?: boolean;
  active?: boolean;
  label?: string;
}
export const AnimatedIcon = forwardRef<HTMLSpanElement, AnimatedIconProps>(
  function AnimatedIcon(rawProps, ref) {
    const {
      name = "plus",
      stagger = 0.07,
      slashDelay = 0.15,
      fillDuration = 0.4,
      fillEaseStrength = 0.85,
      size: requestedSize = 22,
      duration = 1,
      strokeWidth = 2,
      animated = true,
      animateOnMount = false,
      active = false,
      label,
      className,
      style,
      ...props
    } = useAppearanceProps(rawProps, { preserveSize: true });

    const size =
      typeof requestedSize === "number"
        ? requestedSize
        : { sm: 16, md: 22, lg: 32 }[requestedSize];
    const { motion: mode, reducedMotion } = useMaterialFluid();
    const expressive = (ICON_ANIMATIONS_ENABLED || rawProps.animated === true) && animated && mode === "expressive" && !reducedMotion;
    const element = useRef<HTMLSpanElement | null>(null);
    const off =
      name.endsWith("-off") ||
      name === "wifi_off" ||
      name === "bluetooth_disabled";
    const slashState = useRef(off ? 1 : 0);
    const retractSlash = slashState.current === 1 && !off;
    const [replay, setReplay] = useState(0);
    const glyph = getMaterialIcon(name);
    const fillClip = `mf-icon-fill-${useId().replaceAll(":", "")}`;
    const [vx, vy, vw, vh] = glyph.viewBox.split(/\s+/).map(Number);
    const connection = !!connectionStrokes[name];
    const strokeBased = isStrokeIcon(name);
    const strands = connectionStrokes[name] ?? glyph.strokes ?? [];
    const playing = expressive && replay > 0;
    const iconRef = useCallback(
      (node: HTMLSpanElement | null) => {
        element.current = node;
        setRef(ref, node);
      },
      [ref],
    );
    const start = useCallback(() => {
      if (
        expressive &&
        !element.current?.closest(":disabled,[aria-disabled='true']")
      )
        setReplay((value) => value + 1);
    }, [expressive]);
    const mountPlayed = useRef(false);
    useEffect(() => {
      if (animateOnMount && expressive && !mountPlayed.current) {
        mountPlayed.current = true;
        start();
      }
    }, [animateOnMount, expressive, start]);
    const previousName = useRef(name);
    useEffect(() => {
      if (previousName.current !== name) start();
      previousName.current = name;
    }, [name, start]);
    useEffect(() => {
      const action = element.current?.closest("button,a") ?? element.current;
      if (!action || !expressive) return;
      let heldKey: string | null = null;
      let skipSpaceClick = false;
      const down = (event: Event) => {
        const keyboard = event as KeyboardEvent;
        if (
          !keyboard.repeat &&
          (keyboard.key === "Enter" || keyboard.key === " ")
        )
          heldKey = keyboard.key;
      };
      const up = (event: Event) => {
        const keyboard = event as KeyboardEvent;
        if (keyboard.key !== heldKey) return;
        heldKey = null;
        skipSpaceClick = keyboard.key === " ";
        start();
      };
      const click = (event: Event) => {
        const mouse = event as MouseEvent;
        if (mouse.detail === 0 && (heldKey || skipSpaceClick)) {
          skipSpaceClick = false;
          return;
        }
        skipSpaceClick = false;
        start();
      };
      const blur = () => {
        heldKey = null;
        skipSpaceClick = false;
      };
      action.addEventListener("keydown", down);
      action.addEventListener("keyup", up);
      action.addEventListener("click", click);
      action.addEventListener("blur", blur);
      return () => {
        action.removeEventListener("keydown", down);
        action.removeEventListener("keyup", up);
        action.removeEventListener("click", click);
        action.removeEventListener("blur", blur);
      };
    }, [expressive, start]);
    return (
      <span
        {...props}
        ref={iconRef}
        className={cx("mf-animated-icon", className)}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        data-active={active || undefined}
        data-explicit-variant={rawProps.variant ? "true" : undefined}
        data-icon-source={
          connection ? "materialfluid-stroke" : "material-symbols-rounded"
        }
        data-icon-name={name}
        data-icon-animation={strokeBased ? "stroke" : "center-fill"}
        style={
          {
            width: size,
            height: size,
            "--mf-icon-stroke": strokeWidth,
            ...style,
          } as CSSProperties
        }
      >
        <svg
          width={size}
          height={size}
          viewBox={strokeBased ? "0 0 24 24" : glyph.viewBox}
          fill={connection ? "none" : "currentColor"}
          stroke={connection ? "currentColor" : "none"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {connection ? (
            <>
              {strands.map((d, index) =>
                playing ? (
                  <motion.path
                    key={`${name}-${replay}-${index}`}
                    d={d}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.35 * duration,
                      delay: index * stagger * duration,
                      ease: "easeOut",
                    }}
                  />
                ) : (
                  <path key={index} d={d} />
                ),
              )}
              {connection &&
                (playing ? (
                  <motion.path
                    key={`slash-${replay}`}
                    className="mf-icon-slash-path"
                    onAnimationComplete={() => {
                      slashState.current = off ? 1 : 0;
                    }}
                    d="M3 3l18 18"
                    initial={{
                      pathLength: retractSlash ? 1 : 0,
                      opacity: off || retractSlash ? 1 : 0,
                    }}
                    animate={{ pathLength: off ? 1 : 0, opacity: off ? 1 : 0 }}
                    transition={{
                      duration: 0.35 * duration,
                      delay: slashDelay * duration,
                      ease: "easeOut",
                    }}
                  />
                ) : off ? (
                  <path className="mf-icon-slash-path" d="M3 3l18 18" />
                ) : null)}
            </>
          ) : strokeBased ? (
            <>
              {playing && (
                <defs>
                  <mask
                    id={fillClip}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                    style={{ maskType: "luminance" }}
                  >
                    {strands.map((d, index) => (
                      <motion.path
                        key={`${name}-${replay}-${index}`}
                        d={d}
                        fill="none"
                        stroke="white"
                        strokeWidth={Math.max(
                          glyph.revealWidth ?? 3,
                          strokeWidth,
                        )}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          duration: 0.35 * duration,
                          delay: Math.min(index * stagger, 0.6) * duration,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </mask>
                </defs>
              )}
              <g mask={playing ? `url(#${fillClip})` : undefined}>
                {glyph.paths.map((d, index) => (
                  <path key={index} d={d} />
                ))}
              </g>
            </>
          ) : (
            <>
              {playing && (
                <defs>
                  <clipPath id={fillClip} clipPathUnits="userSpaceOnUse">
                    <motion.circle
                      key={`${name}-${replay}`}
                      className="mf-icon-fill-wave"
                      cx={vx + vw / 2}
                      cy={vy + vh / 2}
                      initial={{ r: 0 }}
                      animate={{ r: Math.hypot(vw, vh) / 2 }}
                      transition={{
                        duration: fillDuration * duration,
                        ease: [
                          1 - Math.min(0.95, Math.max(0, fillEaseStrength)),
                          1,
                          0.3,
                          1,
                        ],
                      }}
                    />
                  </clipPath>
                </defs>
              )}
              <g clipPath={playing ? `url(#${fillClip})` : undefined}>
                {glyph.paths.map((d, index) => (
                  <path key={index} d={d} />
                ))}
              </g>
            </>
          )}
        </svg>
      </span>
    );
  },
);
