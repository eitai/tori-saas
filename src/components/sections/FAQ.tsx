import { useRef } from "react";
import { useReveal } from "../../hooks/useReveal";
import { ChevronDown } from "../icons";

/**
 * §9 — FAQ as native <details>/<summary> (accessible + keyboard-friendly).
 * The Q&A text mirrors the FAQPage JSON-LD in index.html exactly, so the
 * structured data is eligible for FAQ rich results.
 */
const FAQS = [
  {
    q: "אפשר לייבא את היומן הקיים שלי?",
    a: "כן. תורי מאפשר לייבא תורים קיימים מקובץ או מיומן גוגל, כך שאפשר להתחיל לעבוד בלי להזין הכל מחדש. גם סנכרון דו-כיווני עם יומן גוגל נתמך.",
  },
  {
    q: "כמה זמן לוקח להתקין ולהתחיל לעבוד?",
    a: "אין התקנה. נרשמים, מגדירים את השירותים ושעות הפעילות, ומקבלים לינק אישי לעמוד הזמנות שאפשר לשתף מיד ללקוחות. רוב העסקים מוכנים לעבוד תוך פחות מרבע שעה.",
  },
  {
    q: "התזכורות יוצאות בוואטסאפ או ב-SMS?",
    a: "בשניהם. תורי שולח תזכורות אוטומטיות ב-SMS ובוואטסאפ לפני התור, כולל בקשת אישור הגעה — כדי להפחית אי-הגעות בלי שתצטרכו לרדוף אחרי אף אחד.",
  },
  {
    q: "מה קורה כשלקוח רוצה לבטל או לשנות תור?",
    a: "הלקוח יכול לבטל או להזיז את התור לבד מהלינק האישי, בהתאם למדיניות הביטול שאתם מגדירים. המשבצת שמתפנה נפתחת אוטומטית להזמנה מחדש.",
  },
  {
    q: "העמוד ידידותי גם ללקוחות מבוגרים?",
    a: "כן. עמוד ההזמנות פשוט, בעברית, נגיש ועובד מצוין בנייד — בלי אפליקציה להוריד ובלי הרשמה מסובכת. הלקוח בוחר שירות, שעה, ומאשר.",
  },
  {
    q: "אפשר לנהל צוות של כמה עובדים?",
    a: "כן, בחבילת סטודיו. אפשר להגדיר יומן נפרד לכל איש צוות, שירותים ושעות משלו, ולראות תמונה מאוחדת של כל העסק במקום אחד.",
  },
  {
    q: "האם המערכת מתאימה לשיעורים קבוצתיים?",
    a: "כן. אפשר להגדיר שיעורים עם מספר מקומות מוגבל, רשימות המתנה, והרשמה עצמית — מתאים לסטודיו יוגה, פילאטיס או אימונים קבוצתיים.",
  },
  {
    q: "רגע — תורי הוא מוצר אמיתי?",
    a: "לא. תורי הוא פרויקט פורטפוליו של E&M Studio — דמו שממחיש איך נראית ומרגישה מערכת SaaS שנבנית בקוד מותאם אישית. רוצים מערכת כזו לעסק שלכם? דברו איתנו.",
  },
];

export default function FAQ() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, "[data-reveal]", { start: "top 82%", stagger: 0.06 });

  return (
    <section ref={ref} id="faq" className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <div className="text-center" data-reveal>
          <h2 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">
            שאלות נפוצות
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            כל מה שרוצים לדעת על תורי — בשקיפות מלאה.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              data-reveal
              className="group rounded-2xl border border-line bg-canvas px-5 open:border-indigo/30 open:bg-indigo-wash/40"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-heading text-lg font-bold text-ink marker:content-['']">
                {f.q}
                <ChevronDown
                  width={20}
                  height={20}
                  className="shrink-0 text-indigo transition-transform duration-300 group-open:rotate-180"
                />
              </summary>
              <p className="pb-5 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
