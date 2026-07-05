/**
 * Seed data + helpers for the INTERACTIVE demo of the fictional תורי product.
 * Persona: מספרת אור (a hair salon). Every client, appointment and reminder here
 * is fake, illustrative product data — never presented as real statistics.
 */

import type { Accent } from "../data/demo";
export type { Accent };

export const BUSINESS_NAME = "מספרת אור";
export const BUSINESS_INITIAL = "א";

/* ---------------- time model ---------------- */
export const OPEN_MIN = 9 * 60; // 09:00
export const SLOT = 30; // minutes per grid slot
export const SLOT_COUNT = 20; // 09:00 → 18:30 starts, salon closes 19:00

export function slotToTime(slot: number): string {
  const m = OPEN_MIN + slot * SLOT;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${hh}:${String(mm).padStart(2, "0")}`;
}

/** Human date label for the demo's "today" / "tomorrow" (real, live dates). */
export function dateLabel(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  try {
    return new Intl.DateTimeFormat("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return dayOffset === 0 ? "היום" : "מחר";
  }
}

export const DAY_TABS = [
  { day: 0, label: "היום" },
  { day: 1, label: "מחר" },
] as const;

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "לק";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[1][0];
}

let _seq = 0;
export function uid(prefix = "id"): string {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

/* ---------------- services ---------------- */
export interface Service {
  id: string;
  name: string;
  dur: number; // minutes (multiple of SLOT)
  price: number; // ₪
  accent: Accent;
}

export const SERVICES: Service[] = [
  { id: "haircut", name: "תספורת", dur: 30, price: 80, accent: "indigo" },
  { id: "haircut_blow", name: "תספורת + פן", dur: 45, price: 120, accent: "indigo" },
  { id: "blow", name: "פן / החלקת אוויר", dur: 30, price: 70, accent: "sky" },
  { id: "color", name: "צבע שורשים", dur: 90, price: 260, accent: "amber" },
  { id: "highlights", name: "גוונים / חופר", dur: 120, price: 420, accent: "rose" },
  { id: "beard", name: "עיצוב זקן", dur: 30, price: 50, accent: "success" },
  { id: "keratin", name: "החלקת קרטין", dur: 120, price: 550, accent: "rose" },
  { id: "kids", name: "תספורת ילדים", dur: 30, price: 60, accent: "success" },
];

export function serviceById(id: string): Service {
  return SERVICES.find((s) => s.id === id) ?? SERVICES[0];
}

/** span in 30-min slots for a service duration. */
export function span(dur: number): number {
  return Math.max(1, Math.ceil(dur / SLOT));
}

/* ---------------- clients roster ---------------- */
export interface SeedClient {
  name: string;
  phone: string;
  visits: number;
}

export const SEED_CLIENTS: SeedClient[] = [
  { name: "נועה לוי", phone: "052-4418823", visits: 14 },
  { name: "יוסי כהן", phone: "054-7729310", visits: 9 },
  { name: "מאיה בר", phone: "050-3391174", visits: 22 },
  { name: "דנה רז", phone: "053-8820461", visits: 5 },
  { name: "איתי גל", phone: "052-6640198", visits: 11 },
  { name: "רותם שגב", phone: "054-2213908", visits: 7 },
  { name: "שירה פרץ", phone: "050-9987123", visits: 18 },
  { name: "עידן מזרחי", phone: "053-4471200", visits: 3 },
  { name: "טל אבני", phone: "052-7781340", visits: 8 },
  { name: "גל דרור", phone: "054-6650021", visits: 6 },
  { name: "ליאור כץ", phone: "050-1122984", visits: 12 },
  { name: "נטע שני", phone: "053-9903471", visits: 2 },
  { name: "אבי רון", phone: "052-3345098", visits: 15 },
  { name: "מיכל אלון", phone: "054-8890123", visits: 4 },
  { name: "רון ביטון", phone: "050-7712034", visits: 10 },
  { name: "ספיר חדד", phone: "053-6640912", visits: 1 },
];

/* ---------------- state shape ---------------- */
export type ApptStatus = "booked" | "arrived";

export interface Appt {
  id: string;
  day: number; // 0 today, 1 tomorrow
  slot: number; // start slot index
  clientName: string;
  serviceId: string;
  status: ApptStatus;
  reminderId?: string;
}

export type ReminderChannel = "whatsapp" | "sms";
export type ReminderStatus =
  | "confirmed" // אישר/ה הגעה
  | "read" // נקרא
  | "delivered" // נמסר
  | "sent" // נשלח
  | "pending" // ממתין לשליחה
  | "failed"; // נכשל

export interface Reminder {
  id: string;
  channel: ReminderChannel;
  clientName: string;
  timeLabel: string; // "מחר · 09:00"
  status: ReminderStatus;
  auto: boolean;
  when: string; // relative label, e.g. "לפני 12 דק׳"
  appointmentId?: string;
}

export const STATE_VERSION = 1;

export interface DemoState {
  v: number;
  appointments: Appt[];
  reminders: Reminder[];
  autoReminders: boolean;
  cancelledToday: number;
}

/* ---------------- seed builder ---------------- */
function a(
  day: number,
  slot: number,
  clientName: string,
  serviceId: string,
  status: ApptStatus = "booked"
): Appt {
  return { id: uid("appt"), day, slot, clientName, serviceId, status };
}

/** slot index helper: 0=09:00, 1=09:30, 2=10:00 ... */
const s = (h: number, m = 0) => ((h * 60 + m - OPEN_MIN) / SLOT) | 0;

export function makeSeed(): DemoState {
  // NOTE: multi-slot services round up to whole 30-min blocks (span()), so seed
  // start times are 30-min aligned and spaced to avoid any overlap.
  const appointments: Appt[] = [
    // ---- today (≈75% booked) ----
    a(0, s(9, 0), "נועה לוי", "haircut_blow", "arrived"), // 09:00 → 2 slots
    a(0, s(10, 0), "יוסי כהן", "beard", "arrived"), // 10:00
    a(0, s(10, 30), "מאיה בר", "color"), // 10:30 → 3 slots
    a(0, s(12, 0), "דנה רז", "haircut"), // 12:00
    a(0, s(12, 30), "רותם שגב", "blow"), // 12:30
    a(0, s(13, 30), "איתי גל", "haircut_blow"), // 13:30 → 2 slots
    a(0, s(15, 0), "שירה פרץ", "highlights"), // 15:00 → 4 slots
    a(0, s(17, 0), "עידן מזרחי", "haircut"), // 17:00
    a(0, s(18, 0), "טל אבני", "beard"), // 18:00
    // ---- tomorrow ----
    a(1, s(9, 0), "גל דרור", "haircut"),
    a(1, s(10, 0), "ליאור כץ", "color"),
    a(1, s(12, 0), "נטע שני", "haircut_blow"),
    a(1, s(14, 0), "אבי רון", "beard"),
    a(1, s(16, 30), "מיכל אלון", "haircut"),
  ];

  const reminders: Reminder[] = [
    {
      id: uid("rem"),
      channel: "whatsapp",
      clientName: "נועה לוי",
      timeLabel: "היום · 09:00",
      status: "confirmed",
      auto: true,
      when: "אתמול, 18:04",
    },
    {
      id: uid("rem"),
      channel: "sms",
      clientName: "יוסי כהן",
      timeLabel: "היום · 10:00",
      status: "confirmed",
      auto: true,
      when: "אתמול, 18:04",
    },
    {
      id: uid("rem"),
      channel: "whatsapp",
      clientName: "מאיה בר",
      timeLabel: "היום · 10:30",
      status: "read",
      auto: true,
      when: "אתמול, 18:05",
    },
    {
      id: uid("rem"),
      channel: "whatsapp",
      clientName: "שירה פרץ",
      timeLabel: "היום · 15:00",
      status: "delivered",
      auto: true,
      when: "אתמול, 18:05",
    },
    {
      id: uid("rem"),
      channel: "sms",
      clientName: "גל דרור",
      timeLabel: "מחר · 09:00",
      status: "sent",
      auto: true,
      when: "היום, 08:30",
    },
    {
      id: uid("rem"),
      channel: "whatsapp",
      clientName: "ליאור כץ",
      timeLabel: "מחר · 10:00",
      status: "pending",
      auto: true,
      when: "מתוזמן להיום 18:00",
    },
    {
      id: uid("rem"),
      channel: "sms",
      clientName: "אבי רון",
      timeLabel: "מחר · 14:00",
      status: "failed",
      auto: false,
      when: "היום, 08:31",
    },
  ];

  return {
    v: STATE_VERSION,
    appointments,
    reminders,
    autoReminders: true,
    cancelledToday: 0,
  };
}
