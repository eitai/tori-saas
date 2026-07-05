import Modal from "./Modal";
import { useDemo } from "./apiContext";
import { Check, Trash, Clock, User } from "../components/icons";
import { serviceById, slotToTime, span, initials, dateLabel } from "./demoData";

const ACCENT_BG: Record<string, string> = {
  indigo: "bg-indigo",
  success: "bg-success",
  amber: "bg-amber",
  rose: "bg-rose",
  sky: "bg-indigo-mid",
};

export default function ApptModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { state, toggleArrived, cancelAppointment } = useDemo();
  const appt = state.appointments.find((a) => a.id === id);

  if (!appt) {
    // was cancelled elsewhere — close gracefully
    onClose();
    return null;
  }

  const service = serviceById(appt.serviceId);
  const spanN = span(service.dur);
  const arrived = appt.status === "arrived";

  return (
    <Modal title="פרטי התור" onClose={onClose} labelId="appt-title">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-base font-bold text-white ${
              ACCENT_BG[service.accent] ?? "bg-indigo"
            }`}
          >
            {initials(appt.clientName)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-bold text-ink">
              {appt.clientName}
            </p>
            <p className="truncate text-sm text-ink-soft">{service.name}</p>
          </div>
          <span
            className={`ms-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              arrived
                ? "bg-success-wash text-success-deep"
                : "bg-indigo-wash text-indigo-deep"
            }`}
          >
            {arrived ? "הגיע/ה ✓" : "מתוכנן"}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-canvas px-3 py-2.5 ring-1 ring-line">
            <dt className="flex items-center gap-1.5 text-[11px] text-ink-soft">
              <Clock width={13} height={13} /> שעה
            </dt>
            <dd className="mt-0.5 font-semibold text-ink nums">
              {slotToTime(appt.slot)} – {slotToTime(appt.slot + spanN)}
            </dd>
          </div>
          <div className="rounded-xl bg-canvas px-3 py-2.5 ring-1 ring-line">
            <dt className="flex items-center gap-1.5 text-[11px] text-ink-soft">
              <User width={13} height={13} /> יום
            </dt>
            <dd className="mt-0.5 font-semibold text-ink">
              {dateLabel(appt.day)}
            </dd>
          </div>
          <div className="col-span-2 rounded-xl bg-canvas px-3 py-2.5 ring-1 ring-line">
            <dt className="text-[11px] text-ink-soft">מחיר · משך</dt>
            <dd className="mt-0.5 font-semibold text-ink nums">
              ₪{service.price} · {service.dur} דקות
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              toggleArrived(appt.id);
              if (!arrived) onClose();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-heading font-bold transition ${
              arrived
                ? "bg-canvas text-ink-soft ring-1 ring-line hover:text-ink"
                : "bg-success text-white shadow-md shadow-success/25 hover:bg-success-deep"
            }`}
          >
            <Check width={18} height={18} />
            {arrived ? "בטל/י הגעה" : "סימון הגעה"}
          </button>
          <button
            type="button"
            onClick={() => {
              cancelAppointment(appt.id);
              onClose();
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose/10 px-4 py-3 font-heading font-bold text-rose transition hover:bg-rose/15"
          >
            <Trash width={18} height={18} />
            ביטול תור
          </button>
        </div>
      </div>
    </Modal>
  );
}
