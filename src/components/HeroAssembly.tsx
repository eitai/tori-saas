import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DashboardMock, { KPI } from "./DashboardMock";
import { TOASTS } from "../data/demo";
import { Check, Bell, Reply, ArrowLeft, Sparkles, Play } from "./icons";
import { scrollToId } from "../lib/scroll";
import { useOpenDemo } from "../demo/openContext";

gsap.registerPlugin(ScrollTrigger);

/**
 * THE signature scene — a pinned, scroll-scrubbed DASHBOARD ASSEMBLY, 100%
 * coded (DOM/SVG + one GSAP timeline, no video, no images). Follows the PRD's
 * 6-stage storyboard:
 *   1 skeleton/frame  → 2 calendar fills → 3 notification toasts →
 *   4 KPI counters run → 5 weekly chart draws itself → 6 live dashboard + CTA
 *
 * Desktop + motion-ok: pinned (~450vh) numeric scrub (=1). A persistent H1/CTA
 * carry LCP + SEO; a 6-beat narration crossfades alongside the assembly.
 * Mobile: no pin — a one-time entrance plays the counters, chart and toasts.
 * reduced-motion: no pin, no scrub — the fully-assembled dashboard just sits.
 */

const CAPTIONS = [
  { t: "נעים להכיר, תורי.", s: "מערכת ניהול התורים של העסק שלך — במסך אחד." },
  { t: "הלקוחות קובעים לבד.", s: "עמוד הזמנות אישי, והיומן מתמלא — בלי שיחת טלפון אחת." },
  { t: "תזכורות אוטומטיות.", s: "SMS ווואטסאפ יוצאים לבד — פחות אי-הגעות, בלי לרדוף." },
  { t: "רואים כל שקל.", s: "תמונת הכנסות בזמן אמת, בלי אקסל בסוף החודש." },
  { t: "והשבוע הבא כבר מתוכנן.", s: "אנליטיקס פשוט שמראה מה באמת עובד." },
  { t: "העסק מנוהל. אתם עובדים.", s: "כל מה שראית עכשיו — נבנה כאן בקוד, פריים אחרי פריים." },
];

const TOAST_ICON = { check: Check, bell: Bell, reply: Reply };

