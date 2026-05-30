import { Reveal } from "@/components/Reveal";
import { Icon, type IconName } from "@/components/Icon";
import styles from "./HowItWorks.module.css";

type Step = { icon: IconName; title: string; body: string; meta: string };

const steps: Step[] = [
  {
    icon: "upload",
    title: "Drop your resume",
    body: "PDF or DOCX, one click. Our parser builds your skill graph, infers seniority, and surfaces wins worth amplifying.",
    meta: "~5 seconds",
  },
  {
    icon: "briefcase",
    title: "Discover the right roles",
    body: "Browse a curated job feed ranked for your real fit — not just keyword matches. Save the ones you want to chase.",
    meta: "Updated daily",
  },
  {
    icon: "target",
    title: "See your match score",
    body: "Each role gets a 0–100 score with the skills you nail, the gaps that matter, and a short rationale you can act on.",
    meta: "0–100 fit",
  },
  {
    icon: "wand",
    title: "Tailor & apply",
    body: "Generate a recruiter-ready resume and cover letter in seconds. Track every application from screen to offer.",
    meta: "~7 seconds",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className={styles.section}>
      <Reveal>
        <span className={styles.eyebrow}>How it works</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={styles.heading}>
          From resume to offer in <span className={styles.gradient}>four steps</span>
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p className={styles.lede}>
          No browser extensions to install, no spreadsheets to maintain. Just a quiet workflow that
          does the heavy lifting in the background.
        </p>
      </Reveal>

      <ol className={styles.steps}>
        <div className={styles.line} aria-hidden />
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 100} className={styles.cell}>
            <li className={styles.step}>
              <span className={styles.connector} aria-hidden />
              <span className={styles.num}>
                <span className={styles.numIcon}>
                  <Icon name={s.icon} size={20} />
                </span>
                <span className={styles.numLabel}>0{i + 1}</span>
              </span>
              <div className={styles.text}>
                <span className={styles.meta}>{s.meta}</span>
                <h3 className={styles.title}>{s.title}</h3>
                <p className={styles.body}>{s.body}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
