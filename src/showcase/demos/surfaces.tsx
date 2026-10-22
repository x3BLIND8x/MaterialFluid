import { useState, useMemo } from "react";
import {
  Card,
  List,
  Avatar,
  AvatarGroup,
  Badge,
  Accordion,
  Divider,
  DataTable,
} from "../../kit/surfaces";
import { Button } from "../../kit/controls";
import { EmptyState } from "../../kit/feedback";
import { AnimatedIcon } from "../../kit/icons";
import type { ColumnDef } from "@tanstack/react-table";
import { type DemoProps, translate } from "./shared";
export default function SurfacesDemo({ id, states, locale }: DemoProps) {
  const t = translate(locale);
  const [message, setMessage] = useState("");
  const description = states.long
    ? t(
        "A shared collection of ideas, sketches, research, and conversations for a team that cares about the details. Long content should wrap naturally without hiding the actions.",
        "مجموعه مشترک ایده‌ها، طرح‌ها، پژوهش‌ها و گفتگوها برای تیمی که به جزئیات اهمیت می‌دهد. متن بلند باید بدون پنهان کردن اقدامات به‌طور طبیعی شکسته شود.",
      )
    : t(
        "A little space for your next big idea.",
        "فضایی کوچک برای ایده بزرگ بعدی شما.",
      );
  type Person = { id: string; name: string; role: string; status: string };
  const people: Person[] = Array.from({ length: 13 }, (_, i) => ({
    id: String(i),
    name:
      locale === "fa"
        ? ["نورا احمدی", "آرمان رضایی", "سارا محمدی", "مینا نادری"][i % 4]
        : ["Nora Chen", "Arman Rezaei", "Sara Wilson", "Mina Park"][i % 4],
    role: i % 2 ? t("Developer", "توسعه‌دهنده") : t("Designer", "طراح"),
    status: i % 3 ? t("Active", "فعال") : t("Invited", "دعوت‌شده"),
  }));
  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      { accessorKey: "name", header: locale === "fa" ? "نام" : "Name" },
      { accessorKey: "role", header: locale === "fa" ? "نقش" : "Role" },
      {
        accessorKey: "status",
        header: locale === "fa" ? "وضعیت" : "Status",
        cell: (info) => (
          <Badge
            tone={
              info.getValue() === (locale === "fa" ? "فعال" : "Active")
                ? "primary"
                : "neutral"
            }
          >
            {String(info.getValue())}
          </Badge>
        ),
      },
    ],
    [locale],
  );
  let demo;
  switch (id) {
    case "card":
      demo = (
        <div className="demo-cards">
          <Card>
            <div className="demo-card-icon">
              <AnimatedIcon name="copy" size={28} />
            </div>
            <h3>{t("Project notes", "یادداشت‌های پروژه")}</h3>
            <p>{description}</p>
            <Button
              variant="text"
              onClick={() =>
                setMessage(t("Notes opened.", "یادداشت‌ها باز شدند."))
              }
            >
              {t("Open notes", "باز کردن یادداشت‌ها")}
            </Button>
          </Card>
          <Card variant="outlined">
            <div className="demo-card-icon">
              <AnimatedIcon name="heart" size={28} />
            </div>
            <h3>{t("Saved ideas", "ایده‌های ذخیره‌شده")}</h3>
            <p>{description}</p>
            <Button
              variant="text"
              onClick={() =>
                setMessage(t("Ideas opened.", "ایده‌ها باز شدند."))
              }
            >
              {t("View ideas", "مشاهده ایده‌ها")}
            </Button>
          </Card>
        </div>
      );
      break;
    case "list":
      demo = states.empty ? (
        <EmptyState
          title={t("No people yet", "هنوز عضوی وجود ندارد")}
          description={t(
            "Invite a teammate to get started.",
            "برای شروع یک همکار دعوت کنید.",
          )}
        />
      ) : (
        <List
          items={[
            t("Nora Chen", "نورا احمدی"),
            t("Arman Rezaei", "آرمان رضایی"),
            t("Sara Wilson", "سارا محمدی"),
          ].map((name, i) => ({
            id: String(i),
            title: name,
            description: states.long
              ? description
              : t(
                  ["Product designer", "Developer", "Researcher"][i],
                  ["طراح محصول", "توسعه‌دهنده", "پژوهشگر"][i],
                ),
            leading: <Avatar name={name} />,
            trailing: <AnimatedIcon name="chevron-right" size={18} />,
            onClick: () =>
              setMessage(
                `${name} — ${t("profile selected", "نمایه انتخاب شد")}`,
              ),
          }))}
        />
      );
      break;
    case "avatar":
      demo = (
        <div className="demo-row">
          <Avatar name={t("Nora Chen", "نورا احمدی")} />
          <AvatarGroup label={t("Project team", "تیم پروژه")} max={3}>
            {["Nora Chen", "Arman Rezaei", "Sara Wilson", "Mina Park", "Sam Reed"].map(name => <Avatar key={name} name={name} />)}
          </AvatarGroup>
        </div>
      );
      break;
    case "badge":
      demo = (
        <div className="demo-row">
          <Badge tone="neutral">{t("Draft", "پیش‌نویس")}</Badge>
          <Badge tone="primary">{t("New", "جدید")}</Badge>
          <Badge tone="success">{t("Active", "فعال")}</Badge>
          <Badge tone="warning">{t("Pending", "در انتظار")}</Badge>
          <Badge tone="info">{t("In progress", "در حال انجام")}</Badge>
          <Badge tone="error">{t("Needs attention", "نیازمند بررسی")}</Badge>
        </div>
      );
      break;
    case "accordion":
      demo = (
        <Accordion
          defaultValue="design"
          items={[
            {
              value: "design",
              title: t(
                "What makes a fluid interface?",
                "چه چیزی رابط را روان می‌کند؟",
              ),
              content: description,
            },
            {
              value: "motion",
              title: t(
                "What about reduced motion?",
                "حالت کاهش حرکت چگونه است؟",
              ),
              content: t(
                "Every expressive effect has a lightweight equivalent. System preferences are respected.",
                "هر جلوه بیانگر معادل سبک دارد. ترجیحات سیستم رعایت می‌شوند.",
              ),
            },
            {
              value: "access",
              title: t(
                "Does it work with a keyboard?",
                "آیا با صفحه‌کلید کار می‌کند؟",
              ),
              content: t(
                "Yes. Move between headings with arrow keys, and activate with Enter or Space.",
                "بله. با کلیدهای جهت بین عنوان‌ها حرکت و با Enter یا فاصله فعال کنید.",
              ),
            },
          ]}
        />
      );
      break;
    case "divider":
      demo = (
        <div className="demo-fields">
          <p>{t("A section about the project.", "بخشی درباره پروژه.")}</p>
          <Divider />
          <p className="mf-muted">
            {t(
              "A related section, clearly separated.",
              "بخشی مرتبط با جداسازی روشن.",
            )}
          </p>
        </div>
      );
      break;
    case "data-table":
      demo = (
        <DataTable
          caption={t(
            "Team members · illustrative data",
            "اعضای تیم · داده نمایشی",
          )}
          data={
            states.empty
              ? []
              : states.long
                ? [
                    ...people,
                    ...people.map((row) => ({
                      ...row,
                      id: `extra-${row.id}`,
                      name: `${row.name} ${t("from the international research team", "از تیم پژوهش بین‌المللی")}`,
                    })),
                  ]
                : people
          }
          columns={columns}
          getRowId={(row) => row.id}
          loading={states.loading}
          filterable={states.filters}
        />
      );
      break;
  }
  return (
    <>
      <div className="demo-primary demo-wide">{demo}</div>
      {message && (
        <output className="demo-result" role="status">
          {message}
        </output>
      )}
    </>
  );
}
