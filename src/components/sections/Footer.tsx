import Logo from "../Logo";
import { STUDIO_URL } from "../../lib/site";
import { scrollToId } from "../../lib/scroll";

const LINKS = [
  { id: "pain", label: "יתרונות" },
  { id: "features", label: "המערכת" },
  { id: "how", label: "איך זה עובד" },
  { id: "pricing", label: "מחירים" },
  { id: "faq", label: "שאלות" },
];

/** §11 — footer with the required E&M Studio credit + demo disclaimer. */
export default function Footer() {
  return (
    <footer className="border-t border-panel-line/40 bg-panel text-slate-300">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-4 leading-relaxed text-slate-400">
              מערכת ניהול תורים חכמה לעסקים קטנים: יומן, תזכורות אוטומטיות
              ואנליטיקס — הכל במקום אחד.
            </p>
          </div>

          <nav aria-label="ניווט תחתון">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LINKS.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(l.id, { focus: true })}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-panel-line/40 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-400">
            נבנה על ידי{" "}
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white underline decoration-indigo-mid/60 underline-offset-4 transition hover:decoration-indigo-mid"
            >
              E&amp;M Studio
            </a>
          </p>
          <p className="rounded-full bg-panel-soft px-4 py-1.5 text-xs text-slate-400 ring-1 ring-panel-line/50">
            פרויקט פורטפוליו; המוצר בדיוני
          </p>
        </div>
      </div>
    </footer>
  );
}
