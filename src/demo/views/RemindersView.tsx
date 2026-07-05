import { useDemo } from "../apiContext";
import type { ReminderStatus } from "../demoData";
import {
  MessageCircle,
  Phone,
  Check,
  Send,
  Bell,
} from "../../components/icons";

const STATUS_META: Record<
  ReminderStatus,
  { label: string; cls: string }
> = {
  confirmed: { label: "אישר/ה הגעה", cls: "bg-success-wash text-success-deep" },
  read: { label: "נקרא", cls: "bg-indigo-wash text-indigo-deep" },
  delivered: { label: "נמסר", cls: "bg-indigo-wash text-indigo-deep" },
  sent: { label: "נשלח", cls: "bg-slate-200 text-slate-600" },
  pending: { label: "ממתין לשליחה", cls: "bg-amber/15 text-amber" },
  failed: { label: "נכשל", cls: "bg-rose/15 text-rose" },
};

export default function RemindersView() {
  const { state, toggleAuto, sendReminder } = useDemo();
  const auto = state.autoReminders;

  return (
    <section aria-label="תזכורות" className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-bold text-white">תזכורות</h2>
        <p className="text-[13px] text-slate-400">
          תזכורות יוצאות ב-SMS ובוואטסאפ לפני כל תור, עם בקשת אישור הגעה.
        </p>
      </div>

      {/* auto-send toggle */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-panel-soft/50 px-4 py-3 ring-1 ring-panel-line/50">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo/15 text-indigo-200">
            <Bell width={18} height={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">שליחה אוטומטית</p>
            <p className="text-[12px] text-slate-400">
              {auto
                ? "כל תור חדש מזוין בתזכורת אוטומטית"
                : "תזכורות נשלחות ידנית בלבד"}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={auto}
          aria-label="שליחה אוטומטית של תזכורות"
          onClick={toggleAuto}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            auto ? "bg-success" : "bg-panel-line"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
              auto ? "start-1" : "start-6"
            }`}
          />
        </button>
      </div>

      {/* feed */}
      <ul className="space-y-2">
        {state.reminders.map((r) => {
          const meta = STATUS_META[r.status];
          const Channel = r.channel === "whatsapp" ? MessageCircle : Phone;
          const canResend = r.status === "pending" || r.status === "failed";
          return (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl bg-panel-soft/40 px-3 py-2.5 ring-1 ring-panel-line/40"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                  r.channel === "whatsapp"
                    ? "bg-success/15 text-success"
                    : "bg-indigo/15 text-indigo-200"
                }`}
              >
                <Channel width={17} height={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {r.clientName}
                  </p>
                  {r.auto && (
                    <span className="shrink-0 rounded bg-indigo/15 px-1.5 py-0.5 text-[9px] font-bold text-indigo-200">
                      אוטומטי
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-slate-400 nums">
                  {r.timeLabel} · {r.when}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.cls}`}
                >
                  {r.status === "confirmed" && <Check width={11} height={11} />}
                  {meta.label}
                </span>
                {canResend && (
                  <button
                    type="button"
                    onClick={() => sendReminder(r.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-200 transition hover:text-white"
                  >
                    <Send width={12} height={12} /> שלח עכשיו
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
