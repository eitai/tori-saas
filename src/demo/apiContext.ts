import { createContext, useContext } from "react";
import type { DemoState } from "./demoData";
import type { ToastItem } from "./Toast";

export interface AddInput {
  day: number;
  slot: number;
  clientName: string;
  serviceId: string;
}

export interface AddPrefill {
  day?: number;
  slot?: number;
  clientName?: string;
}

/** Everything the demo views need — provided by DemoApp, consumed via useDemo(). */
export interface DemoApi {
  state: DemoState;
  day: number;
  setDay: (d: number) => void;
  addAppointment: (input: AddInput) => void;
  toggleArrived: (id: string) => void;
  cancelAppointment: (id: string) => void;
  sendReminder: (id: string) => void;
  toggleAuto: () => void;
  reset: () => void;
  openAdd: (prefill?: AddPrefill) => void;
  openAppt: (id: string) => void;
  toast: (t: Omit<ToastItem, "id">) => void;
}

export const DemoContext = createContext<DemoApi | null>(null);

export function useDemo(): DemoApi {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoApp");
  return ctx;
}

/* ---------------- calendar geometry helpers (pure) ---------------- */
import { SLOT_COUNT, span, serviceById, type Appt } from "./demoData";

/** slots occupied by any appointment on `day` (covers multi-slot services). */
export function coveredSlots(appts: Appt[], day: number): Set<number> {
  const set = new Set<number>();
  for (const a of appts) {
    if (a.day !== day) continue;
    const n = span(serviceById(a.serviceId).dur);
    for (let i = 0; i < n; i++) set.add(a.slot + i);
  }
  return set;
}

/** Can a service of `spanN` slots start at `slot` without overlap / overflow? */
export function fits(
  appts: Appt[],
  day: number,
  slot: number,
  spanN: number,
  ignoreId?: string
): boolean {
  if (slot < 0 || slot + spanN > SLOT_COUNT) return false;
  for (const a of appts) {
    if (a.day !== day || a.id === ignoreId) continue;
    const aStart = a.slot;
    const aEnd = a.slot + span(serviceById(a.serviceId).dur);
    if (slot < aEnd && aStart < slot + spanN) return false;
  }
  return true;
}

/** All valid start slots for a given service span on a day. */
export function freeStarts(appts: Appt[], day: number, spanN: number): number[] {
  const out: number[] = [];
  for (let i = 0; i + spanN <= SLOT_COUNT; i++) {
    if (fits(appts, day, i, spanN)) out.push(i);
  }
  return out;
}
