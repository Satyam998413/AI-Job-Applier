import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { MouseSpotlight } from "@/components/MouseSpotlight";
import styles from "./BentoFeatures.module.css";

export function BentoFeatures() {
  return (
    <section id="features" className={styles.section}>
      <Reveal>
        <span className={styles.eyebrow}>What it does</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={styles.heading}>
          A full job-hunt OS. <span className={styles.gradient}>One quiet agent.</span>
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p className={styles.lede}>
          Built like a teammate, not a tool. It learns your goals once, remembers them forever, and
          ships work in the background while you sleep.
        </p>
      </Reveal>

      <div className={styles.grid}>
        {/* Tile 1 — large, score ring */}
        <Reveal delay={0} className={styles.cell1}>
          <MouseSpotlight className={styles.tile} color="rgba(109, 123, 255, 0.32)">
            <div className={styles.tileInner}>
              <div className={styles.tileHead}>
                <span className={styles.tag}>Matching</span>
                <h3 className={styles.tileTitle}>Every role, scored 0–100 for you</h3>
                <p className={styles.tileBody}>
                  We rank openings by real fit — your strongest skills, the gaps that matter, the
                  red flags worth dodging. So you stop spraying applications you&apos;ll never win.
                </p>
              </div>
              <div className={styles.ringWrap} aria-hidden>
                <div className={styles.ring}>
                  <span className={styles.ringNum}>94</span>
                  <span className={styles.ringLabel}>match</span>
                </div>
                <ul className={styles.skillTags}>
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>Next.js</li>
                  <li>System design</li>
                  <li>+38 more</li>
                </ul>
              </div>
            </div>
          </MouseSpotlight>
        </Reveal>

        {/* Tile 2 — small, parser */}
        <Reveal delay={100} className={styles.cell2}>
          <MouseSpotlight className={styles.tile} color="rgba(56, 224, 216, 0.28)">
            <div className={styles.tileInner}>
              <span className={styles.iconChip} data-tone="cyan">
                <Icon name="document" size={20} />
              </span>
              <span className={styles.tag}>Parsing</span>
              <h3 className={styles.tileTitle}>Resume in. Skill graph out.</h3>
              <p className={styles.tileBody}>
                One PDF upload becomes 42 mapped skills, your seniority arc, and the wins worth
                amplifying. No spreadsheets.
              </p>
              <div className={styles.parseFile} aria-hidden>
                <span className={styles.parseLabel}>resume_v6.pdf</span>
                <div className={styles.parseBar}>
                  <span className={styles.parseFill} />
                </div>
                <span className={styles.parseMeta}>Skills · Roles · Achievements</span>
              </div>
            </div>
          </MouseSpotlight>
        </Reveal>

        {/* Tile 3 — small, tailor */}
        <Reveal delay={180} className={styles.cell3}>
          <MouseSpotlight className={styles.tile} color="rgba(163, 104, 252, 0.28)">
            <div className={styles.tileInner}>
              <span className={styles.iconChip} data-tone="violet">
                <Icon name="wand" size={20} />
              </span>
              <span className={styles.tag}>Tailoring</span>
              <h3 className={styles.tileTitle}>Resumes that beat the bots</h3>
              <p className={styles.tileBody}>
                Keyword-aligned for each JD, rewritten in your real voice. Never fabricated — always
                ATS-passable.
              </p>
              <div className={styles.diffLines} aria-hidden>
                <span className={styles.diff} data-mode="rm">
                  - Worked on the frontend
                </span>
                <span className={styles.diff} data-mode="add">
                  + Shipped React migration cutting LCP by 38%
                </span>
                <span className={styles.diff} data-mode="add">
                  + Owned design-system rollout across 7 squads
                </span>
              </div>
            </div>
          </MouseSpotlight>
        </Reveal>

        {/* Tile 4 — wide, pipeline */}
        <Reveal delay={260} className={styles.cell4}>
          <MouseSpotlight className={styles.tile} color="rgba(252, 109, 109, 0.22)">
            <div className={styles.tileInner}>
              <div className={styles.tileHead}>
                <span className={styles.tag}>Pipeline</span>
                <h3 className={styles.tileTitle}>Every application, every stage, one board</h3>
                <p className={styles.tileBody}>
                  A Kanban built for job hunting — not project management. Auto-pulls recruiter
                  emails, flags stale threads, suggests when to follow up.
                </p>
              </div>
              <div className={styles.board} aria-hidden>
                <div className={styles.col}>
                  <span className={styles.colName}>Applied</span>
                  <span className={styles.colCount}>14</span>
                  <span className={styles.colCard}>Linear</span>
                  <span className={styles.colCard}>Stripe</span>
                </div>
                <div className={styles.col} data-warm>
                  <span className={styles.colName}>Screen</span>
                  <span className={styles.colCount}>5</span>
                  <span className={styles.colCard}>Notion</span>
                  <span className={styles.colCard}>Vercel</span>
                </div>
                <div className={styles.col} data-hot>
                  <span className={styles.colName}>Onsite</span>
                  <span className={styles.colCount}>2</span>
                  <span className={styles.colCard}>Anthropic</span>
                </div>
                <div className={styles.col} data-win>
                  <span className={styles.colName}>Offer</span>
                  <span className={styles.colCount}>1</span>
                  <span className={styles.colCard}>Figma</span>
                </div>
              </div>
            </div>
          </MouseSpotlight>
        </Reveal>

        {/* Tile 5 — privacy */}
        <Reveal delay={340} className={styles.cell5}>
          <MouseSpotlight className={styles.tile} color="rgba(52, 211, 154, 0.28)">
            <div className={styles.tileInner}>
              <span className={styles.iconChip} data-tone="success">
                <Icon name="shield" size={20} />
              </span>
              <span className={styles.tag}>Privacy</span>
              <h3 className={styles.tileTitle}>Your resume never trains a model</h3>
              <p className={styles.tileBody}>
                Encrypted at rest, isolated per user, one-click deletion. We&apos;d rather lose the
                signal than your trust.
              </p>
              <ul className={styles.checks}>
                <li>
                  <Icon name="check" size={12} /> Zero retention prompts
                </li>
                <li>
                  <Icon name="check" size={12} /> SOC 2 architecture
                </li>
                <li>
                  <Icon name="check" size={12} /> GDPR-aligned
                </li>
              </ul>
            </div>
          </MouseSpotlight>
        </Reveal>
      </div>
    </section>
  );
}
