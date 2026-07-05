import { useCallback, useEffect, useReducer } from "react";
import {
  makeSeed,
  STATE_VERSION,
  type Appt,
  type DemoState,
  type Reminder,
} from "./demoData";

/**
 * In-memory demo state (useReducer) mirrored to localStorage under
 * `tori-demo-state`. Pure + framework-agnostic reducer; the DemoApp layer wraps
 * these low-level actions with toasts / reminder-arming business logic.
 */

export const STORAGE_KEY = "tori-demo-state";

export type DemoAction =
  | { type: "add"; appt: Appt; reminder?: Reminder }
  | { type: "toggleArrived"; id: string }
  | { type: "cancel"; id: string }
  | { type: "sendReminder"; id: string }
  | { type: "toggleAuto" }
  | { type: "reset" };

export function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "add": {
      return {
        ...state,
        appointments: [...state.appointments, action.appt],
        reminders: action.reminder
          ? [action.reminder, ...state.reminders]
          : state.reminders,
      };
    }
    case "toggleArrived": {
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.id
            ? { ...a, status: a.status === "arrived" ? "booked" : "arrived" }
            : a
        ),
      };
    }
    case "cancel": {
      const gone = state.appointments.find((a) => a.id === action.id);
      return {
        ...state,
        appointments: state.appointments.filter((a) => a.id !== action.id),
        // reflect only *today's* cancellations in the live reports counter
        cancelledToday:
          gone && gone.day === 0
            ? state.cancelledToday + 1
            : state.cancelledToday,
      };
    }
    case "sendReminder": {
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.id
            ? { ...r, status: "sent", when: "עכשיו" }
            : r
        ),
      };
    }
    case "toggleAuto":
      return { ...state, autoReminders: !state.autoReminders };
    case "reset":
      return makeSeed();
    default:
      return state;
  }
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeSeed();
    const parsed = JSON.parse(raw) as DemoState;
    if (
      !parsed ||
      parsed.v !== STATE_VERSION ||
      !Array.isArray(parsed.appointments) ||
      !Array.isArray(parsed.reminders)
    ) {
      return makeSeed();
    }
    return {
      v: STATE_VERSION,
      appointments: parsed.appointments,
      reminders: parsed.reminders,
      autoReminders: parsed.autoReminders ?? true,
      cancelledToday: parsed.cancelledToday ?? 0,
    };
  } catch {
    return makeSeed();
  }
}

export function useDemoState() {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private-mode / quota — demo still works in-memory */
    }
  }, [state]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    dispatch({ type: "reset" });
  }, []);

  return { state, dispatch, reset };
}
