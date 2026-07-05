import { createContext, useContext } from "react";

/**
 * Tiny context that lets landing-page components (Nav, Hero) open the demo
 * overlay. Deliberately standalone (no demo-chunk imports) so importing it never
 * pulls the lazy demo bundle into the landing's initial JS.
 */
export const OpenDemoContext = createContext<() => void>(() => {});

export function useOpenDemo() {
  return useContext(OpenDemoContext);
}
