import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import styles from "./CtaSection.module.css";

const perks = [
  "Free for the first 5 tailored resumes",
  "No credit card required",
  "Delete your data in one click",
];

export function CtaSection() {
  return (
    <Reveal variant="scale">
      <section className={styles.cta}>
        <div className={styles.glow} aria-hidden />
        <div className={styles.grid} aria-hidden />
        <div className={styles.beam} aria-hidden />

        <span className={styles.eyebrow}>
          <Icon name="sparkles" size={14} />
          Your next role is one upload away
        </span>

        <h2 className={styles.title}>
          Ready to apply <span className={styles.gradient}>smarter</span>,<br />
          not harder?
        </h2>

        <p className={styles.subtitle}>
          Create a free account, drop your resume in, and watch one document turn into a dozen
          recruiter-ready applications. Built for the job market, not the bots.
        </p>

        <div className={styles.actions}>
          <Button href="/register">
            Get started — it&apos;s free <Icon name="arrowRight" size={18} />
          </Button>
          <Button href="/login" variant="secondary">
            I already have an account
          </Button>
        </div>

        <ul className={styles.perks}>
          {perks.map((p) => (
            <li key={p}>
              <Icon name="check" size={14} />
              {p}
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
