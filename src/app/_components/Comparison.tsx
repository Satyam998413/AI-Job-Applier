import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import styles from "./Comparison.module.css";

const oldWay = [
  "Spray 80 applications a week, hear back from 3",
  "Rewrite the same resume across 12 tabs and a Google Doc",
  "Guess which roles you're qualified for from the JD bullets",
  "Track everything in a spreadsheet that breaks every Friday",
  "Hope your resume survives the ATS keyword filter",
];

const newWay = [
  "Apply to 20 roles you can actually win — built from a fit score",
  "One source-of-truth resume, instantly retailored per role",
  "See a 0–100 score and rationale before you spend a single evening",
  "Live pipeline that auto-syncs recruiter emails and nudges back",
  "ATS-passable rewrites baked in, never fabricated",
];

export function Comparison() {
  return (
    <section className={styles.section}>
      <Reveal>
        <span className={styles.eyebrow}>Old way vs. new way</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={styles.heading}>
          The job hunt was broken. <span className={styles.gradient}>We rebuilt it.</span>
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p className={styles.lede}>
          Most candidates lose more hours to the apply-track-tailor loop than to actual interviews.
          We collapsed the loop into one workflow that runs while you live your life.
        </p>
      </Reveal>

      <div className={styles.grid}>
        <Reveal delay={80}>
          <article className={styles.card} data-side="old">
            <header className={styles.cardHead}>
              <span className={styles.cardTag} data-side="old">
                <Icon name="briefcase" size={14} />
                The old way
              </span>
              <h3 className={styles.cardTitle}>Friction, repeat, burn out</h3>
            </header>
            <ul className={styles.list}>
              {oldWay.map((line) => (
                <li key={line} className={styles.row} data-side="old">
                  <span className={styles.bullet} data-side="old">
                    ×
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <Reveal delay={180}>
          <article className={styles.card} data-side="new">
            <span className={styles.glow} aria-hidden />
            <header className={styles.cardHead}>
              <span className={styles.cardTag} data-side="new">
                <Icon name="sparkles" size={14} />
                With AI Job Applier
              </span>
              <h3 className={styles.cardTitle}>Focus, ship, interview</h3>
            </header>
            <ul className={styles.list}>
              {newWay.map((line) => (
                <li key={line} className={styles.row} data-side="new">
                  <span className={styles.bullet} data-side="new">
                    <Icon name="check" size={12} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
