import { useRef } from "react";
import { useReveal } from "../../hooks/useReveal";
import { Sparkles, Clock, Link } from "../icons";

/** §7 — three plain steps to go live. Simple staggered reveal, not pinned. */
const STEPS = [
  {
    icon: Sparkles,
    title: "נרשמים בדקה",
    body: "פותחים חשבון, ללא כרטיס אשראי. בלי התקנה ובלי אפליקציה להוריד.",
  },
  {
    icon: Clock,
    title: "מגדירים שירותים ושעות",
    body: "מוסיפים את השירותים, המחירים ושעות הפעילות — פעם אחת, וזהו.",
  },
  {
    icon: Link,
    title: "משתפים לינק ללקוחות",
    body: "מקבלים לינק אישי לעמוד הזמנות — שולחים לוואטסאפ, לאינסטגרם, לכל מקום.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, "[data-reveal]", { start: "top 80%", stagger: 0.14 });

  return (
    <section ref={ref} id="how" className="bg-canvas py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <h2 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">
            עולים לאוויר בשלושה צעדים
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            בלי אנשי טכנולוגיה, בלי מדריכים ארוכים. רוב העסקים מוכנים לעבוד בפחות
            מרבע שעה.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              data-reveal
              className="relative rounded-3xl border border-line bg-white p-7"
            >
              <span className="absolute end-6 top-6 font-heading text-5xl font-extrabold text-indigo/10 nums">
                {i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-wash text-indigo">
                <s.icon width={24} height={24} />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
