import { useEffect, useState } from "react";
import Logo from "./Logo";
import { Menu, Close, Play } from "./icons";
import { scrollToId } from "../lib/scroll";
import { useOpenDemo } from "../demo/openContext";

const LINKS = [
  { id: "pain", label: "יתרונות" },
  { id: "features", label: "המערכת" },
  { id: "how", label: "איך זה עובד" },
  { id: "pricing", label: "מחירים" },
  { id: "faq", label: "שאלות" },
];

/**
 * Scroll-aware top nav: transparent over the hero, then a blurred white
 * backdrop once you scroll. Anchor nav routes through Lenis (scrollToId).
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const openDemo = useOpenDemo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id, { focus: true });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-white/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5"
        aria-label="ראשי"
      >
        <button
          type="button"
          onClick={() => go("hero")}
          className="rounded-lg"
          aria-label="תורי — לראש העמוד"
        >
          <Logo />
        </button>

        {/* desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => go(l.id)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-indigo-wash hover:text-indigo-deep"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-demo-open
            onClick={openDemo}
            className={`hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition md:inline-flex ${
              scrolled || open
                ? "text-indigo-deep ring-1 ring-indigo/30 hover:bg-indigo-wash"
                : "text-indigo-deep ring-1 ring-indigo/40 hover:bg-white/60"
            }`}
          >
            <Play width={15} height={15} />
            נסו את המערכת
          </button>
          <button
            type="button"
            onClick={() => go("trial")}
            className="hidden rounded-full bg-indigo px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo/25 transition hover:bg-indigo-deep sm:inline-flex"
          >
            ניסיון חינם
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-lg text-ink lg:hidden"
            aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={open}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-line bg-white/95 px-5 py-4 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => go(l.id)}
                  className="w-full rounded-lg px-3 py-3 text-start text-base font-medium text-ink transition hover:bg-indigo-wash"
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                data-demo-open
                onClick={() => {
                  setOpen(false);
                  openDemo();
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-bold text-indigo-deep ring-1 ring-indigo/30"
              >
                <Play width={16} height={16} />
                נסו את המערכת
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => go("trial")}
                className="w-full rounded-full bg-indigo px-5 py-3 text-base font-bold text-white"
              >
                ניסיון חינם
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
