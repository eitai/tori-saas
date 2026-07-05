import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, MessageCircle, Phone as PhoneIcon, Clock } from "../icons";

gsap.registerPlugin(ScrollTrigger);

/**
 * §3–5 — the mock product screen MORPHS between three views as you scroll:
 *   booking page → reminders → analytics.
 *
 * Desktop + motion-ok: a pinned phone frame (~300vh) crossfades the three
 * screens while side captions swap. Mobile / reduced-motion: the same three
 * screens render as separate stacked cards (PRD fallback). Both copies live in
 * the DOM and toggle via `lg:motion-safe:*`; the GSAP timeline is scoped to the
 * morph copy only (gsap.utils.selector), so it never touches the stacked copy.
 */

/* ---------------- the three phone screens (shared) ---------------- */

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-[17rem] rounded-[2.2rem] bg-panel p-2.5 shadow-2xl ring-1 ring-panel-line/50">
      <div className="absolute start-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-panel" />
      <div className="relative h-[30rem] overflow-hidden rounded-[1.7rem] bg-white">
        {children}
      </div>
    </div>
  );
}

const SERVICES = ["תספורת", "תספורת + פן", "עיצוב זקן", "צבע שורשים"];
const SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"];

function BookingScreen() {
  return (
    <div className="flex h-full flex-col" dir="rtl">
      <div className="bg-indigo px-4 pb-4 pt-5 text-white">
        <p className="text-xs text-indigo-light">מספרת דניאל</p>
        <p className="font-heading text-lg font-bold">קביעת תור</p>
      </div>
      <div className="flex-1 space-y-4 overflow-hidden p-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-ink-soft">בחרו שירות</p>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s, i) => (
              <span
                key={s}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  i === 0
                    ? "bg-indigo text-white"
                    : "bg-canvas text-ink-soft ring-1 ring-line"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-ink-soft">בחרו שעה · היום</p>
          <div className="grid grid-cols-3 gap-2">
            {SLOTS.map((t, i) => (
              <span
                key={t}
                className={`rounded-lg py-2 text-center text-xs font-semibold nums ${
                  i === 1
                    ? "bg-indigo text-white shadow-md shadow-indigo/30"
                    : "bg-canvas text-ink ring-1 ring-line"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-center gap-2 rounded-xl bg-indigo py-3 font-heading text-sm font-bold text-white">
          <Check width={16} height={16} />
          אישור התור · 10:30
        </div>
      </div>
    </div>
  );
}

function RemindersScreen() {
  return (
    <div className="flex h-full flex-col bg-canvas" dir="rtl">
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <div>
          <p className="text-sm font-bold text-ink">תזכורת אוטומטית</p>
          <p className="text-[11px] text-ink-soft">נשלח יום לפני התור</p>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded-md bg-success/15 px-1.5 py-1 text-success-deep">
            <MessageCircle width={14} height={14} />
          </span>
          <span className="rounded-md bg-indigo/10 px-1.5 py-1 text-indigo">
            <PhoneIcon width={14} height={14} />
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-3 p-4">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-line">
          <p className="text-[13px] leading-relaxed text-ink">
            היי נועה 👋 תזכורת לתור מחר ב-09:00 במספרת דניאל. מגיעה?
          </p>
        </div>
        <div className="ms-auto max-w-[75%] rounded-2xl rounded-tl-sm bg-indigo px-3.5 py-2.5 text-white shadow-sm">
          <p className="text-[13px] leading-relaxed">כן, מגיעה! 🙌</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-success-wash px-3 py-2.5 text-success-deep">
          <Check width={16} height={16} />
          <span className="text-[13px] font-semibold">אישור הגעה התקבל · 09:00</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-center text-[11px] text-ink-faint">
          פחות אי-הגעות · בלי לרדוף אחרי אף אחד
        </p>
      </div>
    </div>
  );
}

const HOT_HOURS = [40, 62, 78, 95, 70, 52];
const TOP_SERVICES = [
  { name: "תספורת + פן", pct: 42 },
  { name: "עיצוב זקן", pct: 28 },
  { name: "צבע שורשים", pct: 18 },
];

function AnalyticsScreen() {
  return (
    <div className="flex h-full flex-col bg-white" dir="rtl">
      <div className="border-b border-line px-4 pb-3 pt-5">
        <p className="text-xs text-ink-soft">מספרת דניאל</p>
        <p className="font-heading text-lg font-bold text-ink">סיכום שבועי</p>
      </div>
      <div className="flex-1 space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-canvas p-3 ring-1 ring-line">
            <p className="text-[11px] text-ink-soft">הכנסות</p>
            <p className="font-heading text-lg font-extrabold text-ink nums">₪8,450</p>
          </div>
          <div className="rounded-xl bg-canvas p-3 ring-1 ring-line">
            <p className="text-[11px] text-ink-soft">אי-הגעות</p>
            <p className="font-heading text-lg font-extrabold text-success-deep nums">
              4%
            </p>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
            <Clock width={13} height={13} />
            שעות חמות
          </div>
          <div className="flex h-20 items-end gap-1.5">
            {HOT_HOURS.map((h, i) => (
              <div key={i} className="flex-1">
                <div
                  className="rounded-t bg-indigo/80"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-ink-soft">שירותים מובילים</p>
          {TOP_SERVICES.map((s) => (
            <div key={s.name}>
              <div className="mb-1 flex justify-between text-[11px] text-ink">
                <span>{s.name}</span>
                <span className="font-semibold nums">{s.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-indigo"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    step: "01",
    tag: "עמוד הזמנות",
    title: "הלקוחות קובעים לבד",
    body: "עמוד הזמנות אישי בעברית: בוחרים שירות, שעה ומאשרים — בלי טלפונים ובלי הודעות הלוך ושוב. היומן מתעדכן לבד.",
    screen: <BookingScreen />,
  },
  {
    step: "02",
    tag: "תזכורות",
    title: "תזכורות שמחזירות אנשים",
    body: "התראה אוטומטית ב-SMS ובוואטסאפ לפני כל תור, עם בקשת אישור הגעה — כדי שהכיסא לא יישאר ריק.",
    screen: <RemindersScreen />,
  },
  {
    step: "03",
    tag: "אנליטיקס",
    title: "אנליטיקס שמדבר בעברית",
    body: "שעות חמות, שירותים מובילים ואחוזי אי-הגעה — תמונה ברורה של העסק, בלי גיליון אקסל אחד.",
    screen: <AnalyticsScreen />,
  },
];

export default function FeatureShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const morphRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const morph = morphRef.current;
    const stage = stageRef.current;
    if (!morph || !stage) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const q = gsap.utils.selector(morph);

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: "+=300%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          const morphTo = (from: number, to: number, at: number) => {
            tl.to(
              q(`[data-screen="${from}"]`),
              { autoAlpha: 0, scale: 0.94, duration: 0.5 },
              at
            );
            tl.fromTo(
              q(`[data-screen="${to}"]`),
              { autoAlpha: 0, scale: 1.06 },
              { autoAlpha: 1, scale: 1, duration: 0.5 },
              at + 0.1
            );
            tl.to(
              q(`[data-fcap="${from}"]`),
              { autoAlpha: 0, y: -16, duration: 0.4 },
              at
            );
            tl.fromTo(
              q(`[data-fcap="${to}"]`),
              { autoAlpha: 0, y: 16 },
              { autoAlpha: 1, y: 0, duration: 0.5 },
              at + 0.1
            );
          };

          tl.to({}, { duration: 0.6 }); // hold screen 1
          morphTo(1, 2, 0.8);
          tl.to({}, { duration: 0.6 }); // hold screen 2
          morphTo(2, 3, 2.0);
          tl.to({}, { duration: 0.8 }); // hold screen 3
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="bg-white">
      {/* ---------- desktop morph (pinned) ---------- */}
      <div ref={morphRef} className="hidden lg:motion-safe:block">
        <div
          ref={stageRef}
          className="mx-auto flex min-h-svh max-w-6xl items-center gap-12 px-6"
        >
          {/* captions (RTL start = right) */}
          <div className="relative flex-1">
            <p className="inline-flex rounded-full bg-indigo-wash px-3.5 py-1.5 text-sm font-semibold text-indigo-deep ring-1 ring-indigo/15">
              המערכת מבפנים
            </p>
            <div className="relative mt-6 min-h-[13rem]">
              {FEATURES.map((f, i) => (
                <div
                  key={f.step}
                  data-fcap={i + 1}
                  className={`absolute inset-0 ${
                    i === 0 ? "" : "invisible opacity-0"
                  }`}
                >
                  <p className="font-heading text-sm font-bold text-indigo nums">
                    {f.step} · {f.tag}
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-extrabold text-ink sm:text-4xl">
                    {f.title}
                  </h2>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* phone with the three stacked screens */}
          <div className="flex-1">
            <Phone>
              {FEATURES.map((f, i) => (
                <div
                  key={f.step}
                  data-screen={i + 1}
                  className={`absolute inset-0 ${
                    i === 0 ? "" : "invisible opacity-0"
                  }`}
                >
                  {f.screen}
                </div>
              ))}
            </Phone>
          </div>
        </div>
      </div>

      {/* ---------- mobile / reduced-motion stack ---------- */}
      <div className="mx-auto max-w-2xl space-y-16 px-5 py-24 lg:motion-safe:hidden">
        <div className="text-center">
          <p className="inline-flex rounded-full bg-indigo-wash px-3.5 py-1.5 text-sm font-semibold text-indigo-deep">
            המערכת מבפנים
          </p>
          <h2 className="mt-4 font-heading text-3xl font-extrabold text-ink">
            שלושה מסכים, זרימה אחת
          </h2>
        </div>
        {FEATURES.map((f) => (
          <div key={f.step} className="flex flex-col items-center gap-6">
            <div>
              <p className="text-center font-heading text-sm font-bold text-indigo nums">
                {f.step} · {f.tag}
              </p>
              <h3 className="mt-2 text-center font-heading text-2xl font-extrabold text-ink">
                {f.title}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-center text-ink-soft">
                {f.body}
              </p>
            </div>
            <Phone>{f.screen}</Phone>
          </div>
        ))}
      </div>
    </section>
  );
}
