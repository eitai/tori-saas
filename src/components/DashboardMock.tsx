import {
  APPOINTMENTS,
  KPI,
  WEEK_LABELS,
  WEEK_REVENUE,
  type Accent,
} from "../data/demo";
import { Calendar, Bell, BarChart, Users, Settings } from "./icons";

/**
 * The mock תורי dashboard — 100% coded DOM + SVG, no images, no video.
 * Rendered fully-assembled by default (so reduced-motion / mobile / no-JS all
 * get a complete, correct product screenshot). The hero scrub timeline targets
 * the stable ids / [data-*] hooks below to *assemble* it on scroll.
 *
 * Targets: #dash-panel · [data-appt] · [data-kpi] · #dash-revenue /
 * #dash-occupancy / #dash-bookings · #chart-area · #chart-line ·
 * [data-chart-dot] · [data-chart-bar].
 */

const ACCENT: Record<Accent, { border: string; avatar: string }> = {
  indigo: { border: "border-indigo", avatar: "bg-indigo" },
  success: { border: "border-success", avatar: "bg-success" },
  amber: { border: "border-amber", avatar: "bg-amber" },
  rose: { border: "border-rose", avatar: "bg-rose" },
  sky: { border: "border-indigo-mid", avatar: "bg-indigo-mid" },
};

/* ---- weekly-revenue chart geometry (viewBox 300×130) ---- */
const VW = 300;
const P = { l: 14, r: 14, t: 12, b: 26 };
const MAX = 1800;
const cx = (i: number) => P.l + (i * (VW - P.l - P.r)) / (WEEK_LABELS.length - 1);
const cy = (v: number) => 130 - P.b - (v / MAX) * (130 - P.t - P.b);
const PTS = WEEK_REVENUE.map((v, i) => [cx(i), cy(v)] as const);
const LINE = "M" + PTS.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L");
const AREA =
  `M${cx(0).toFixed(1)},${(130 - P.b).toFixed(1)} ` +
  PTS.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
  ` L${cx(WEEK_LABELS.length - 1).toFixed(1)},${(130 - P.b).toFixed(1)} Z`;

const NAV = [
  { icon: Calendar, label: "יומן", active: true },
  { icon: Users, label: "לקוחות", active: false },
  { icon: Bell, label: "תזכורות", active: false },
  { icon: BarChart, label: "אנליטיקס", active: false },
  { icon: Settings, label: "הגדרות", active: false },
];