export default function HeroAssembly() {
  const stageRef = useRef<HTMLElement>(null);
  const openDemo = useOpenDemo();

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const fmtInt = (v: number) => Math.round(v).toLocaleString("en-US");

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ---------------- desktop: pinned scrub ---------------- */
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: "+=450%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          const countUp = (
            id: string,
            to: number,
            at: number,
            dur = 0.9
          ) => {
            const el = document.getElementById(id);
            if (!el) return;
            const p = { v: 0 };
            tl.to(
              p,
              {
                v: to,
                duration: dur,
                ease: "power1.out",
                snap: { v: 1 },
                onUpdate: () => (el.textContent = fmtInt(p.v)),
              },
              at
            );
          };

          const capOut = (i: number, at: number) =>
            tl.to(
              `[data-cap="${i}"]`,
              { autoAlpha: 0, y: -16, duration: 0.4, ease: "power2.in" },
              at
            );
          const capIn = (i: number, at: number) =>
            tl.fromTo(
              `[data-cap="${i}"]`,
              { autoAlpha: 0, y: 16 },
              { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
              at
            );

          /* counters start empty so they don't flash the final value */
          ["dash-revenue", "dash-occupancy", "dash-bookings"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = "0";
          });

          /* hint fades the moment we start */
          tl.to(".hero-hint", { autoAlpha: 0, duration: 0.3 }, 0.2);

          /* 1 · skeleton/frame in (0–10%) — the panel is the visible frame at
             rest; the three region skeletons show, then fade as content lands */
          tl.from(
            "#dash-panel",
            { scale: 0.96, y: 18, duration: 0.8, ease: "power2.out" },
            0
          );
          tl.set(
            ["[data-skeleton='kpi']", "[data-skeleton='cal']", "[data-skeleton='chart']"],
            { autoAlpha: 1 },
            0
          );
          tl.to("[data-skeleton='cal']", { autoAlpha: 0, duration: 0.4 }, 1.0);
          tl.to("[data-skeleton='kpi']", { autoAlpha: 0, duration: 0.4 }, 5.0);
          tl.to("[data-skeleton='chart']", { autoAlpha: 0, duration: 0.4 }, 7.0);

          /* 2 · calendar fills (10–30%) */
          capOut(1, 1.0);
          capIn(2, 1.15);
          tl.from(
            "[data-appt]",
            {
              autoAlpha: 0,
              y: -14,
              scale: 0.92,
              stagger: 0.2,
              duration: 0.5,
              ease: "back.out(1.6)",
            },
            1.2
          );

          /* 3 · notification toasts (30–50%) */
          capOut(2, 2.9);
          capIn(3, 3.05);
          tl.fromTo(
            "[data-toast]",
            { autoAlpha: 0, x: -28, scale: 0.9 },
            {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              stagger: 0.4,
              duration: 0.4,
              ease: "back.out(1.7)",
            },
            3.1
          );
          tl.to(
            "[data-toast]",
            { autoAlpha: 0, x: -16, duration: 0.35, stagger: 0.08 },
            4.9
          );

          /* 4 · KPI cards + counters (50–70%) */
          capOut(3, 4.9);
          capIn(4, 5.05);
          tl.from(
            "[data-kpi]",
            { autoAlpha: 0, y: 18, stagger: 0.14, duration: 0.45 },
            5.1
          );
          countUp("dash-revenue", KPI.revenue, 5.25, 1.1);
          countUp("dash-occupancy", KPI.occupancy, 5.35, 1.0);
          countUp("dash-bookings", KPI.bookings, 5.45, 1.0);

          /* 5 · weekly chart draws itself (70–90%) */
          capOut(4, 6.9);
          capIn(5, 7.05);
          tl.from("#chart-area", { autoAlpha: 0, duration: 0.5 }, 7.1);
          tl.fromTo(
            "#chart-line",
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.3, ease: "none" },
            7.1
          );
          tl.from(
            "[data-chart-bar]",
            {
              scaleY: 0,
              transformOrigin: "center bottom",
              stagger: 0.07,
              duration: 0.4,
            },
            7.3
          );
          tl.from(
            "[data-chart-dot]",
            {
              scale: 0,
              transformOrigin: "center",
              stagger: 0.07,
              duration: 0.3,
              ease: "back.out(2)",
            },
            8.0
          );

          /* 6 · live dashboard + cursor + CTA (90–100%) */
          capOut(5, 8.9);
          capIn(6, 9.05);
          tl.fromTo(
            "#dash-cursor",
            { autoAlpha: 0, x: 60, y: -50 },
            { autoAlpha: 1, x: 0, y: 0, duration: 0.6, ease: "power2.out" },
            9.0
          );
          tl.to(
            "#dash-cursor",
            { x: -36, y: 28, duration: 0.8, ease: "power1.inOut" },
            9.7
          );
          tl.fromTo(
            "#hero-cta",
            { scale: 1 },
            { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 },
            9.3
          );
          tl.to("#dash-panel", { "--glow": 1, duration: 0.6 }, 9.2);
          tl.to({}, { duration: 0.6 }, 9.8); // finale breathing room
        }
      );

      /* ---------------- mobile: one-time entrance (no pin) ---------------- */
      mm.add(
        "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
        () => {
          const once = gsap.timeline({
            scrollTrigger: { trigger: stage, start: "top 70%", once: true },
          });
          once.fromTo(
            "[data-toast]",
            { autoAlpha: 0, x: -20, scale: 0.9 },
            { autoAlpha: 1, x: 0, scale: 1, stagger: 0.25, duration: 0.4 },
            0
          );
          const countUp = (id: string, to: number) => {
            const el = document.getElementById(id);
            if (!el) return;
            const p = { v: 0 };
            once.to(
              p,
              {
                v: to,
                duration: 1.2,
                ease: "power1.out",
                snap: { v: 1 },
                onUpdate: () => (el.textContent = fmtInt(p.v)),
              },
              0.3
            );
          };
          countUp("dash-revenue", KPI.revenue);
          countUp("dash-occupancy", KPI.occupancy);
          countUp("dash-bookings", KPI.bookings);
          once.fromTo(
            "#chart-line",
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.4, ease: "none" },
            0.4
          );
        }
      );
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={stageRef}
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-white to-canvas"
    >
      {/* soft indigo glow backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 start-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-indigo/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col justify-center gap-10 px-5 py-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-0">
        {/* ---- caption column (RTL start = right) ---- */}
        <div className="relative z-10 order-2 lg:order-1">
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-wash px-3.5 py-1.5 text-sm font-semibold text-indigo-deep ring-1 ring-indigo/15">
            <Sparkles width={16} height={16} />
            מערכת SaaS לניהול תורים
          </p>

          <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl">
            כל התורים של העסק שלך,
            <br />
            <span className="text-indigo">במקום אחד.</span>
          </h1>

          {/* 6-beat narration — crossfades on desktop scrub; on mobile /
              reduced-motion it simply shows beat 1 as a static subhead. */}
          <div className="relative mt-5 min-h-[7.5rem] sm:min-h-[6.5rem]">
            {CAPTIONS.map((c, i) => (
              <div
                key={i}
                data-cap={i + 1}
                className={`absolute inset-0 ${
                  i === 0 ? "opacity-100" : "invisible opacity-0"
                }`}
              >
                <p className="font-heading text-xl font-bold text-ink sm:text-2xl">
                  {c.t}
                </p>
                <p className="mt-1.5 max-w-md text-base leading-relaxed text-ink-soft">
                  {c.s}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              id="hero-cta"
              type="button"
              onClick={() => scrollToId("trial", { focus: true })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo px-7 py-3.5 font-heading text-base font-bold text-white shadow-lg shadow-indigo/30 transition hover:bg-indigo-deep"
            >
              התחילו ניסיון חינם
              <ArrowLeft width={18} height={18} />
            </button>
            <button
              type="button"
              data-demo-open
              onClick={openDemo}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-heading text-base font-bold text-indigo-deep shadow-sm ring-1 ring-indigo/25 transition hover:bg-indigo-wash hover:ring-indigo/40"
            >
              <Play width={18} height={18} />
              נסו את המערכת
            </button>
            <button
              type="button"
              onClick={() => scrollToId("how", { focus: true })}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3.5 font-heading text-base font-semibold text-ink-soft transition hover:text-ink"
            >
              איך זה עובד?
            </button>
          </div>

          <p className="mt-5 text-sm text-ink-faint">
            בלי כרטיס אשראי · הקמה בפחות מ-15 דקות
          </p>
        </div>

        {/* ---- dashboard column (RTL end = left) ---- */}
        <div className="relative order-1 mx-auto w-full max-w-xl lg:order-2 lg:mx-0">
          <div className="live-glow rounded-2xl">
            <DashboardMock />
          </div>

          {/* notification toasts (decorative) */}
          <div
            className="pointer-events-none absolute -top-3 start-0 z-20 flex w-64 flex-col gap-2 sm:-start-6"
            aria-hidden="true"
          >
            {TOASTS.map((toast) => {
              const Icon = TOAST_ICON[toast.icon];
              return (
                <div
                  key={toast.text}
                  data-toast
                  className="invisible flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 opacity-0 shadow-xl shadow-ink/10 ring-1 ring-line"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success-wash text-success-deep">
                    <Icon width={16} height={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-ink">
                      {toast.text}
                    </p>
                    <p className="truncate text-[11px] text-ink-soft">
                      {toast.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* mock cursor (decorative) */}
          <svg
            id="dash-cursor"
            className="invisible absolute bottom-16 start-12 z-30 opacity-0 drop-shadow-lg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M5 3l14 7-6 2-2 6-6-15z"
              fill="#fff"
              stroke="#0b1220"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* scroll hint */}
      <div className="hero-hint pointer-events-none absolute bottom-5 start-1/2 z-10 -translate-x-1/2 text-ink-faint">
        <svg
          className="scroll-hint"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
