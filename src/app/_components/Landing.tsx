import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { LogosStrip } from "./LogosStrip";
import { AgentDemo } from "./AgentDemo";
import { BentoFeatures } from "./BentoFeatures";
import { Capabilities } from "./Capabilities";
import { Comparison } from "./Comparison";
import { HowItWorks } from "./HowItWorks";
import { Testimonials } from "./Testimonials";
import { Faq } from "./Faq";
import { CtaSection } from "./CtaSection";
import { LandingFooter } from "./LandingFooter";
import styles from "./Landing.module.css";

export function Landing() {
  return (
    <div className={styles.page}>
      <LandingNav />
      <main className={styles.main}>
        <HeroSection />
        <LogosStrip />
        <AgentDemo />
        <BentoFeatures />
        <Capabilities />
        <Comparison />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
