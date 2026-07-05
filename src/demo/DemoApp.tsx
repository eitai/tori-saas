import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DemoContext,
  type AddInput,
  type AddPrefill,
  type DemoApi,
} from "./apiContext";
import { useDemoState } from "./useDemoState";
import {
  BUSINESS_NAME,
  BUSINESS_INITIAL,
  serviceById,
  slotToTime,
  dateLabel,
  uid,
  type Appt,
  type Reminder,
} from "./demoData";
import ToastHost, { type ToastItem } from "./Toast";
import AddModal from "./AddModal";
import ApptModal from "./ApptModal";
import CalendarView from "./views/CalendarView";
import ClientsView from "./views/ClientsView";
import RemindersView from "./views/RemindersView";
import ReportsView from "./views/ReportsView";
import {
  Calendar,
  Users,
  Bell,
  BarChart,
  Close,
  RefreshCw,
  ArrowLeft,
} from "../components/icons";

type TabId = "calendar" | "clients" | "reminders" | "reports";

const NAV: { id: TabId; label: string; icon: typeof Calendar }[] = [
  { id: "calendar", label: "יומן", icon: Calendar },
  { id: "clients", label: "לקוחות", icon: Users },
  { id: "reminders", label: "תזכורות", icon: Bell },
  { id: "reports", label: "דוחות", icon: BarChart },
];

type Modal =
  | { kind: "add"; prefill: AddPrefill }
  | { kind: "appt"; id: string }
  | null;

