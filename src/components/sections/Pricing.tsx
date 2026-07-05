import { useRef } from "react";
import { useReveal } from "../../hooks/useReveal";
import { Check } from "../icons";
import { scrollToId } from "../../lib/scroll";

/** §8 — three fictional tiers. Marked clearly as demo pricing. */
const TIERS = [
  {
    name: "בסיס",
    price: "0",
    period: "לתמיד",
    tagline: "להתחיל להסתדר",
    features: [
      "עסק אחד",
      "עד 30 תורים בחודש",
      "עמוד הזמנות אישי",
      "תזכורות בוואטסאפ",
    ],
    cta: "מתחילים חינם",
    highlight: false,
  },
  {
    name: "מקצועי",
    price: "79",
    period: "לחודש",
    tagline: "הבחירה של רוב העסקים",
    features: [
      "תורים ללא הגבלה",
      "תזכורות SMS + וואטסאפ",
      "אנליטיקס והכנסות",
      "ניהול לקוחות מלא",
      "תורים חוזרים ורשימות המתנה",
    ],
    cta: "מתחילים ניסיון",
    highlight: true,
  },
  {
    name: "סטודיו",
    price: "149",
    period: "לחודש",
    tagline: "לצוות ולשיעורים",
    features: [
      "כל מה שבמקצועי",
      "מספר אנשי צוות",
      "שיעורים קבוצתיים",
      "גישת API",
      "תמיכה מועדפת",
    ],
    cta: "מתחילים ניסיון",
    highlight: false,
  },
];

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, "[data-reveal]", { start: "top 80%", stagger: 0.1 });

  return (
    <section ref={ref} id="pricing" className="bg-canvas py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <h2 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">
            מחיר פשוט, בלי הפתעות
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            מתחילים בחינם, משדרגים כשגדלים. אפשר לבטל בכל רגע.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              data-reveal
              className={`relative flex flex-col rounded-3xl p-7 sm:p-8 ${
                t.highlight
                  ? "border-2 border-indigo bg-white shadow-2xl shadow-indigo/15 lg:-translate-y-3"
                  : "border border-line bg-white"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rounded-full bg-indigo px-4 py-1.5 text-xs font-bold text-white shadow-md">
                  הפופולרי ביותר
                </span>
              )}
              <p className="font-heading text-lg font-bold text-ink">{t.name}</p>
              <p className="mt-1 text-sm text-ink-soft">{t.tagline}</p>
              <div className="mt-5 flex items-end gap-1.5">
                <span className="font-heading text-5xl font-extrabold text-ink nums">
                  ₪{t.price}
                </span>
                <span className="mb-2 text-sm text-ink-soft">{t.period}</span>
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/15 text-success-deep">
                      <Check width={13} height={13} />
                    </span>
                    <span className="text-[15px] text-ink">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => scrollToId("trial", { focus: true })}
                className={`mt-8 w-full rounded-full py-3.5 font-heading text-base font-bold transition ${
                  t.highlight
                    ? "bg-indigo text-white shadow-lg shadow-indigo/25 hover:bg-indigo-deep"
                    : "bg-indigo-wash text-indigo-deep hover:bg-indigo-light"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-faint" data-reveal>
          * מחירי דמו להמחשה בלבד — תורי הוא מוצר בדיוני לצורכי הדגמה.
        </p>
      </div>
    </section>
  );
}
