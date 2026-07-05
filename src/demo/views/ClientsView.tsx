import { useMemo, useState } from "react";
import { useDemo } from "../apiContext";
import {
  SEED_CLIENTS,
  serviceById,
  slotToTime,
  initials,
  dateLabel,
  type Accent,
} from "../demoData";
import { Search, Plus, ChevronDown, User } from "../../components/icons";

const CYCLE: Accent[] = ["indigo", "success", "amber", "rose", "sky"];
const BG: Record<Accent, string> = {
  indigo: "bg-indigo",
  success: "bg-success",
  amber: "bg-amber",
  rose: "bg-rose",
  sky: "bg-indigo-mid",
};

export default function ClientsView() {
  const { state, openAdd, openAppt } = useDemo();
  const [q, setQ] = useState("");
  const [openName, setOpenName] = useState<string | null>(null);

  // roster = seed clients ∪ any client created during the demo
  const roster = useMemo(() => {
    const names = new Set(SEED_CLIENTS.map((c) => c.name));
    const extra = state.appointments
      .map((a) => a.clientName)
      .filter((n) => !names.has(n));
    const uniqueExtra = Array.from(new Set(extra)).map((name) => ({
      name,
      phone: "—",
      visits: 1,
    }));
    return [...uniqueExtra, ...SEED_CLIENTS];
  }, [state.appointments]);

  const filtered = useMemo(
    () => roster.filter((c) => c.name.includes(q.trim())),
    [roster, q]
  );

  const apptsFor = (name: string) =>
    state.appointments
      .filter((a) => a.clientName === name)
      .sort((x, y) => x.day - y.day || x.slot - y.slot);

  return (
    <section aria-label="לקוחות" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">לקוחות</h2>
          <p className="text-[13px] text-slate-400">{roster.length} לקוחות רשומים</p>
        </div>
      </div>

      {/* search */}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-500">
          <Search width={16} height={16} />
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש לקוח/ה לפי שם…"
          aria-label="חיפוש לקוח"
          className="w-full rounded-xl border border-panel-line/60 bg-panel-soft/50 py-2.5 pe-3 ps-9 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo focus:ring-2 focus:ring-indigo/25"
        />
      </div>

      <ul className="space-y-2">
        {filtered.length === 0 && (
          <li className="rounded-xl bg-panel-soft/40 px-4 py-6 text-center text-sm text-slate-400 ring-1 ring-panel-line/40">
            לא נמצאו לקוחות בשם "{q}".
          </li>
        )}
        {filtered.map((c, i) => {
          const accent = CYCLE[i % CYCLE.length];
          const isOpen = openName === c.name;
          const appts = isOpen ? apptsFor(c.name) : [];
          return (
            <li
              key={c.name}
              className="overflow-hidden rounded-xl bg-panel-soft/40 ring-1 ring-panel-line/40"
            >
              <button
                type="button"
                onClick={() => setOpenName(isOpen ? null : c.name)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-panel-soft/70"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[13px] font-bold text-white ${BG[accent]}`}
                >
                  {initials(c.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {c.name}
                  </span>
                  <span className="block truncate text-[12px] text-slate-400" dir="ltr">
                    {c.phone}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-indigo/15 px-2.5 py-1 text-[11px] font-semibold text-indigo-200 nums">
                  {c.visits} ביקורים
                </span>
                <ChevronDown
                  width={16}
                  height={16}
                  className={`shrink-0 text-slate-500 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-panel-line/40 px-3 py-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
                    <User width={13} height={13} /> תורים במערכת
                  </p>
                  {appts.length === 0 ? (
                    <p className="text-[13px] text-slate-400">
                      אין תורים פעילים ל{c.name}.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {appts.map((a) => {
                        const s = serviceById(a.serviceId);
                        return (
                          <li key={a.id}>
                            <button
                              type="button"
                              onClick={() => openAppt(a.id)}
                              className="flex w-full items-center justify-between gap-2 rounded-lg bg-panel/60 px-3 py-2 text-start ring-1 ring-panel-line/40 transition hover:ring-indigo/40"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-[13px] font-medium text-white">
                                  {s.name}
                                </span>
                                <span className="block text-[11px] text-slate-400">
                                  {dateLabel(a.day)}
                                </span>
                              </span>
                              <span className="shrink-0 text-[12px] font-semibold text-slate-200 nums">
                                {slotToTime(a.slot)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={() => openAdd({ clientName: c.name })}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo/15 px-3 py-2 text-[13px] font-semibold text-indigo-200 transition hover:bg-indigo/25"
                  >
                    <Plus width={15} height={15} /> קביעת תור ל{c.name}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