export default function DemoApp({ onClose }: { onClose: () => void }) {
  const { state, dispatch, reset: resetState } = useDemoState();
  const [tab, setTab] = useState<TabId>("calendar");
  const [day, setDay] = useState(0);
  const [modal, setModal] = useState<Modal>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shellRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<Modal>(null);
  modalRef.current = modal;

  /* ---- toast helper ---- */
  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    setToasts((prev) => [...prev.slice(-2), { ...t, id: uid("toast") }]);
  }, []);
  const dropToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  /* ---- lock background scroll + pause Lenis while open ---- */
  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } })
      .__lenis;
    lenis?.stop();
    shellRef.current?.focus();
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      lenis?.start();
    };
  }, []);

  /* ---- Esc closes the demo when no modal is open ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !modalRef.current) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* ---- business actions (wrap reducer with toasts + reminder arming) ---- */
  const addAppointment = useCallback(
    (input: AddInput) => {
      const svc = serviceById(input.serviceId);
      const appt: Appt = {
        id: uid("appt"),
        day: input.day,
        slot: input.slot,
        clientName: input.clientName,
        serviceId: input.serviceId,
        status: "booked",
      };
      let reminder: Reminder | undefined;
      if (state.autoReminders) {
        reminder = {
          id: uid("rem"),
          channel: "whatsapp",
          clientName: input.clientName,
          timeLabel: `${dateLabel(input.day).replace("יום ", "")} · ${slotToTime(
            input.slot
          )}`,
          status: "sent",
          auto: true,
          when: "עכשיו",
          appointmentId: appt.id,
        };
        appt.reminderId = reminder.id;
      }
      dispatch({ type: "add", appt, reminder });
      setDay(input.day);
      toast({
        tone: "success",
        text: "התור נקבע ✓",
        sub: `${input.clientName} · ${svc.name} · ${slotToTime(input.slot)}`,
      });
      if (reminder) {
        toast({
          tone: "info",
          text: "תזכורת אוטומטית נשלחה",
          sub: `וואטסאפ · ${input.clientName}`,
        });
      }
    },
    [dispatch, state.autoReminders, toast]
  );

  const toggleArrived = useCallback(
    (id: string) => {
      const a = state.appointments.find((x) => x.id === id);
      const willArrive = a?.status !== "arrived";
      dispatch({ type: "toggleArrived", id });
      toast(
        willArrive
          ? { tone: "success", text: "סומן כהגיע/ה", sub: a?.clientName }
          : { tone: "info", text: "בוטל סימון ההגעה", sub: a?.clientName }
      );
    },
    [dispatch, state.appointments, toast]
  );

  const cancelAppointment = useCallback(
    (id: string) => {
      const a = state.appointments.find((x) => x.id === id);
      dispatch({ type: "cancel", id });
      toast({
        tone: "danger",
        text: "התור בוטל",
        sub: a ? `${a.clientName} · ${slotToTime(a.slot)}` : undefined,
      });
    },
    [dispatch, state.appointments, toast]
  );

  const sendReminder = useCallback(
    (id: string) => {
      dispatch({ type: "sendReminder", id });
      toast({ tone: "info", text: "התזכורת נשלחה" });
    },
    [dispatch, toast]
  );

  const toggleAuto = useCallback(() => {
    dispatch({ type: "toggleAuto" });
    toast({
      tone: "info",
      text: state.autoReminders
        ? "שליחה אוטומטית כבויה"
        : "שליחה אוטומטית פעילה",
    });
  }, [dispatch, state.autoReminders, toast]);

  const reset = useCallback(() => {
    resetState();
    setTab("calendar");
    setDay(0);
    setModal(null);
    toast({ tone: "info", text: "הדמו אופס לנתוני הדגמה" });
  }, [resetState, toast]);

  const openAdd = useCallback((prefill: AddPrefill = {}) => {
    setModal({ kind: "add", prefill });
  }, []);
  const openAppt = useCallback((id: string) => {
    setModal({ kind: "appt", id });
  }, []);
  const closeModal = useCallback(() => setModal(null), []);

  const api: DemoApi = useMemo(
    () => ({
      state,
      day,
      setDay,
      addAppointment,
      toggleArrived,
      cancelAppointment,
      sendReminder,
      toggleAuto,
      reset,
      openAdd,
      openAppt,
      toast,
    }),
    [
      state,
      day,
      addAppointment,
      toggleArrived,
      cancelAppointment,
      sendReminder,
      toggleAuto,
      reset,
      openAdd,
      openAppt,
      toast,
    ]
  );

  return (
    <DemoContext.Provider value={api}>
      <div
        ref={shellRef}
        tabIndex={-1}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={`דמו אינטראקטיבי — ${BUSINESS_NAME}`}
        className="demo-fade fixed inset-0 z-[100] flex flex-col bg-panel text-white outline-none"
      >
        {/* slim disclaimer banner */}
        <div className="flex shrink-0 items-center justify-center gap-2 bg-indigo/15 px-4 py-1.5 text-center text-[12px] font-medium text-indigo-200 ring-1 ring-inset ring-indigo/20">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-indigo-mid" />
          דמו אינטראקטיבי — הנתונים להדגמה בלבד
        </div>

        {/* app header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-panel-line/50 bg-panel-soft/40 px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo font-heading text-base font-extrabold text-white">
              {BUSINESS_INITIAL}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold">{BUSINESS_NAME}</p>
              <p className="truncate text-[11px] text-slate-400">
                {dateLabel(0)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              data-demo-reset
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg bg-panel-soft px-3 py-2 text-[13px] font-semibold text-slate-300 ring-1 ring-panel-line/60 transition hover:text-white"
            >
              <RefreshCw width={15} height={15} />
              <span className="hidden sm:inline">איפוס דמו</span>
            </button>
            <button
              type="button"
              data-demo-exit
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-ink shadow-md transition hover:bg-slate-100"
            >
              <ArrowLeft width={15} height={15} />
              <span className="hidden sm:inline">יציאה לאתר</span>
              <span className="sm:hidden">
                <Close width={15} height={15} />
              </span>
            </button>
          </div>
        </header>

        {/* mobile tab strip */}
        <nav
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-panel-line/50 px-2 py-2 lg:hidden"
          aria-label="ניווט דמו"
        >
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              data-demo-tab={n.id}
              onClick={() => setTab(n.id)}
              aria-current={tab === n.id}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                tab === n.id
                  ? "bg-indigo/20 text-white ring-1 ring-indigo/40"
                  : "text-slate-400"
              }`}
            >
              <n.icon width={16} height={16} />
              {n.label}
            </button>
          ))}
        </nav>

        {/* body */}
        <div className="flex min-h-0 flex-1">
          {/* desktop sidebar */}
          <nav
            className="hidden w-52 shrink-0 flex-col gap-1 border-l border-panel-line/50 p-3 lg:flex"
            aria-label="ניווט דמו"
          >
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                data-demo-tab={n.id}
                onClick={() => setTab(n.id)}
                aria-current={tab === n.id}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  tab === n.id
                    ? "bg-indigo/20 text-white ring-1 ring-indigo/40"
                    : "text-slate-400 hover:bg-panel-soft/60 hover:text-white"
                }`}
              >
                <n.icon width={18} height={18} />
                {n.label}
              </button>
            ))}
            <div className="mt-auto rounded-xl bg-gradient-to-br from-indigo/25 to-indigo-mid/10 p-3 ring-1 ring-indigo/25">
              <p className="text-[12px] font-semibold text-white">
                אהבתם את החוויה?
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                תורי הוא דמו של E&amp;M Studio. רוצים מערכת אמיתית?
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 text-[12px] font-bold text-indigo-200 hover:text-white"
              >
                חזרה לאתר ←
              </button>
            </div>
          </nav>

          {/* scroll region */}
          <main
            data-lenis-prevent
            className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5"
          >
            <div className="mx-auto max-w-4xl">
              {tab === "calendar" && <CalendarView />}
              {tab === "clients" && <ClientsView />}
              {tab === "reminders" && <RemindersView />}
              {tab === "reports" && <ReportsView />}
            </div>
          </main>
        </div>
      </div>

      {/* toasts + modals */}
      <ToastHost toasts={toasts} onDone={dropToast} />
      {modal?.kind === "add" && (
        <AddModal prefill={modal.prefill} onClose={closeModal} />
      )}
      {modal?.kind === "appt" && (
        <ApptModal id={modal.id} onClose={closeModal} />
      )}
    </DemoContext.Provider>
  );
}
