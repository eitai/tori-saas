/**
 * Demo data for the fictional תורי product. These numbers live INSIDE the mock
 * UI — they are illustrative product data (legit for a fictional product), never
 * presented as real adoption statistics.
 */

export type Accent = "indigo" | "success" | "amber" | "rose" | "sky";

export interface Appointment {
  time: string;
  name: string;
  service: string;
  duration: string;
  initials: string;
  accent: Accent;
}

/** A single business day's schedule for the mock calendar. */
export const APPOINTMENTS: Appointment[] = [
  { time: "09:00", name: "נועה לוי", service: "תספורת + פן", duration: "45 ד׳", initials: "נל", accent: "indigo" },
  { time: "10:00", name: "יוסי כהן", service: "עיצוב זקן", duration: "30 ד׳", initials: "יכ", accent: "success" },
  { time: "11:15", name: "מאיה בר", service: "צבע שורשים", duration: "90 ד׳", initials: "מב", accent: "amber" },
  { time: "13:30", name: "דנה רז", service: "תספורת", duration: "30 ד׳", initials: "דר", accent: "rose" },
  { time: "14:30", name: "איתי גל", service: "תספורת + זקן", duration: "45 ד׳", initials: "אג", accent: "sky" },
];

/** KPI targets — counters run up to these. */
export const KPI = {
  revenue: 8450, // ₪ this week
  occupancy: 87, // %
  bookings: 42, // appointments this week
};

/** Weekly revenue by day (א׳–ש׳) for the self-drawing SVG chart. */
export const WEEK_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
export const WEEK_REVENUE = [780, 1120, 950, 1340, 1180, 1620, 460];

/** Toast sequence for the hero assembly (stage 3). Decorative → aria-hidden. */
export const TOASTS = [
  { icon: "check", text: "תור חדש נקבע", sub: "נועה לוי · 09:00" },
  { icon: "bell", text: "תזכורת נשלחה ללקוח", sub: "SMS + וואטסאפ" },
  { icon: "reply", text: "אישור הגעה התקבל", sub: "יוסי כהן · מגיע" },
] as const;
