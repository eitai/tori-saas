import { useEffect, useRef, type ReactNode } from "react";
import { Close } from "../components/icons";

/**
 * Accessible dialog: role=dialog + aria-modal, focus trapped inside, Esc closes,
 * backdrop click closes, and focus is restored to the trigger on unmount.
 * Deliberately GSAP-free (CSS transitions only) so it never touches the landing.
 */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({
  title,
  onClose,
  children,
  labelId = "demo-modal-title",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelId?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    // focus the first field / the dialog itself
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const nodes = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (nodes.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement;
      if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      restoreRef.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="demo-fade fixed inset-0 z-[110] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        dir="rtl"
        className="demo-pop relative w-full max-w-md rounded-2xl bg-white shadow-2xl outline-none ring-1 ring-line"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id={labelId} className="font-heading text-lg font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition hover:bg-canvas hover:text-ink"
            aria-label="סגירה"
          >
            <Close width={18} height={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
