import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { HeroPreview } from "./HeroPreview";
import styles from "./HeroSection.module.css";

const trustStats = [
  { value: "12,400+", label: "Resumes parsed" },
  { value: "94%", label: "ATS pass rate" },
  { value: "3.2×", label: "More interviews" },
];

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.orb} aria-hidden />
      <div className={styles.gridLines} aria-hidden />

      <Reveal>
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          <Icon name="sparkles" size={14} />
          Now powered by Gemini 2.5 Pro
          <span className={styles.badgeSep} />
          <span className={styles.badgeNew}>New</span>
        </span>
      </Reveal>

      <Reveal delay={90}>
        <h1 className={styles.title}>
          Stop applying.
          <br />
          Start <span className={styles.gradient}>landing interviews</span>
          <span className={styles.cursor} />
        </h1>
      </Reveal>

      <Reveal delay={180}>
        <p className={styles.subtitle}>
          Your AI career copilot reads your resume, scores every opening for fit, and rewrites a
          recruiter-ready version for each role — all before your second coffee. Built for the job
          market, not the bots.
        </p>
      </Reveal>

      <Reveal delay={260}>
        <div className={styles.actions}>
          <Button href="/register">
            Start free — 60s setup <Icon name="arrowRight" size={18} />
          </Button>
          <Button href="#how" variant="secondary">
            <Icon name="bolt" size={16} />
            See how it works
          </Button>
        </div>
      </Reveal>

      <Reveal delay={340}>
        <ul className={styles.trustList}>
          <li>
            <Icon name="check" size={14} /> No credit card
          </li>
          <li>
            <Icon name="shield" size={14} /> Your resume stays private
          </li>
          <li>
            <Icon name="bolt" size={14} /> Setup in under a minute
          </li>
        </ul>
      </Reveal>

      <Reveal delay={420} variant="scale">
        <div className={styles.previewWrap}>
          <HeroPreview />
        </div>
      </Reveal>

      <Reveal delay={520}>
        <div className={styles.stats}>
          {trustStats.map((s, i) => (
            <div key={s.label} className={styles.stat} style={{ animationDelay: `${600 + i * 120}ms` }}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
