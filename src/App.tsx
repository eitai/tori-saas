import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import Nav from "./components/Nav";
import HeroAssembly from "./components/HeroAssembly";
import PainSolution from "./components/sections/PainSolution";
import FeatureShowcase from "./components/sections/FeatureShowcase";
import MoreFeatures from "./components/sections/MoreFeatures";
import HowItWorks from "./components/sections/HowItWorks";
import Pricing from "./components/sections/Pricing";
import FAQ from "./components/sections/FAQ";
import TrialForm from "./components/sections/TrialForm";
import Footer from "./components/sections/Footer";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { scrollToId } from "./lib/scroll";
import { OpenDemoContext } from "./demo/openContext";

// Lazy — the whole interactive demo lives in its own chunk so it never touches
// the landing's initial JS / LCP. Only fetched when a visitor opens the demo.
const DemoApp = lazy(() => import("./demo/DemoApp"));

const isDemoURL = () =>
  new URLSearchParams(window.location.search).get("view") === "demo";

export default function App() {
  // Lenis inertia (desktop-only) + GSAP ScrollTrigger foundation.
  useSmoothScroll();

  const [demoOpen, setDemoOpen] = useState(isDemoURL);

  // keep state in sync with browser back/forward (shareable ?view=demo)
  useEffect(() => {
    const onPop = () => setDemoOpen(isDemoURL());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openDemo = useCallback(() => {
    if (!isDemoURL()) {
      const url = new URL(window.location.href);
      url.searchParams.set("view", "demo");
      window.history.pushState({ demo: true }, "", url);
    }
    setDemoOpen(true);
  }, []);

  const closeDemo = useCallback(() => {
    setDemoOpen(false);
    if (window.history.state?.demo) {
      // we pushed the demo entry — pop it so URL + history stay consistent
      window.history.back();
    } else if (isDemoURL()) {
      // deep-linked straight into the demo — just clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      window.history.replaceState({}, "", url);
    }
  }, []);

  return (
    <OpenDemoContext.Provider value={openDemo}>
      {/* landing — made inert (untabbable + hidden from AT) while the demo is open */}
      <div inert={demoOpen}>
        {/* skip link — jumps keyboard/AT users past the pinned scrub scenes */}
        <a
          href="#pain"
          onClick={(e) => {
            e.preventDefault();
            scrollToId("pain", { focus: true });
          }}
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-indigo focus:px-6 focus:py-3 focus:font-bold focus:text-white focus:shadow-xl"
        >
          דלגו לתוכן הראשי
        </a>

        <Nav />
        <main>
          <HeroAssembly />
          <PainSolution />
          <FeatureShowcase />
          <MoreFeatures />
          <HowItWorks />
          <Pricing />
          <FAQ />
          <TrialForm />
        </main>
        <Footer />
      </div>

      {demoOpen && (
        <Suspense
          fallback={
            <div
              dir="rtl"
              className="fixed inset-0 z-[100] grid place-items-center bg-panel text-slate-300"
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-indigo" />
                טוען את הדמו…
              </div>
            </div>
          }
        >
          <DemoApp onClose={closeDemo} />
        </Suspense>
      )}
    </OpenDemoContext.Provider>
  );
}
