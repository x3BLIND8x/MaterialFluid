import {
  useAppearanceProps,
  type AppearanceProps,
  type ComponentSize,
} from "./appearance";
import { forwardRef, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import { useNotifications, type NotificationInput } from "./notifications";
export { NotificationCenter, useNotifications } from "./notifications";
export type { NotificationInput, NotificationAction, NotificationRecord, NotificationCenterProps } from "./notifications";
import { cx, useControllable } from "./utils";
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
export const Toast = forwardRef<HTMLLIElement, ToastProps>(function Toast(rawProps, ref) {
  const { open, defaultOpen = true, onOpenChange, className, title, description, duration = 5000, action, image, actions, onReply } = useAppearanceProps({ ...rawProps, variant: "outline" });
  const [visible, setVisible] = useControllable(open, defaultOpen, onOpenChange);
  const id = useId();
  const { publish, close, update } = useNotifications();
  const latest = useRef({ title, description, duration, action, image, actions, onReply, className, setVisible, ref });
  latest.current = { title, description, duration, action, image, actions, onReply, className, setVisible, ref };
  useEffect(() => {
    if (visible) { const current = latest.current; publish({ id, ...current, rootRef: current.ref, onDismiss: () => latest.current.setVisible(false) }); }
    else close(id);
    return () => close(id);
  }, [visible, id, publish, close]);
  useEffect(() => { update(id, { title, description, duration, action, image, actions, onReply, className }); }, [id, title, description, duration, action, image, actions, onReply, className, update]);
  return null;
});
/** Compatibility alias. Snackbar actions now use the shared Toast treatment and queue. */
export const Snackbar = Toast;
export interface ProgressProps
  extends HTMLAttributes<HTMLDivElement>, AppearanceProps {
  value?: number;
  max?: number;
  label: string;
}
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(rawProps, ref) {
    const {
      value,
      max = 100,
      label,
      className,
      ...props
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

    const { motion: mode, reducedMotion } = useMaterialFluid();
    const expressive = mode === "expressive" && !reducedMotion;
    const bounded =
      value === undefined
        ? undefined
        : Math.min(Math.max(value, 0), Math.max(1, max));
    return (
      <div
        {...props}
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.max(1, max)}
        aria-valuenow={bounded}
        className={cx(
          "mf-progress",
          bounded === undefined && "mf-progress--indeterminate",
          className,
        )}
      >
        <motion.span className="mf-progress-fill" initial={false} animate={{ width: bounded === undefined ? "35%" : `${(bounded / Math.max(1, max)) * 100}%` }} transition={{ duration: expressive ? .38 : 0, ease: [.2, 0, 0, 1] }} />
        {expressive && bounded !== undefined && bounded > 0 && bounded < max && <span className="mf-progress-droplet" aria-hidden="true" />}

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

    return (
      <span
        {...props}
        ref={ref}
        role="status"
        aria-label={label}
        className={cx("mf-spinner", className)}
        style={{ width: size, height: size, ...props.style }}
      >
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
    } = useAppearanceProps({ ...rawProps, variant: "outline" });

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
      useAppearanceProps({ ...rawProps, variant: "outline" });

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
