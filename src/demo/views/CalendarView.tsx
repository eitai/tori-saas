import { useMemo } from "react";
import { useDemo, coveredSlots } from "../apiContext";
import {
  SLOT_COUNT,
  slotToTime,
  span,
  serviceById,
  initials,
  dateLabel,
  DAY_TABS,
  type Accent,
  type Appt,
} from "../demoData";
import { Plus, Check, Clock } from "../../components/icons";

const ROW_H = 46; // px per 30-min slot

const ACCENT: Record<Accent, { border: string; bg: string }> = {
  indigo: { border: "border-indigo", bg: "bg-indigo" },
  success: { border: "border-success", bg: "bg-success" },
  amber: { border: "border-amber", bg: "bg-amber" },
  rose: { border: "border-rose", bg: "bg-rose" },
  sky: { border: "border-indigo-mid", bg: "bg-indigo-mid" },
};

function ApptCard({
  appt,
  compact,
  onClick,
}: {
  appt: Appt;
  compact: boolean;
  onClick: () => void;
}) {
  const service = serviceById(appt.serviceId);
  const c = ACCENT[service.accent];
  const arrived = appt.status === "arrived";
  return (
    <button
      type="button"
      data-demo-appt
      onClick={onClick}
      className={`flex h-full w-full items-center gap-2.5 rounded-lg border-r-[3px] px-2.5 text-start ring-1 transition hover:brightness-110 ${
        c.border
      } ${
        arrived
          ? "bg-success/15 ring-success/40"
          : "bg-panel/80 ring-panel-line/50"
      } ${compact ? "py-1.5" : "py-2"}`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white ${c.bg}`}
      >
        {initials(appt.clientName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold text-white">
            {appt.clientName}
          </span>
          {arrived && (
            <Check width={13} height={13} className="shrink-0 text-success" />
          )}
        </span>
        <span className="block truncate text-[11px] text-slate-400">
          {service.name}
        </span>
      </span>
      <span className="shrink-0 text-end">
        <span className="block text-[12px] font-semibold text-slate-200 nums">
          {slotToTime(appt.slot)}
        </span>
        <span className="block text-[10px] text-slate-500">
          {service.dur} ד׳
        </span>
      </span>
    </button>
  );
}

export default function CalendarView() {
  const { state, day, setDay, openAdd, openAppt } = useDemo();

  const dayAppts = useMemo(
    () =>
      state.appointments
        .filter((a) => a.day === day)
        .sort((x, y) => x.slot - y.slot),
    [state.appointments, day]
  );
  const covered = useMemo(
    () => coveredSlots(state.appointments, day),
    [state.appointments, day]
  );
  const startMap = useMemo(() => {
    const m = new Map<number, Appt>();
    for (const a of dayAppts) m.set(a.slot, a);
    return m;
  }, [dayAppts]);

  return (
    <section aria-label="יומן" className="space-y-4">
      {/* header: day switcher + add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div
            className="inline-flex rounded-xl bg-panel-soft/70 p-1 ring-1 ring-panel-line/50"
            role="tablist"
            aria-label="בחירת יום"
          >
            {DAY_TABS.map((t) => (
              <button
                key={t.day}
                type="button"
                role="tab"
                aria-selected={day === t.day}
                onClick={() => setDay(t.day)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                  day === t.day
                    ? "bg-indigo text-white shadow-sm shadow-indigo/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[13px] text-slate-400">
            {dateLabel(day)} · {dayAppts.length} תורים
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAdd({ day })}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo/25 transition hover:bg-indigo-deep"
        >
          <Plus width={18} height={18} />
          תור חדש
        </button>
      </div>

      {/* ---------- desktop: time grid ---------- */}
      <div className="hidden rounded-xl bg-panel-soft/30 p-2 ring-1 ring-panel-line/40 sm:block">
        <div
          className="relative"
          style={{ height: SLOT_COUNT * ROW_H }}
          aria-label={`יומן ${dateLabel(day)}`}
        >
          {Array.from({ length: SLOT_COUNT }, (_, i) => {
            const isCovered = covered.has(i);
            const isStart = startMap.has(i);
            const showLabel = i % 2 === 0;
            return (
              <div
                key={i}
                className="absolute inset-x-0 flex"
                style={{ top: i * ROW_H, height: ROW_H }}
              >
                <div className="w-14 shrink-0 border-t border-panel-line/40 pt-0.5 text-[10px] text-slate-500 nums">
                  {showLabel ? slotToTime(i) : ""}
                </div>
                <div className="relative flex-1 border-t border-panel-line/30">
                  {!isCovered && !isStart && (
                    <button
                      type="button"
                      onClick={() => openAdd({ day, slot: i })}
                      aria-label={`הוספת תור בשעה ${slotToTime(i)}`}
                      className="group absolute inset-x-0 inset-y-0.5 flex items-center justify-center rounded-lg text-slate-600 transition hover:bg-indigo/10 hover:text-indigo-200 focus-visible:bg-indigo/10"
                    >
                      <span className="flex items-center gap-1 text-[11px] font-medium opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Plus width={13} height={13} /> הוסף
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* appointment cards overlay */}
          {dayAppts.map((a) => {
            const spanN = span(serviceById(a.serviceId).dur);
            return (
              <div
                key={a.id}
                className="absolute start-14 end-2 px-1"
                style={{ top: a.slot * ROW_H + 2, height: spanN * ROW_H - 4 }}
              >
                <ApptCard
                  appt={a}
                  compact={spanN === 1}
                  onClick={() => openAppt(a.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- mobile: vertical day list ---------- */}
      <div className="space-y-2.5 sm:hidden">
        {dayAppts.length === 0 && (
          <p className="rounded-xl bg-panel-soft/40 px-4 py-6 text-center text-sm text-slate-400 ring-1 ring-panel-line/40">
            אין תורים ל{dateLabel(day)}. הוסיפו את הראשון.
          </p>
        )}
        {dayAppts.map((a) => (
          <div key={a.id} className="h-16">
            <ApptCard appt={a} compact={false} onClick={() => openAppt(a.id)} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => openAdd({ day })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-panel-line/70 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-indigo/60 hover:text-white"
        >
          <Plus width={18} height={18} /> הוספת תור חדש
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Clock width={12} height={12} />
        לחצו על משבצת ריקה כדי להוסיף תור, או על תור קיים כדי לסמן הגעה / לבטל.
      </p>
    </section>
  );
}
