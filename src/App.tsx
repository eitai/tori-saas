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

export default function App() {
  // Lenis inertia (desktop-only) + GSAP ScrollTrigger foundation.
  useSmoothScroll();

  return (
    <>
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
    </>
  );
}