export default function DashboardMock({ className = "" }: { className?: string }) {
  return (
    <div
      id="dash-panel"
      dir="rtl"
      className={`w-full origin-center overflow-hidden rounded-2xl bg-panel text-white shadow-2xl ring-1 ring-panel-line/50 ${className}`}
    >
      {/* ---- window chrome ---- */}
      <div className="flex items-center gap-1.5 border-b border-panel-line/50 bg-panel-soft/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
        <span className="mx-auto flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-success" />
          app.tori.co.il/dashboard
        </span>
      </div>

      {/* ---- app header ---- */}
      <div className="flex items-center justify-between border-b border-panel-line/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo font-heading text-sm font-extrabold">
            ת
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">מספרת דניאל</p>
            <p className="text-[11px] text-slate-400">יום ראשון · 6 ביולי</p>
          </div>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-panel-soft text-xs font-bold ring-1 ring-panel-line/60">
          ד
        </span>
      </div>

      {/* ---- body: sidebar + main ---- */}
      <div className="flex gap-3 p-3 sm:p-4">
        {/* sidebar */}
        <nav className="hidden w-36 shrink-0 flex-col gap-1 sm:flex" aria-hidden="true">
          {NAV.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium ${
                active
                  ? "bg-indigo/20 text-white ring-1 ring-indigo/40"
                  : "text-slate-400"
              }`}
            >
              <Icon width={16} height={16} />
              {label}
            </span>
          ))}
          <div className="mt-auto rounded-lg bg-gradient-to-br from-indigo/25 to-indigo-mid/10 p-3 ring-1 ring-indigo/25">
            <p className="text-[11px] font-semibold text-white">חבילת סטודיו</p>
            <p className="mt-0.5 text-[10px] text-slate-400">2 אנשי צוות פעילים</p>
          </div>
        </nav>

        {/* main */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* KPI row */}
          <div className="relative grid grid-cols-3 gap-2.5">
            {/* skeleton (shown only during the scrub's stage-1 rest state) */}
            <div
              data-skeleton="kpi"
              className="pointer-events-none invisible absolute inset-0 grid grid-cols-3 gap-2.5 opacity-0"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-panel-line/40 ring-1 ring-panel-line/40"
                />
              ))}
            </div>
            {[
              { id: "dash-revenue", label: "הכנסות השבוע", value: "8,450", prefix: "₪", suffix: "", delta: "+12%" },
              { id: "dash-occupancy", label: "תפוסה", value: "87", prefix: "", suffix: "%", delta: "+5%" },
              { id: "dash-bookings", label: "תורים השבוע", value: "42", prefix: "", suffix: "", delta: "+8" },
            ].map((k) => (
              <div
                key={k.id}
                data-kpi
                className="rounded-xl bg-panel-soft/70 px-3 py-2.5 ring-1 ring-panel-line/50"
              >
                <p className="text-[11px] text-slate-400">{k.label}</p>
                <p className="mt-1 font-heading text-lg font-extrabold leading-none nums">
                  {k.prefix}
                  <span id={k.id}>{k.value}</span>
                  {k.suffix}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-success">
                  {k.delta} ↑
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-5">
            {/* calendar / agenda */}
            <div className="rounded-xl bg-panel-soft/40 p-3 ring-1 ring-panel-line/40 lg:col-span-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-bold">היומן שלי · היום</p>
                <span className="rounded-md bg-indigo/15 px-2 py-0.5 text-[10px] font-medium text-indigo-200">
                  5 תורים
                </span>
              </div>
              <ul className="relative space-y-2">
                {/* skeleton rows (scrub rest state) */}
                <li
                  data-skeleton="cal"
                  className="pointer-events-none invisible absolute inset-0 space-y-2 opacity-0"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-[3.1rem] animate-pulse rounded-lg bg-panel-line/30 ring-1 ring-panel-line/30"
                    />
                  ))}
                </li>
                {APPOINTMENTS.map((a) => {
                  const c = ACCENT[a.accent];
                  return (
                    <li
                      key={a.time + a.name}
                      data-appt
                      className={`flex items-center gap-2.5 rounded-lg border-r-[3px] bg-panel/70 px-2.5 py-2 ring-1 ring-panel-line/40 ${c.border}`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white ${c.avatar}`}
                      >
                        {a.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">{a.name}</p>
                        <p className="truncate text-[11px] text-slate-400">
                          {a.service}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-[12px] font-semibold text-slate-200 nums">
                          {a.time}
                        </p>
                        <p className="text-[10px] text-slate-500">{a.duration}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* weekly chart */}
            <div className="relative rounded-xl bg-panel-soft/40 p-3 ring-1 ring-panel-line/40 lg:col-span-2">
              <div
                data-skeleton="chart"
                className="pointer-events-none invisible absolute inset-x-3 bottom-3 top-9 grid animate-pulse place-items-center rounded-lg bg-panel-line/25 opacity-0"
              />
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[13px] font-bold">הכנסות לפי יום</p>
                <span className="text-[10px] text-slate-400">השבוע</span>
              </div>
              <svg viewBox="0 0 300 130" className="w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* gridlines */}
                {[0, 1, 2].map((i) => (
                  <line
                    key={i}
                    x1={P.l}
                    x2={VW - P.r}
                    y1={P.t + i * ((130 - P.t - P.b) / 2)}
                    y2={P.t + i * ((130 - P.t - P.b) / 2)}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                    opacity="0.5"
                  />
                ))}
                {/* secondary volume bars */}
                {PTS.map(([x, y], i) => (
                  <rect
                    key={i}
                    data-chart-bar
                    x={x - 5}
                    y={y}
                    width="10"
                    height={130 - P.b - y}
                    rx="2"
                    fill="#334155"
                    opacity="0.55"
                  />
                ))}
                {/* area + line */}
                <path id="chart-area" d={AREA} fill="url(#areaGrad)" />
                <path
                  id="chart-line"
                  d={LINE}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                />
                {/* dots */}
                {PTS.map(([x, y], i) => (
                  <circle
                    key={i}
                    data-chart-dot
                    cx={x}
                    cy={y}
                    r="3.2"
                    fill="#0f172a"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                ))}
                {/* day labels */}
                {WEEK_LABELS.map((d, i) => (
                  <text
                    key={d}
                    x={cx(i)}
                    y="124"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94a3b8"
                  >
                    {d}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Weekly-revenue total, exported so the KPI counter targets match the mock. */
export { KPI };
