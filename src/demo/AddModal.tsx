import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { useDemo, freeStarts, type AddPrefill } from "./apiContext";
import {
  SERVICES,
  serviceById,
  slotToTime,
  span,
  DAY_TABS,
  dateLabel,
} from "./demoData";

export default function AddModal({
  prefill,
  onClose,
}: {
  prefill: AddPrefill;
  onClose: () => void;
}) {
  const { state, day: viewDay, addAppointment } = useDemo();

  const [day, setDay] = useState<number>(prefill.day ?? viewDay);
  const [serviceId, setServiceId] = useState<string>(SERVICES[0].id);
  const [clientName, setClientName] = useState<string>(prefill.clientName ?? "");
  const [nameErr, setNameErr] = useState(false);

  const service = serviceById(serviceId);
  const spanN = span(service.dur);

  // available start slots for the chosen service span, including the prefilled slot
  const options = useMemo(() => {
    const free = freeStarts(state.appointments, day, spanN);
    if (
      prefill.slot != null &&
      day === (prefill.day ?? viewDay) &&
      !free.includes(prefill.slot) &&
      prefill.slot + spanN <= 20
    ) {
      // the prefilled slot is empty for a 30-min service; include it if it fits
      free.push(prefill.slot);
      free.sort((x, y) => x - y);
    }
    return free;
  }, [state.appointments, day, spanN, prefill.slot, prefill.day, viewDay]);

  const [slot, setSlot] = useState<number>(
    prefill.slot ?? options[0] ?? 0
  );

  // keep the chosen slot valid when service/day changes
  useEffect(() => {
    if (!options.includes(slot)) setSlot(options[0] ?? -1);
  }, [options]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName.trim().length < 2) {
      setNameErr(true);
      return;
    }
    if (slot < 0) return;
    addAppointment({ day, slot, clientName: clientName.trim(), serviceId });
    onClose();
  };

  const inputBase =
    "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-ink outline-none transition focus:border-indigo focus:ring-2 focus:ring-indigo/20";

  return (
    <Modal title="תור חדש" onClose={onClose} labelId="add-appt-title">
      <form onSubmit={submit} noValidate className="space-y-4">
        {/* day segmented control */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">יום</span>
          <div className="grid grid-cols-2 gap-2">
            {DAY_TABS.map((t) => (
              <button
                key={t.day}
                type="button"
                onClick={() => setDay(t.day)}
                aria-pressed={day === t.day}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  day === t.day
                    ? "bg-indigo text-white shadow-sm shadow-indigo/30"
                    : "bg-canvas text-ink-soft ring-1 ring-line hover:text-ink"
                }`}
              >
                {t.label}
                <span className="mr-1 text-[11px] font-normal opacity-70">
                  · {dateLabel(t.day).replace("יום ", "")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* client name */}
        <div>
          <label
            htmlFor="add-name"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            שם הלקוח/ה
          </label>
          <input
            id="add-name"
            type="text"
            autoComplete="off"
            placeholder="למשל: רותם כהן"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              if (nameErr) setNameErr(false);
            }}
            aria-invalid={nameErr}
            aria-describedby={nameErr ? "add-name-err" : undefined}
            className={`${inputBase} ${
              nameErr ? "border-rose/60 ring-2 ring-rose/10" : ""
            }`}
          />
          {nameErr && (
            <p id="add-name-err" className="mt-1.5 text-sm text-rose">
              נא להזין שם לקוח/ה
            </p>
          )}
        </div>

        {/* service */}
        <div>
          <label
            htmlFor="add-service"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            שירות
          </label>
          <select
            id="add-service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className={inputBase}
          >
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.dur} ד׳ · ₪{s.price}
              </option>
            ))}
          </select>
        </div>

        {/* time */}
        <div>
          <label
            htmlFor="add-time"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            שעה
          </label>
          {options.length > 0 ? (
            <select
              id="add-time"
              value={slot}
              onChange={(e) => setSlot(Number(e.target.value))}
              className={`${inputBase} nums`}
            >
              {options.map((sl) => (
                <option key={sl} value={sl}>
                  {slotToTime(sl)} – {slotToTime(sl + spanN)}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-sm text-ink-soft ring-1 ring-line">
              אין משבצת פנויה ל{service.name} ביום הזה. נסו שירות קצר יותר או יום
              אחר.
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={options.length === 0}
            className="flex-1 rounded-xl bg-indigo py-3 font-heading font-bold text-white shadow-md shadow-indigo/25 transition hover:bg-indigo-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            קביעת התור
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-3 font-semibold text-ink-soft transition hover:bg-canvas hover:text-ink"
          >
            ביטול
          </button>
        </div>
      </form>
    </Modal>
  );
}
