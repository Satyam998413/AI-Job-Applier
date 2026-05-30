import { Icon } from "@/components/Icon";
import styles from "./HeroPreview.module.css";

const matches = [
  { role: "Senior Frontend Engineer", company: "Linear", score: 94, tone: "high" as const },
  { role: "Full-Stack Engineer", company: "Vercel", score: 88, tone: "high" as const },
  { role: "Product Engineer", company: "Stripe", score: 76, tone: "mid" as const },
  { role: "React Developer", company: "Notion", score: 71, tone: "mid" as const },
];

export function HeroPreview() {
  return (
    <div className={styles.frame} aria-hidden>
      <div className={styles.beam} />
      <div className={styles.window}>
        <div className={styles.titlebar}>
          <span className={styles.dot} data-c="r" />
          <span className={styles.dot} data-c="y" />
          <span className={styles.dot} data-c="g" />
          <span className={styles.url}>app.aijobapplier.com / matches</span>
        </div>
        <div className={styles.body}>
          <div className={styles.sidebar}>
            <span className={styles.navItem} data-active>
              <Icon name="target" size={14} /> Matches
            </span>
            <span className={styles.navItem}>
              <Icon name="document" size={14} /> Resume
            </span>
            <span className={styles.navItem}>
              <Icon name="briefcase" size={14} /> Jobs
            </span>
            <span className={styles.navItem}>
              <Icon name="wand" size={14} /> Tailor
            </span>
          </div>
          <div className={styles.content}>
            <div className={styles.contentHead}>
              <div>
                <p className={styles.eyebrow}>Today&apos;s top picks</p>
                <h4 className={styles.contentTitle}>Ranked for your profile</h4>
              </div>
              <span className={styles.live}>
                <span className={styles.livePulse} />
                Live
              </span>
            </div>
            <ul className={styles.list}>
              {matches.map((m, i) => (
                <li key={m.role} className={styles.row} style={{ animationDelay: `${600 + i * 140}ms` }}>
                  <div className={styles.rowText}>
                    <span className={styles.role}>{m.role}</span>
                    <span className={styles.company}>{m.company}</span>
                  </div>
                  <div className={styles.score} data-tone={m.tone}>
                    <span className={styles.scoreNum}>{m.score}</span>
                    <span className={styles.scoreLabel}>match</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.scanLine} />
          </div>
        </div>
      </div>

      <div className={styles.floatCard} data-pos="tl">
        <Icon name="sparkles" size={16} />
        <div>
          <span className={styles.floatTitle}>Resume parsed</span>
          <span className={styles.floatSub}>42 skills detected</span>
        </div>
      </div>

      <div className={styles.floatCard} data-pos="br">
        <Icon name="check" size={16} />
        <div>
          <span className={styles.floatTitle}>ATS-ready</span>
          <span className={styles.floatSub}>Tailored in 7s</span>
        </div>
      </div>
    </div>
  );
}
