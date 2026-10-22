import { fitNotificationCount, notificationBudget } from "./notification-layout";
import { motion } from "motion/react";
import { createContext, useContext, useState, useCallback, useLayoutEffect, useEffect, useId, useMemo, useRef, type ReactNode, type Ref } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { useMaterialFluid } from "./provider";
import { Portal } from "./portal";
import { Drawer } from "./overlays";
import { Button, IconButton } from "./controls";
import { Textarea } from "./forms";
import { AnimatedIcon, type IconName } from "./icons";
import type { ComponentSize } from "./appearance";
import { cx, useControllable, setRef } from "./utils";

export interface NotificationAction {
  label: string;
  icon?: IconName;
  onClick: () => void | Promise<void>;
}
export interface NotificationInput {
  size?: ComponentSize;
  title: string;
  description?: string;
  image?: { src: string; alt: string };
  actions?: NotificationAction[];
  onReply?: (message: string) => void | Promise<void>;
  duration?: number;
}
export interface NotificationRecord extends NotificationInput {
  id: string;
  createdAt: number;
  read: boolean;
  open: boolean;
  action?: ReactNode;
  className?: string;
  rootRef?: Ref<HTMLLIElement>;
  onDismiss?: () => void;
}
type Store = {
  notifications: NotificationRecord[];
  notify: (notification: NotificationInput) => string;
  publish: (notification: Omit<NotificationRecord, "createdAt" | "read" | "open">) => void;
  update: (id: string, patch: Partial<NotificationInput> & { action?: ReactNode; className?: string }) => void;
  dismiss: (id: string) => void;
  close: (id: string) => void;
  clear: () => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  activateCenter: (id: string) => void;
  deactivateCenter: (id: string) => void;
};
const NotificationContext = createContext<Store | null>(null);
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("Notifications require MaterialFluidProvider.");
  return context;
}

