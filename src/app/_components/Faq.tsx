import { Reveal } from "@/components/Reveal";
import styles from "./Faq.module.css";

const faqs: { q: string; a: string }[] = [
  {
    q: "Will the AI lie about my experience?",
    a: "No. Every tailored bullet has to map to something already on your resume — we re-frame, never fabricate. You see a side-by-side diff and can revert any line in one click.",
  },
  {
    q: "Does my resume get used to train your model?",
    a: "Never. We send your resume to the LLM with zero-retention prompts, store it encrypted in your account, and let you delete every artifact in one click. No data pipelines feed back into model training.",
  },
  {
    q: "Which job boards are supported?",
    a: "We aggregate openings from LinkedIn, Indeed, Wellfound, YC Work at a Startup, Hacker News Who's Hiring, and a few company-direct feeds. Roles update daily, and you can paste any JD URL we don't cover.",
  },
  {
    q: "Will it actually beat the ATS?",
    a: "We don't promise magic — but we run every tailored resume through an ATS lint that catches the things the major scanners (Greenhouse, Lever, Workday) actually reject. 94% of our tailored resumes pass first-scan parsing.",
  },
  {
    q: "What does it cost?",
    a: "Free for the first 5 tailored resumes — no credit card. After that, $12/month for unlimited tailoring, ranking, and pipeline tracking. Cancel any time, your data is yours to export.",
  },
  {
    q: "I've never used an AI tool. Is the setup hard?",
    a: "It's three steps: sign up with email or Google, drop your resume in, tell us what kind of role you're after. Most people are looking at their first batch of ranked openings within 90 seconds.",
  },
];

export function Faq() {
  return (
    <section className={styles.section}>
      <Reveal>
        <span className={styles.eyebrow}>FAQ</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={styles.heading}>
          Honest answers, <span className={styles.gradient}>no marketing fluff</span>
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p className={styles.lede}>
          The questions every careful job seeker asks before trusting an AI with their resume. If
          yours isn&apos;t here, write us — we&apos;ll add it.
        </p>
      </Reveal>

      <div className={styles.list}>
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={i * 60}>
            <details className={styles.item}>
              <summary className={styles.summary}>
                <span className={styles.q}>{f.q}</span>
                <span className={styles.toggle} aria-hidden>
                  <span />
                  <span />
                </span>
              </summary>
              <p className={styles.a}>{f.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
