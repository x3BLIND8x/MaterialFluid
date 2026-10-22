import { useComponentAppearance } from "../../kit/appearance";
import { useState } from "react";
import {
  Alert,
  NotificationCenter,
  useNotifications,
  type NotificationInput,
  Progress,
  Spinner,
  Skeleton,
  EmptyState,
} from "../../kit/feedback";
import { Button, Slider } from "../../kit/controls";
import { type DemoProps, translate } from "./shared";
export default function FeedbackDemo({ id, states, locale }: DemoProps) {
  const t = translate(locale);
  const { notify: publish, notifications } = useNotifications();
  const { size } = useComponentAppearance();
  const notify = (notification: NotificationInput) => publish({ ...notification, size });
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([65]);
  const [message, setMessage] = useState("");
  let demo;
  switch (id) {
    case "alert":
      demo = (
        <div className="demo-fields">
          <Alert
            title={t("Everything is up to date", "همه چیز به‌روز است")}
            tone="success"
          >
            {states.long
              ? t(
                  "Your latest changes have been saved on this device. You can safely continue working on your next idea.",
                  "آخرین تغییرات شما در این دستگاه ذخیره شدند. می‌توانید با خیال راحت روی ایده بعدی کار کنید.",
                )
              : t("Your changes were saved.", "تغییرات شما ذخیره شدند.")}
          </Alert>
          <Alert
            title={t("Check the project name", "نام پروژه را بررسی کنید")}
            tone="error"
          >
            {t(
              "Enter a name before continuing.",
              "پیش از ادامه نامی وارد کنید.",
            )}
          </Alert>
        </div>
      );
      break;
    case "toast":
      demo = <div className="demo-stack">
        <div className="demo-row">
          <Button onClick={() => notify({ title: t("Project saved", "پروژه ذخیره شد"), description: t("Your latest changes are ready.", "آخرین تغییرات شما آماده‌اند.") })}>{t("Show notification", "نمایش اعلان")}</Button>
          <Button variant="outline" onClick={() => { for (let i = 1; i <= 8; i++) notify({ title: `${t("Project update", "به‌روزرسانی پروژه")} ${i}`, description: t("Notifications fit the available screen height.", "اعلان‌ها با ارتفاع قابل استفاده صفحه هماهنگ می‌شوند."), duration: 12000 }); }}>{t("Show eight notifications", "نمایش هشت اعلان")}</Button>
          <Button variant="ghost" onClick={() => notify({ title: t("Item archived", "مورد بایگانی شد"), actions: [{ label: t("Undo", "بازگردانی"), icon: "undo", onClick: () => setMessage(t("Item restored.", "مورد بازگردانده شد.")) }] })}>{t("Archive item", "بایگانی مورد")}</Button>
        </div>
        <p className="demo-caption">{t("Snackbar actions share the Toast queue. Notifications that do not fit wait behind the count badge and remain in the notification center.", "اقدام‌های پیام کوتاه در صف اعلان‌ها هستند. اعلان‌های بیشتر پشت نشان تعداد منتظر می‌مانند و در مرکز اعلان‌ها حفظ می‌شوند.")}</p>
        <NotificationCenter trigger={<Button variant="ghost">{t("Open notification center", "باز کردن مرکز اعلان‌ها")}</Button>} />
      </div>;
      break;
    case "notification-center": {
      const addMessage = () => notify({ title: t("Nora shared a design", "نورا یک طرح فرستاد"), description: t("The new project preview is ready for your review.", "پیش‌نمایش تازه پروژه برای بررسی آماده است."), image: { src: "./notification-preview.svg", alt: t("Project color and layout preview", "پیش‌نمایش رنگ و چیدمان پروژه") }, duration: 12000, actions: [{ label: t("Copy project code", "کپی کد پروژه"), icon: "copy", onClick: async () => { await navigator.clipboard.writeText("MF-2026"); setMessage(t("Project code copied.", "کد پروژه کپی شد.")); } }], onReply: reply => setMessage(`${t("Reply sent", "پاسخ ارسال شد")}: ${reply}`) });
      demo = <div className="demo-stack">
        <p>{t("Messages, images, and actions in one place. Dismissing a toast keeps its history here.", "پیام‌ها، تصویرها و اقدام‌ها در یک جا. با بستن اعلان شناور، سابقه آن اینجا حفظ می‌شود.")}</p>
        <div className="demo-row"><Button onClick={() => { if (!notifications.length) addMessage(); setOpen(true); }}>{t("Open notification center", "باز کردن مرکز اعلان‌ها")}</Button><Button variant="outline" onClick={addMessage}>{t("Add message with image", "افزودن پیام با تصویر")}</Button></div>
        <NotificationCenter open={open} onOpenChange={setOpen} />
      </div>;
      break;
    }
    case "progress":
      demo = (
        <div className="demo-fields">
          <Progress
            label={t("Upload progress", "پیشرفت بارگذاری")}
            value={states.loading ? undefined : value[0]}
          />
          <Slider
            label={t("Progress", "پیشرفت")}
            value={value}
            onValueChange={setValue}
          />
        </div>
      );
      break;
    case "spinner":
      demo = (
        <div className="demo-row">
          <Spinner label={t("Loading", "در حال بارگذاری")} size={24} />
          <Spinner
            label={t("Loading projects", "در حال بارگذاری پروژه‌ها")}
          />
        </div>
      );
      break;
    case "skeleton":
      demo = (
        <div
          className="demo-fields"
          role="status"
          aria-label={t("Loading profile", "در حال بارگذاری نمایه")}
        >
          <div className="demo-row">
            <Skeleton rounded width={56} height={56} />
            <div className="demo-fields">
              <Skeleton width="65%" />
              <Skeleton width="45%" height={14} />
            </div>
          </div>
          <Skeleton height={100} />
        </div>
      );
      break;
    case "empty-state":
      demo = (
        <EmptyState
          title={t("A fresh start", "یک شروع تازه")}
          description={
            states.long
              ? t(
                  "There are no projects in this workspace yet. Start with a small idea, invite a teammate, and make something you want to use.",
                  "هنوز پروژه‌ای در این فضای کاری وجود ندارد. با ایده‌ای کوچک شروع کنید، یک همکار دعوت کنید و چیزی بسازید که می‌خواهید استفاده کنید.",
                )
              : t(
                  "Create your first project and give your ideas a home.",
                  "اولین پروژه را ایجاد و به ایده‌هایتان خانه‌ای بدهید.",
                )
          }
          action={
            <Button
              onClick={() =>
                setMessage(t("First project created.", "اولین پروژه ایجاد شد."))
              }
            >
              {t("Create project", "ایجاد پروژه")}
            </Button>
          }
        />
      );
      break;
  }
  return (
    <>
      <div className="demo-primary">{demo}</div>
      {message && (
        <output className="demo-result" role="status">
          {message}
        </output>
      )}
    </>
  );
}
