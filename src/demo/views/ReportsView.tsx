import { useMemo } from "react";
import { useDemo } from "../apiContext";
import { serviceById, OPEN_MIN, SLOT } from "../demoData";
import { Check, Trash, BarChart } from "../../components/icons";

const WORKING_MIN = 10 * 60; // 09:00–19:00 capacity
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

/* chart geometry (viewBox 300×130) — mirrors the landing mock's chart */
const VW = 300;
const VH = 130;
const P = { l: 16, r: 12, t: 12, b: 22 };

export default function ReportsView() {
  const { state } = useDemo();

  const stats = useMemo(() => {
    const today = state.appointments.filter((a) => a.day === 0);
    let revenue = 0;
    let bookedMin = 0;
    let arrived = 0;
    const byHour: Record<number, number> = {};
    const byService: Record<string, number> = {};
    for (const a of today) {
      const s = serviceById(a.serviceId);
      revenue += s.price;
      bookedMin += s.dur;
      if (a.status === "arrived") arrived += 1;
      const hour = Math.floor((OPEN_MIN + a.slot * SLOT) / 60);
      byHour[hour] = (byHour[hour] ?? 0) + 1;
      byService[a.serviceId] = (byService[a.serviceId] ?? 0) + 1;
    }
    const occupancy = Math.min(
      100,
      Math.round((bookedMin / WORKING_MIN) * 100)
    );
    const top = Object.entries(byService)
      .map(([id, n]) => ({ id, n }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 3);
    return {
      count: today.length,
      revenue,
      occupancy,
      arrived,
      byHour,
      top,
      total: today.length,
    };
  }, [state.appointments]);

  const maxHour = Math.max(1, ...HOURS.map((h) => stats.byHour[h] ?? 0));
  const barW = (VW - P.l - P.r) / HOURS.length;

  const KPIS = [
    { label: "תורים היום", value: String(stats.count), tone: "text-white" },
    {
      label: "הכנסה צפויה",
      value: `₪${stats.revenue.toLocaleString("en-US")}`,
      tone: "text-white",
    },
    { label: "תפוסה", value: `${stats.occupancy}%`, tone: "text-white" },
    {
      label: "הגיעו",
      value: `${stats.arrived}/${stats.total}`,
      tone: "text-success",
      icon: Check,
    },
  ];

  return (
    <section aria-label="דוחות" className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-bold text-white">דוחות</h2>
        <p className="text-[13px] text-slate-400">
          המספרים מתעדכנים לפי היומן — כל תור שנוסף או מבוטל משנה אותם בזמן אמת.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className="rounded-xl bg-panel-soft/70 px-3 py-3 ring-1 ring-panel-line/50"
          >
            <p className="text-[11px] text-slate-400">{k.label}</p>
            <p
              className={`mt-1 flex items-center gap-1 font-heading text-xl font-extrabold leading-none nums ${k.tone}`}
            >
              {k.icon && <k.icon width={16} height={16} />}
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {/* hourly bar chart */}
        <div className="rounded-xl bg-panel-soft/40 p-3 ring-1 ring-panel-line/40 lg:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-white">
              <BarChart width={15} height={15} /> תורים לפי שעה · היום
            </p>
            <span className="rounded-md bg-rose/15 px-2 py-0.5 text-[10px] font-medium text-rose">
              {stats.byHour && state.cancelledToday > 0
                ? `${state.cancelledToday} בוטלו`
                : "אין ביטולים"}
            </span>
          </div>
          <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <line
                key={i}
                x1={P.l}
                x2={VW - P.r}
                y1={P.t + i * ((VH - P.t - P.b) / 2)}
                y2={P.t + i * ((VH - P.t - P.b) / 2)}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="3 4"
                opacity="0.5"
              />
            ))}
            {HOURS.map((h, i) => {
              const n = stats.byHour[h] ?? 0;
              const barH = (n / maxHour) * (VH - P.t - P.b);
              const x = P.l + i * barW + barW * 0.18;
              const w = barW * 0.64;
              const y = VH - P.b - barH;
              return (
                <g key={h}>
                  {n > 0 && (
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={barH}
                      rx="2.5"
                      fill="#6366f1"
                      className="demo-bar"
                    />
                  )}
                  <text
                    x={P.l + i * barW + barW / 2}
                    y={VH - 7}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#94a3b8"
                  >
                    {h}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* top services (live share) */}
        <div className="rounded-xl bg-panel-soft/40 p-3 ring-1 ring-panel-line/40 lg:col-span-2">
          <p className="mb-2 text-[13px] font-bold text-white">שירותים מובילים</p>
          {stats.top.length === 0 ? (
            <p className="text-[12px] text-slate-400">אין תורים היום.</p>
          ) : (
            <div className="space-y-2.5">
              {stats.top.map((t) => {
                const s = serviceById(t.id);
                const pct = Math.round((t.n / stats.total) * 100);
                return (
                  <div key={t.id}>
                    <div className="mb-1 flex justify-between text-[12px]">
                      <span className="truncate text-slate-200">{s.name}</span>
                      <span className="shrink-0 font-semibold text-white nums">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-panel-line/50">
                      <div
                        className="h-full rounded-full bg-indigo transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-panel/50 px-3 py-2 text-[12px] text-slate-300 ring-1 ring-panel-line/40">
            <Trash width={13} height={13} className="text-rose" />
            <span className="nums">{state.cancelledToday}</span> תורים בוטלו היום
          </div>
        </div>
      </div>
    </section>
  );
}
