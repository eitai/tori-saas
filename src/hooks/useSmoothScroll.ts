import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { setLenis } from "../lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Eitai's house scroll feel — Lenis inertia (flick → glide), wired so GSAP's
 * ticker drives Lenis and every Lenis scroll updates ScrollTrigger, keeping the
 * pinned scrub scenes perfectly in sync.
 *
 * HARD RULES (studio recipe):
 *  - Desktop only (`pointer: fine`). Touch scrolling is NEVER hijacked — an
 *    earlier project froze iOS Safari doing that, so `syncTouch: false` always
 *    AND we don't even instantiate Lenis on coarse pointers.
 *  - Disabled under prefers-reduced-motion (native scroll, static scenes).
 *  - lerp 0.1, smoothWheel true, autoRaf false (GSAP ticker owns the loop).
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    // Desktop + motion-ok only. Mobile/touch keeps native scrolling.
    if (reduceMotion || !finePointer) return;

    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.1,
    });
    setLenis(lenis);
    // exposed for automated verification (drive the scrub deterministically)
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000); // gsap ticker time is seconds → Lenis wants ms
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);
}
