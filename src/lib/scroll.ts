import type Lenis from "lenis";

/**
 * Tiny module-level holder for the active Lenis instance, so nav links / CTAs
 * can smooth-scroll through Lenis when it's running (desktop) and fall back to
 * native `scrollIntoView` when it isn't (mobile / reduced-motion).
 */
let lenisInstance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  lenisInstance = l;
}

/** Fixed-nav height compensation so anchored sections aren't hidden beneath it. */
const NAV_OFFSET = -76;

export function scrollToId(id: string, { focus = false }: { focus?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: NAV_OFFSET });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Move focus for keyboard / assistive-tech users (Lenis swallows the native
  // anchor focus jump, so we do it manually).
  if (focus) {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
}
