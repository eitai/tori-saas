import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Entrance helper: fade + rise the `[data-reveal]` children of `ref` once,
 * staggered, when the section scrolls into view. Never pins, so it can't fight
 * the big pinned scrub scenes. prefers-reduced-motion → nothing runs, content
 * just renders. clearProps on complete so CSS hover transforms take over.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  selector = "[data-reveal]",
  { stagger = 0.1, start = "top 82%", y = 40 } = {}
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.querySelector(selector)) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          selector,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger,
            clearProps: "all",
            scrollTrigger: { trigger: el, start, once: true },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [ref, selector, stagger, start, y]);
}
