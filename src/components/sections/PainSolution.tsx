import { useRef } from "react";
import { useReveal } from "../../hooks/useReveal";
import { Check, Close } from "../icons";

/**
 * §2 — Pain → Solution. Two columns: today's mess (WhatsApp, notebook,
 * no-shows) vs. the same day run through תורי. Honest, capability-only copy.
 */

const PAINS = [
  "תורים מתנהלים בוואטסאפ ובראש — ומדי פעם משהו נופל בין הכיסאות",
  "לקוחות לא מגיעים, ואין תזכורת שתחזיר אותם",
  "כל שינוי שעה זה שרשור הודעות הלוך ושוב",
  "בסוף החודש יושבים עם מחברת ומחשבון כדי להבין כמה נכנס",
];

const GAINS = [
  "כל התורים במקום אחד — יומן חכם שמתעדכן לבד",
  "תזכורות אוטומטיות ב-SMS ובוואטסאפ, עם אישור הגעה",
  "הלקוח קובע, מבטל ומזיז תור לבד — מהלינק האישי",
  "הכנסות ותפוסה בזמן אמת, בלי אקסל ובלי לנחש",
];

export default function PainSolution() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, "[data-reveal]", { start: "top 78%", stagger: 0.12 });

  return (
    <section ref={ref} id="pain" className="bg-canvas py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <h2 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">
            הניהול לא צריך להיות כאב ראש
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            רוב העסקים הקטנים מנהלים תורים בשיטות שעובדות "בערך". תורי הופך את
            הבלגן לסדר — בלי להחליף את איך שאתם עובדים.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* today */}
          <div
            data-reveal
            className="rounded-3xl border border-line bg-white p-7 sm:p-9"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-rose/10 px-3.5 py-1.5 text-sm font-bold text-rose">
              היום
            </span>
            <ul className="mt-6 space-y-4">
              {PAINS.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose/10 text-rose">
                    <Close width={14} height={14} />
                  </span>
                  <span className="text-ink-soft">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* with tori */}
          <div
            data-reveal
            className="relative overflow-hidden rounded-3xl border border-indigo/20 bg-gradient-to-br from-indigo-wash to-white p-7 shadow-lg shadow-indigo/10 sm:p-9"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo px-3.5 py-1.5 text-sm font-bold text-white">
              עם תורי
            </span>
            <ul className="mt-6 space-y-4">
              {GAINS.map((g) => (
                <li key={g} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/15 text-success-deep">
                    <Check width={14} height={14} />
                  </span>
                  <span className="font-medium text-ink">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
