import { useState } from "react";
import {
  TextField,
  Textarea,
  PasswordField,
  NumberField,
  SearchField,
  Select,
  Combobox,
  MultiSelect,
  OTPInput,
  FileInput,
  FormField,
} from "../../kit/forms";
import {
  Calendar,
  DatePicker,
  DateRangePicker,
  TimePicker,
  type CalendarSystem,
} from "../../kit/dates";
import { ToggleGroup, Button } from "../../kit/controls";
import { type DemoProps, translate } from "./shared";
export default function FormsDemo({ id, states, locale }: DemoProps) {
  const t = translate(locale);
  const [calendar, setCalendar] = useState<CalendarSystem>(
    locale === "fa" ? "persian" : "gregorian",
  );
  const [hourFormat, setHourFormat] = useState<12 | 24>(24);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const error = states.invalid
    ? t(
        "Please enter a valid value to continue.",
        "برای ادامه مقدار معتبر وارد کنید.",
      )
    : undefined;
  const hint = t(
    "Visible labels stay with the field.",
    "برچسب هنگام ورود متن قابل مشاهده می‌ماند.",
  );
  const options = states.empty
    ? []
    : [
        { value: "design", label: t("Design", "طراحی") },
        { value: "development", label: t("Development", "توسعه") },
        { value: "research", label: t("Research", "پژوهش") },
        { value: "writing", label: t("Writing", "نویسندگی") },
        { value: "strategy", label: t("Strategy", "استراتژی") },
        { value: "illustration", label: t("Illustration", "تصویرسازی") },
        { value: "motion", label: t("Motion design", "طراحی حرکت") },
        { value: "photography", label: t("Photography", "عکاسی") },
        { value: "branding", label: t("Branding", "برندسازی") },
        { value: "accessibility", label: t("Accessibility", "دسترس‌پذیری") },
        { value: "analytics", label: t("Analytics", "تحلیل داده") },
        { value: "testing", label: t("Testing", "آزمون") },
        { value: "localization", label: t("Localization", "بومی‌سازی") },
        { value: "content", label: t("Content design", "طراحی محتوا") },
        { value: "architecture", label: t("Architecture", "معماری") },
        { value: "management", label: t("Project management", "مدیریت پروژه") },
      ];
  const fieldProps = { disabled: states.disabled, error, hint };
  let demo;
  switch (id) {
    case "text-field":
      demo = (
        <TextField
          {...fieldProps}
          label={t("Project name", "نام پروژه")}
          maxLength={60}
          placeholder={t("Untitled project", "پروژه بدون عنوان")}
          defaultValue={
            states.long
              ? t(
                  "A shared workspace for a growing creative team",
                  "فضای کاری مشترک برای یک تیم خلاق در حال رشد",
                )
              : undefined
          }
        />
      );
      break;
    case "textarea":
      demo = (
        <Textarea
          {...fieldProps}
          label={t("Project description", "توضیحات پروژه")}
          maxLength={240}
          placeholder={t(
            "What would you like to make?",
            "چه چیزی می‌خواهید بسازید؟",
          )}
          defaultValue={
            states.long
              ? t(
                  "A thoughtfully designed workspace for ideas, sketches, and conversations. Every small detail should make everyday work feel a little easier.",
                  "فضای کاری برای ایده‌ها، طرح‌ها و گفتگوها. هر جزئیات کوچک باید انجام کارهای روزمره را کمی آسان‌تر کند.",
                )
              : undefined
          }
        />
      );
      break;
    case "password-field":
      demo = (
        <PasswordField
          {...fieldProps}
          label={t("Password", "رمز عبور")}
          defaultValue="fluid-design-2026"
          autoComplete="new-password"
        />
      );
      break;
    case "number-field":
      demo = <div className="demo-fields">
        <NumberField {...fieldProps} label={t("Team size", "تعداد اعضای تیم")} min={1} max={100} defaultValue={6} />
        <NumberField {...fieldProps} presentation="goal" label={t("Daily movement goal", "هدف تحرک روزانه")} unit={t("steps per day", "قدم در روز")} min={0} max={100000} step={500} defaultValue={10000} />
      </div>;
      break;
    case "search-field":
      demo = (
        <SearchField
          {...fieldProps}
          label={t("Search projects", "جستجوی پروژه‌ها")}
          placeholder={t("Type a project name", "نام پروژه را وارد کنید")}
        />
      );
      break;
    case "select":
      demo = (
        <Select
          label={t("Discipline", "تخصص")}
          options={options}
          defaultValue="design"
          disabled={states.disabled}
          error={error}
        />
      );
      break;
    case "combobox":
      demo = (
        <div className="demo-stack demo-selection-fields">
          <Combobox label={t("Find a discipline", "یافتن تخصص")} options={options} disabled={states.disabled} placeholder={t("Search options…", "جستجوی گزینه‌ها…")} />
          <Combobox label={t("Choose or add a discipline", "انتخاب یا افزودن تخصص")} options={options} allowCustom maxLength={30} disabled={states.disabled} placeholder={t("Search or add your own…", "جستجو یا افزودن مقدار دلخواه…")} />
        </div>
      );
      break;
    case "multi-select":
      demo = (
        <MultiSelect
          label={t("Your disciplines", "تخصص‌های شما")}
          options={options}
          defaultValue={states.empty ? [] : ["design", "research"]}
          disabled={states.disabled}
          placeholder={t("Select options", "گزینه‌ها را انتخاب کنید")}
        />
      );
      break;
    case "otp-input":
      demo = (
        <div className="demo-stack">
          <OTPInput
            success={code === "123654"}
            error={error || (code.length === 6 && code !== "123654" ? t("Incorrect code. Try again.", "کد نادرست است. دوباره تلاش کنید.") : undefined)}
            hint={t("Demo code: 123654", "کد نمونه: 123654")}
            label={t("Verification code", "کد تأیید")}
            value={code}
            onValueChange={setCode}
            disabled={states.disabled}
          />
          <output className="demo-caption" role="status">
            {code === "123654"
              ? t("Code accepted.", "کد پذیرفته شد.")
              : t(
                  "Paste a six-digit code or type each digit.",
                  "کد شش‌رقمی را بچسبانید یا رقم‌ها را وارد کنید.",
                )}
          </output>
        </div>
      );
      break;
    case "file-input":
      demo = <div className="demo-fields">
        <FileInput {...fieldProps} label={t("Attachment", "پیوست")} accept=".pdf,.png,.jpg" hint={t("Choose or drop a PDF or image.", "یک PDF یا تصویر انتخاب کنید یا بکشید.")} />
        <FileInput {...fieldProps} multiple label={t("Project files", "فایل‌های پروژه")} accept=".pdf,.png,.jpg" hint={t("Choose multiple files or drop them here.", "چند فایل انتخاب کنید یا اینجا رها کنید.")} />
      </div>;
      break;
    case "form-field":
      demo = (
        <form
          className="demo-fields"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(
              t("Form submitted successfully.", "فرم با موفقیت ثبت شد."),
            );
          }}
        >
          <FormField
            label={t("Your name", "نام شما")}
            htmlFor="sample-name"
            error={error}
            hint={hint}
            descriptionId="sample-name-help"
            required
          >
            <div className="mf-input-wrap">
              <input
                id="sample-name"
                required
                className="mf-input"
                aria-describedby="sample-name-help"
                aria-invalid={states.invalid || undefined}
              />
            </div>
          </FormField>
          <Button type="submit">{t("Submit", "ثبت")}</Button>
          <output role="status">{message}</output>
        </form>
      );
      break;
    case "calendar":
      demo = (
        <Calendar
          calendar={calendar}
          defaultValue="2026-10-14"
          disabled={states.disabled}
        />
      );
      break;
    case "date-picker":
      demo = (
        <DatePicker
          {...fieldProps}
          label={t("Start date", "تاریخ شروع")}
          calendar={calendar}
          min="2026-01-01"
          max="2027-12-31"
        />
      );
      break;
    case "date-range-picker":
      demo = (
        <DateRangePicker
          {...fieldProps}
          label={t("Project dates", "بازه زمانی پروژه")}
          calendar={calendar}
          defaultValue={{ from: "2026-10-14", to: "2026-10-20" }}
        />
      );
      break;
    case "time-picker":
      demo = (
        <div className="demo-stack demo-selection-fields">
          <ToggleGroup className="mf-time-format" label={t("Time format", "قالب زمان")} value={String(hourFormat)} onValueChange={next => setHourFormat(Number(next) as 12 | 24)} options={[{ value: "24", label: t("24 hour", "۲۴ ساعته") }, { value: "12", label: t("12 hour", "۱۲ ساعته") }]} />
          <TimePicker {...fieldProps} label={t("Meeting time", "زمان جلسه")} defaultValue="09:30" hourFormat={hourFormat} />
        </div>
      );
      break;
  }
  const calendarPage = [
    "calendar",
    "date-picker",
    "date-range-picker",
  ].includes(id);
  return (
    <div className="demo-primary">
      <div className={calendarPage ? "demo-stack" : "demo-fields"}>
        {calendarPage && (
          <ToggleGroup
            label={t("Calendar system", "سیستم تقویم")}
            options={[
              { value: "gregorian", label: t("Gregorian", "میلادی") },
              { value: "persian", label: t("Persian", "شمسی") },
            ]}
            value={calendar}
            onValueChange={(value) => setCalendar(value as CalendarSystem)}
          />
        )}
        <div className={id === "calendar" ? "" : "demo-fields"}>{demo}</div>
      </div>
    </div>
  );
}
