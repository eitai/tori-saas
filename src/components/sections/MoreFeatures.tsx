import { useRef } from "react";
import { useReveal } from "../../hooks/useReveal";
import { Users, Calendar, Bell, BarChart, MessageCircle, Settings } from "../icons";

/**
 * §6 — the rest of the capabilities as a calm grid (including customer
 * management). Capability-only copy, no invented stats.
 */
const ITEMS = [
  {
    icon: Users,
    title: "ניהול לקוחות",
    body: "כרטיס לקוח עם היסטוריית תורים, העדפות והערות — כדי שכל לקוח יקבל יחס אישי.",
  },
  {
    icon: Calendar,
    title: "יומן חכם",
    body: "תצוגת יום, שבוע וחודש, עם חסימות זמן, הפסקות ותורים חוזרים אוטומטית.",
  },
  {
    icon: Bell,
    title: "תזכורות אוטומטיות",
    body: "SMS ווואטסאפ לפני התור, עם בקשת אישור הגעה ותזכורת חוזרת ללא מענה.",
  },
  {
    icon: BarChart,
    title: "דוחות והכנסות",
    body: "הכנסות, תפוסה ואי-הגעות בזמן אמת — לדעת מה עובד ומתי כדאי לפתוח עוד שעות.",
  },
  {
    icon: MessageCircle,
    title: "רשימות המתנה",
    body: "משבצת התפנתה? המערכת מציעה אותה אוטומטית ללקוח הבא בתור. מתאים גם לשיעורים קבוצתיים.",
  },
  {
    icon: Settings,
    title: "מספר אנשי צוות",
    body: "יומן, שירותים ושעות נפרדים לכל עובד — ותמונה מאוחדת של כל העסק במסך אחד.",
  },
];

export default function MoreFeatures() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, "[data-reveal]", { start: "top 82%", stagger: 0.08 });

  return (
    <section ref={ref} className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <h2 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">
            כל מה שעסק קטן צריך — במקום אחד
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            מברבר ומספרה, דרך קליניקה ומטפלים, ועד סטודיו לשיעורים קבוצתיים.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              data-reveal
              className="rounded-2xl border border-line bg-canvas p-6 transition hover:border-indigo/30 hover:shadow-lg hover:shadow-indigo/5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-wash text-indigo">
                <it.icon width={22} height={22} />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-ink">
                {it.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
