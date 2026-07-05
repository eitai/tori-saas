import { useEffect } from "react";
import { Check, Bell, Trash } from "../components/icons";

export type ToastTone = "success" | "info" | "danger";
export interface ToastItem {
  id: string;
  text: string;
  sub?: string;
  tone: ToastTone;
}

const TONE: Record<
  ToastTone,
  { icon: typeof Check; ring: string; badge: string }
> = {
  success: {
    icon: Check,
    ring: "ring-success/30",
    badge: "bg-success-wash text-success-deep",
  },
  info: {
    icon: Bell,
    ring: "ring-indigo/30",
    badge: "bg-indigo-wash text-indigo-deep",
  },
  danger: {
    icon: Trash,
    ring: "ring-rose/30",
    badge: "bg-rose/15 text-rose",
  },
};

function Toast({
  item,
  onDone,
}: {
  item: ToastItem;
  onDone: (id: string) => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(() => onDone(item.id), 2800);
    return () => window.clearTimeout(t);
  }, [item.id, onDone]);

  const { icon: Icon, ring, badge } = TONE[item.tone];
  return (
    <div
      className={`demo-toast pointer-events-auto flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-xl shadow-ink/10 ring-1 ${ring}`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${badge}`}
      >
        <Icon width={16} height={16} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-ink">{item.text}</p>
        {item.sub && (
          <p className="truncate text-[11px] text-ink-soft">{item.sub}</p>
        )}
      </div>
    </div>
  );
}

export default function ToastHost({
  toasts,
  onDone,
}: {
  toasts: ToastItem[];
  onDone: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDone={onDone} />
      ))}
    </div>
  );
}