/** One queue and one viewport per kit root. Queued notifications do not expire. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const latest = useRef(notifications);
  latest.current = notifications;
  const serial = useRef(0);
  const centers = useRef(new Set<string>());
  const [centerCount, setCenterCount] = useState(0);
  const publish = useCallback((input: Omit<NotificationRecord, "createdAt" | "read" | "open">) => {
    if (centers.current.size) input.onDismiss?.();
    setNotifications(current => [...current.filter(item => item.id !== input.id), { ...input, createdAt: Date.now(), read: false, open: centers.current.size === 0 }]);
  }, []);
  const notify = useCallback((input: NotificationInput) => {
    const id = `notification-${++serial.current}`;
    publish({ ...input, id });
    return id;
  }, [publish]);
  const update = useCallback((id: string, patch: Partial<NotificationInput> & { action?: ReactNode; className?: string }) => {
    setNotifications(current => current.some(item => item.id === id) ? current.map(item => item.id === id ? { ...item, ...patch } : item) : current);
  }, []);
  const close = useCallback((id: string) => { setNotifications(current => current.map(item => item.id === id && item.open ? { ...item, open: false } : item)); }, []);
  const dismiss = useCallback((id: string) => { latest.current.find(item => item.id === id)?.onDismiss?.(); close(id); }, [close]);
  const clear = useCallback(() => { latest.current.filter(item => item.open).forEach(item => item.onDismiss?.()); setNotifications([]); }, []);
  const markAllRead = useCallback(() => setNotifications(current => current.map(item => ({ ...item, read: true }))), []);
  const markRead = useCallback((id: string) => setNotifications(current => current.map(item => item.id === id && !item.read ? { ...item, read: true } : item)), []);
  const activateCenter = useCallback((id: string) => {
    centers.current.add(id); setCenterCount(centers.current.size);
    latest.current.filter(item => item.open).forEach(item => item.onDismiss?.());
    setNotifications(current => current.map(item => item.open ? { ...item, open: false } : item));
  }, []);
  const deactivateCenter = useCallback((id: string) => { centers.current.delete(id); setCenterCount(centers.current.size); }, []);
  const store = useMemo(() => ({ notifications, notify, publish, update, dismiss, close, clear, markAllRead, markRead, activateCenter, deactivateCenter }), [notifications, notify, publish, update, dismiss, close, clear, markAllRead, markRead, activateCenter, deactivateCenter]);
  const { locale, dir, motion: mode, reducedMotion } = useMaterialFluid();
  const [centerOpen, setCenterOpen] = useState(false);
  const active = centerCount ? [] : notifications.filter(item => item.open);
  const [budget, setBudget] = useState(() => notificationBudget(typeof window === "undefined" ? 800 : window.innerHeight));
  const [heights, setHeights] = useState<Record<string, number>>({});
  const nodes = useRef(new Map<string, HTMLLIElement>());
  const count = fitNotificationCount(active.map(item => heights[item.id] ?? (item.image || item.actions?.length || item.onReply || item.action ? 128 : item.description ? 100 : 80)), budget);
  const visible = active.slice(0, count);
  const overflow = active.length - count;
  const visibleKey = visible.map(item => item.id).join("|");
  useEffect(() => {
    const resize = () => setBudget(notificationBudget(window.visualViewport?.height ?? window.innerHeight));
    resize(); window.addEventListener("resize", resize); window.visualViewport?.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); window.visualViewport?.removeEventListener("resize", resize); };
  }, []);
  useLayoutEffect(() => {
    const measure = () => {
      const next: Record<string, number> = {};
      nodes.current.forEach((node, id) => { const height = node.getBoundingClientRect().height; if (height) next[id] = height; });
      setHeights(current => Object.entries(next).some(([id, height]) => Math.abs((current[id] ?? 0) - height) > .5) ? { ...current, ...next } : current);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure); nodes.current.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [visibleKey, budget, notifications]);
  const fa = locale === "fa";
  return <NotificationContext.Provider value={store}>
    <ToastPrimitive.Provider label={fa ? "اعلان" : "Notification"} swipeDirection={dir === "rtl" ? "left" : "right"}>
      {children}
      <Portal>
        {visible.map(item => <ToastPrimitive.Root key={item.id} ref={element => { if (element) nodes.current.set(item.id, element); else nodes.current.delete(item.id); setRef(item.rootRef, element); }} open duration={item.duration ?? 5000} onOpenChange={open => { if (!open) dismiss(item.id); }} style={{ maxHeight: Math.max(100, budget - (overflow ? 44 : 0)) }} className={cx("mf-toast mf-variant--outline", item.size && `mf-scale--${item.size}`, item.className)} asChild><motion.li layout={mode === "expressive" && !reducedMotion ? "position" : false} initial={false} transition={{ type: "spring", stiffness: 420, damping: 34 }}>
          {item.image && <img className="mf-toast-thumbnail" src={item.image.src} alt={item.image.alt} />}
          <div className="mf-notification-content">
            <ToastPrimitive.Title className="mf-toast-title">{item.title}</ToastPrimitive.Title>
            {item.description && <ToastPrimitive.Description className="mf-notification-description">{item.description}</ToastPrimitive.Description>}
            <NotificationDetails notification={item} compact />
          </div>
          <ToastPrimitive.Close asChild><IconButton size="sm" variant="ghost" label={fa ? "بستن اعلان" : "Dismiss notification"}><AnimatedIcon name="close" /></IconButton></ToastPrimitive.Close>
        </motion.li></ToastPrimitive.Root>)}
        <ToastPrimitive.Viewport className="mf-toast-viewport" style={{ maxHeight: budget }}>
          {overflow > 0 && <li className="mf-toast-overflow"><Button size="sm" variant="primary" onClick={() => setCenterOpen(true)}><span className="mf-notification-count">+{overflow.toLocaleString(locale)}</span>{fa ? "اعلان دیگر" : "more notifications"}</Button></li>}
        </ToastPrimitive.Viewport>
      </Portal>
      <NotificationCenter open={centerOpen} onOpenChange={setCenterOpen} />
    </ToastPrimitive.Provider>
  </NotificationContext.Provider>;
}

function NotificationDetails({ notification, compact = false }: { notification: NotificationRecord; compact?: boolean }) {
  const { locale } = useMaterialFluid();
  const fa = locale === "fa";
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const perform = async (action: () => void | Promise<void>) => {
    setBusy(true); setStatus("");
    try { await action(); setStatus(fa ? "انجام شد" : "Done"); }
    catch { setStatus(fa ? "انجام نشد. دوباره تلاش کنید." : "Could not complete the action. Try again."); }
    finally { setBusy(false); }
  };
  return <>
    {!compact && notification.image && <img className="mf-notification-image" src={notification.image.src} alt={notification.image.alt} loading="lazy" />}
    {(notification.action || notification.actions?.length || notification.onReply) ? <div className="mf-notification-actions">
      {notification.action}
      {notification.actions?.map((action, index) => <Button key={index} variant="ghost" size="sm" disabled={busy} leading={action.icon && <AnimatedIcon name={action.icon} size={18} />} onClick={() => { void perform(action.onClick); }}>{action.label}</Button>)}
      {notification.onReply && <Button variant="ghost" size="sm" disabled={busy} leading={<AnimatedIcon name="reply" size={18} />} aria-expanded={replying} onClick={() => setReplying(value => !value)}>{fa ? "پاسخ" : "Reply"}</Button>}
    </div> : null}
    {replying && <form className="mf-notification-reply" onSubmit={event => { event.preventDefault(); const message = reply.trim(); if (!message || busy) return; void perform(async () => { await notification.onReply?.(message); setReply(""); setReplying(false); }); }}>
      <Textarea label={fa ? "پاسخ شما" : "Your reply"} value={reply} onChange={event => setReply(event.target.value)} maxLength={500} autoFocus rows={2} />
      <Button variant="primary" size="sm" type="submit" disabled={!reply.trim() || busy}>{fa ? "ارسال" : "Send reply"}</Button>
    </form>}
    {status && <p className="mf-notification-action-status" role="status">{status}</p>}
  </>;
}

export interface NotificationCenterProps {
  trigger?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function NotificationCenter({ trigger, open, defaultOpen = false, onOpenChange }: NotificationCenterProps) {
  const [visible, setVisible] = useControllable(open, defaultOpen, onOpenChange);
  const { notifications, clear, markAllRead, markRead, dismiss, activateCenter, deactivateCenter } = useNotifications();
  const id = useId();
  useLayoutEffect(() => { if (!visible) return; activateCenter(id); return () => deactivateCenter(id); }, [visible, id, activateCenter, deactivateCenter]);
  const { locale } = useMaterialFluid();
  const fa = locale === "fa";
  return <Drawer title={fa ? "مرکز اعلان‌ها" : "Notification center"} description={fa ? "پیام‌ها و فعالیت‌های اخیر شما" : "Your recent messages and activity"} trigger={trigger} open={visible} onOpenChange={setVisible} className="mf-notification-center">
    <div className="mf-notification-toolbar"><Button size="sm" variant="ghost" disabled={!notifications.some(item => !item.read)} leading={<AnimatedIcon name="check-check" />} onClick={markAllRead}>{fa ? "خواندن همه" : "Mark all read"}</Button><Button size="sm" variant="ghost" disabled={!notifications.length} onClick={clear}>{fa ? "پاک کردن همه" : "Clear all"}</Button></div>
    {notifications.length ? <ol className="mf-notification-history">{[...notifications].reverse().map(item => <li key={item.id} className="mf-notification-card" data-unread={!item.read || undefined}>
      <div className="mf-notification-heading">{item.read ? <span className="mf-notification-read" role="img" aria-label={fa ? "خوانده‌شده" : "Read"}><AnimatedIcon name="check-check" size={20} /></span> : <IconButton className="mf-notification-read" size="sm" variant="ghost" label={fa ? "علامت خوانده‌شده" : "Mark as read"} onClick={() => markRead(item.id)}><AnimatedIcon name="bell" /></IconButton>}<h3>{item.title}</h3><time dateTime={new Date(item.createdAt).toISOString()}>{new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(item.createdAt)}</time></div>
      {item.description && <p className="mf-notification-description">{item.description}</p>}
      <NotificationDetails notification={item} />
      {item.open && <Button variant="ghost" size="sm" onClick={() => dismiss(item.id)}>{fa ? "بستن اعلان شناور" : "Dismiss toast"}</Button>}
    </li>)}</ol> : <div className="mf-notification-empty"><AnimatedIcon name="notifications" size={36} /><h3>{fa ? "همه چیز به‌روز است" : "You're all caught up"}</h3><p>{fa ? "اعلان‌های تازه اینجا نمایش داده می‌شوند." : "New notifications will appear here."}</p></div>}
  </Drawer>;
}
