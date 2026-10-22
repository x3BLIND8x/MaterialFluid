import { useState } from "react";
import {
  Dialog,
  AlertDialog,
  Drawer,
  BottomSheet,
  Popover,
  Menu,
  Tooltip,
} from "../../kit/overlays";
import { Button, IconButton, Switch } from "../../kit/controls";
import { TextField } from "../../kit/forms";
import { AnimatedIcon } from "../../kit/icons";
import { type DemoProps, translate } from "./shared";
export default function OverlaysDemo({ id, states, locale }: DemoProps) {
  const t = translate(locale);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(true);
  const content = (
    <div className="demo-fields">
      <TextField
        label={t("Project name", "نام پروژه")}
        defaultValue="MaterialFluid"
      />
      {states.long && (
        <p className="mf-muted">
          {Array.from({ length: 8 }, () =>
            t(
              "This surface keeps its actions accessible even with longer content.",
              "این سطح حتی با محتوای طولانی‌تر اقدامات را دسترس‌پذیر نگه می‌دارد.",
            ),
          ).join(" ")}
        </p>
      )}
      <Switch
        label={t("Project updates", "به‌روزرسانی پروژه")}
        checked={enabled}
        onCheckedChange={setEnabled}
      />
    </div>
  );
  const save = (
    <Button
      onClick={() => {
        setOpen(false);
        setMessage(t("Changes saved.", "تغییرات ذخیره شدند."));
      }}
    >
      {t("Save changes", "ذخیره تغییرات")}
    </Button>
  );
  let demo;
  switch (id) {
    case "dialog":
      demo = (
        <Dialog
          title={t("Edit project", "ویرایش پروژه")}
          description={t(
            "A few details make it yours.",
            "چند جزئیات آن را شخصی می‌کند.",
          )}
          trigger={
            <Button onClick={() => setOpen(true)}>
              {t("Open dialog", "باز کردن پنجره")}
            </Button>
          }
          open={open}
          onOpenChange={setOpen}
          footer={save}
        >
          {content}
        </Dialog>
      );
      break;
    case "alert-dialog":
      demo = (
        <AlertDialog
          title={t("Archive this project?", "این پروژه بایگانی شود؟")}
          description={t(
            "You can restore it later. Your files will be kept.",
            "بعداً می‌توانید آن را بازگردانید. فایل‌ها حفظ می‌شوند.",
          )}
          trigger={
            <Button variant="outlined">
              {t("Archive project", "بایگانی پروژه")}
            </Button>
          }
          onConfirm={() =>
            setMessage(t("Project archived.", "پروژه بایگانی شد."))
          }
        />
      );
      break;
    case "drawer":
      demo = (
        <Drawer
          title={t("Project settings", "تنظیمات پروژه")}
          description={t(
            "Change a detail, then get back to your work.",
            "جزئیات را تغییر و به کار خود برگردید.",
          )}
          trigger={<Button>{t("Open drawer", "باز کردن کشو")}</Button>}
          open={open}
          onOpenChange={setOpen}
          footer={save}
        >
          {content}
          <p className="demo-caption">
            {t(
              "Swipe this surface toward its edge to dismiss.",
              "برای بستن، سطح را به سمت لبه بکشید.",
            )}
          </p>
        </Drawer>
      );
      break;
    case "bottom-sheet":
      demo = (
        <BottomSheet
          title={t("Make it yours", "شخصی‌سازی")}
          description={t("Drag the handle up to expand, or down to close. Arrow keys work too.", "دستگیره را برای گسترش بالا و برای بستن پایین بکشید. کلیدهای جهت هم کار می‌کنند.")}
          trigger={
            <Button>{t("Open bottom sheet", "باز کردن برگه پایین")}</Button>
          }
          open={open}
          onOpenChange={setOpen}
          footer={save}
        >
          {content}
        </BottomSheet>
      );
      break;
    case "popover":
      demo = (
        <Popover
          label={t("Display settings", "تنظیمات نمایش")}
          trigger={
            <Button leading={<AnimatedIcon name="sliders" />}>
              {t("Display options", "گزینه‌های نمایش")}
            </Button>
          }
        >
          <div className="demo-fields">
            <h3>{t("A little more focus", "کمی تمرکز بیشتر")}</h3>
            <p className="mf-muted">
              {t(
                "This surface grows from the button you pressed.",
                "این سطح از دکمه‌ای که فشار دادید گسترش می‌یابد.",
              )}
            </p>
            <Switch
              label={t("Show details", "نمایش جزئیات")}
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </Popover>
      );
      break;
    case "menu":
      demo = (
        <Menu
          label={t("Project actions", "اقدامات پروژه")}
          trigger={
            <Button
              variant="primary"
              trailing={<AnimatedIcon name="chevron-down" />}
            >
              {t("Actions", "اقدامات")}
            </Button>
          }
          items={[
            {
              id: "copy",
              label: t("Duplicate", "تکثیر"),
              icon: <AnimatedIcon name="copy" />,
              onSelect: () =>
                setMessage(t("Project duplicated.", "پروژه تکثیر شد.")),
            },
            {
              id: "download",
              label: t("Download", "دریافت"),
              icon: <AnimatedIcon name="download" />,
              onSelect: () =>
                setMessage(
                  t("Download action selected.", "اقدام دریافت انتخاب شد."),
                ),
            },
            {
              id: "archive",
              label: t("Archive", "بایگانی"),
              onSelect: () =>
                setMessage(t("Project archived.", "پروژه بایگانی شد.")),
            },
            {
              id: "locked",
              label: t("Unavailable action", "اقدام غیرقابل دسترس"),
              disabled: true,
            },
          ]}
        />
      );
      break;
    case "tooltip":
      demo = (
        <div className="demo-stack">
          <Tooltip content={t("Notifications", "اعلان‌ها")}>
            <IconButton
              label={t("Notifications", "اعلان‌ها")}
              variant="outlined"
              onClick={() =>
                setMessage(
                  t("Notification action activated.", "اقدام اعلان فعال شد."),
                )
              }
            >
              <AnimatedIcon name="bell" />
            </IconButton>
          </Tooltip>
          <p className="demo-caption">
            {t(
              "Hover or focus. The button always has its own label.",
              "اشاره یا تمرکز کنید. دکمه همیشه برچسب مستقل دارد.",
            )}
          </p>
        </div>
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
