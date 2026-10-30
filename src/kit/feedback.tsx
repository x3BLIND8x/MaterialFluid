import { useSizePolicy } from "./appearance";
import {
  LinearWave,
  CircularWave,
  type ProgressWaveOptions,
} from "./wavy-progress";
export type { ProgressWaveOptions } from "./wavy-progress";
import { useSizeDimensions } from "./size-motion";
import {
  useAppearanceProps,
  type AppearanceProps,
  type ComponentSize,
} from "./appearance";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useNotifications, type NotificationInput } from "./notifications";
export { NotificationCenter, useNotifications } from "./notifications";
export type {
  NotificationInput,
  NotificationAction,
  NotificationRecord,
  NotificationCenterProps,
} from "./notifications";
import { cx, setRef, useControllable } from "./utils";
import { AnimatedIcon } from "./icons";
import { useMaterialFluid } from "./provider";
export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, AppearanceProps {
  title: string;
  tone?: "info" | "success" | "error";
}
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert(rawProps, ref) {
    const {
      title,
      tone = "info",
      children,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    return (
      <div
        {...props}
        ref={ref}
        role={tone === "error" ? "alert" : "status"}
        className={cx("mf-alert", `mf-alert--${tone}`, className)}
      >
        <AnimatedIcon name={tone === "success" ? "check-check" : "help"} />
        <div>
          <strong>{title}</strong>
          {children && <div>{children}</div>}
        </div>
      </div>
    );
  },
);
export interface ToastProps extends AppearanceProps, NotificationInput {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  action?: ReactNode;
  className?: string;
}
export const Toast = forwardRef<HTMLLIElement, ToastProps>(
  function Toast(rawProps, ref) {
    const {
      open,
      defaultOpen = true,
      onOpenChange,
      className,
      title,
      description,
      duration = 5000,
      action,
      image,
      actions,
      onReply,
    } = useAppearanceProps({ ...rawProps, variant: "outline" });
    const [visible, setVisible] = useControllable(
      open,
      defaultOpen,
      onOpenChange,
    );
    const id = useId();
    const { publish, close, update } = useNotifications();
    const latest = useRef({
      title,
      description,
      duration,
      action,
      image,
      actions,
      onReply,
      className,
      setVisible,
      ref,
    });
    latest.current = {
      title,
      description,
      duration,
      action,
      image,
      actions,
      onReply,
      className,
      setVisible,
      ref,
    };
    useEffect(() => {
      if (visible) {
        const current = latest.current;
        publish({
          id,
          ...current,
          rootRef: current.ref,
          onDismiss: () => latest.current.setVisible(false),
        });
      } else close(id);
      return () => close(id);
    }, [visible, id, publish, close]);
    useEffect(() => {
      update(id, {
        title,
        description,
        duration,
        action,
        image,
        actions,
        onReply,
        className,
      });
    }, [
      id,
      title,
      description,
      duration,
      action,
      image,
      actions,
      onReply,
      className,
      update,
    ]);
    return null;
  },
);
/** Compatibility alias. Snackbar actions now use the shared Toast treatment and queue. */
export const Snackbar = Toast;
export interface ProgressProps
  extends HTMLAttributes<HTMLDivElement>, AppearanceProps {
  value?: number;
  max?: number;
  label: string;
  presentation?: "wavy" | "segmented" | "status";
  segments?: number;
  status?: ReactNode;
  remaining?: ReactNode;
  wave?: ProgressWaveOptions;
}
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(rawProps, ref) {
    const {
      value,
      max = 100,
      label,
      presentation = "wavy",
      segments = 8,
      status,
      remaining,
      wave,
      className,
      ...props
    } = useAppearanceProps(
      useSizePolicy("progress", { ...rawProps, variant: "outline" }),
    );

    const { motion: mode, reducedMotion, locale } = useMaterialFluid();
    const expressive = mode === "expressive" && !reducedMotion;
    const bounded =
      value === undefined
        ? undefined
        : Math.min(Math.max(value, 0), Math.max(1, max));
    const ratio =
      bounded === undefined ? undefined : bounded / Math.max(1, max);
    const percentage =
      ratio === undefined
        ? "…"
        : new Intl.NumberFormat(locale, {
            style: "percent",
            maximumFractionDigits: 0,
          }).format(ratio);
    const count = Number.isFinite(segments)
      ? Math.min(100, Math.max(1, Math.floor(segments)))
      : 8;
    return (
      <div
        {...props}
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.max(1, max)}
        aria-valuenow={bounded}
        aria-busy={bounded === undefined || undefined}
        aria-valuetext={
          props["aria-valuetext"] ??
          (presentation === "status"
            ? [
                percentage,
                typeof status === "string" ? status : label,
                typeof remaining === "string" ? remaining : undefined,
              ]
                .filter(Boolean)
                .join(", ")
            : undefined)
        }
        className={cx(
          "mf-progress",
          `mf-progress--${presentation}`,
          bounded === undefined && "mf-progress--indeterminate",
          className,
        )}
      >
        {presentation === "wavy" ? (
          <LinearWave ratio={ratio} animated={expressive} options={wave} />
        ) : presentation === "segmented" ? (
          <div className="mf-progress-segments" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
              <span key={index} className="mf-progress-segment">
                <span
                  style={{
                    width: `${ratio === undefined ? 0 : Math.min(1, Math.max(0, ratio * count - index)) * 100}%`,
                  }}
                />
              </span>
            ))}
          </div>
        ) : (
          <>
            <div className="mf-progress-status-row" aria-hidden="true">
              <span className="mf-progress-percent">{percentage}</span>
              <span className="mf-progress-status-text">{status ?? label}</span>
              {remaining != null && (
                <span className="mf-progress-remaining">{remaining}</span>
              )}
            </div>
            <div className="mf-progress-status-track" aria-hidden="true">
              <span style={{ width: `${(ratio ?? 0) * 100}%` }} />
            </div>
          </>
        )}
      </div>
    );
  },
);
export interface SpinnerProps
  extends HTMLAttributes<HTMLSpanElement>, Omit<AppearanceProps, "size"> {
  label: string;
  size?: number | ComponentSize;
}
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(rawProps, ref) {
    const {
      label,
      size: requestedSize = 28,
      className,
      ...props
    } = useAppearanceProps(rawProps, { preserveSize: true });
    const size =
      typeof requestedSize === "number"
        ? requestedSize
        : { sm: 16, md: 28, lg: 40 }[requestedSize];
    const { motion: mode, reducedMotion, buttonMotion } = useMaterialFluid();
    const node = useRef<HTMLSpanElement>(null);
    const diameter = useSizeDimensions(node, size, {
      expressive: mode === "expressive" && !reducedMotion,
      stiffness: buttonMotion.stiffness,
      damping: buttonMotion.sizeDamping,
      mass: buttonMotion.mass,
      style: props.style,
    });

    return (
      <span
        {...props}
        ref={(element) => {
          node.current = element;
          setRef(ref, element);
        }}
        role="status"
        aria-label={label}
        className={cx("mf-spinner", className)}
        style={{ width: diameter, height: diameter, ...props.style }}
      >
        <CircularWave animated={mode === "expressive" && !reducedMotion} />
        <span className="mf-sr">{label}</span>
      </span>
    );
  },
);
export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>, AppearanceProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(rawProps, ref) {
    const {
      width = "100%",
      height = 20,
      rounded = false,
      className,
      ...props
    } = useAppearanceProps(
      useSizePolicy("skeleton", { ...rawProps, variant: "outline" }),
    );

    return (
      <div
        {...props}
        ref={ref}
        aria-hidden="true"
        className={cx(
          "mf-skeleton",
          rounded && "mf-skeleton--round",
          className,
        )}
        style={{ width, height, ...props.style }}
      />
    );
  },
);
export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">, AppearanceProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(rawProps, ref) {
    const { title, description, icon, action, className, ...props } =
      useAppearanceProps(
        useSizePolicy("empty-state", { ...rawProps, variant: "outline" }),
      );

    return (
      <div {...props} ref={ref} className={cx("mf-empty", className)}>
        {icon ?? <AnimatedIcon name="search" size={32} />}
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {action}
      </div>
    );
  },
);
