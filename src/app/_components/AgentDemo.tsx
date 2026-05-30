"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import styles from "./AgentDemo.module.css";

type Scene = {
  prompt: string;
  thinking: string[];
  results: { title: string; meta: string; tag: string; tone: "high" | "mid" | "ok" }[];
};

const scenes: Scene[] = [
  {
    prompt: "Find senior frontend roles that match my resume",
    thinking: [
      "Parsing your resume…",
      "Mapping 42 skills against 8,000 open roles…",
      "Ranking by fit, not keywords…",
    ],
    results: [
      { title: "Senior Frontend Engineer · Linear", meta: "Remote · €110k", tag: "94 match", tone: "high" },
      { title: "Staff Engineer, Web · Vercel", meta: "Remote · $180k", tag: "91 match", tone: "high" },
      { title: "Product Engineer · Stripe", meta: "Dublin · €120k", tag: "82 match", tone: "mid" },
    ],
  },
  {
    prompt: "Tailor my resume for the Stripe role",
    thinking: [
      "Reading the JD…",
      "Reframing 6 bullets in your real voice…",
      "Validating against ATS keyword rules…",
    ],
    results: [
      { title: "Resume rewritten in your voice", meta: "12 keywords aligned · 0 fabricated claims", tag: "ATS ready", tone: "high" },
      { title: "Cover letter drafted", meta: "Opens with a specific hook from your portfolio", tag: "Ready", tone: "high" },
      { title: "Interview prep ready", meta: "8 likely questions + answer scaffolds", tag: "Bonus", tone: "ok" },
    ],
  },
  {
    prompt: "Where am I in my application pipeline?",
    thinking: [
      "Syncing your tracker…",
      "Flagging stale threads worth nudging…",
      "Scoring your interview funnel…",
    ],
    results: [
      { title: "3 follow-ups suggested", meta: "Recruiters who went quiet >7 days", tag: "Action", tone: "mid" },
      { title: "2 onsite loops this week", meta: "Notion (Tue) · Vercel (Thu)", tag: "Upcoming", tone: "high" },
      { title: "Reply rate: 47%", meta: "3.2× above the average for your level", tag: "Healthy", tone: "high" },
    ],
  },
];

export function AgentDemo() {
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState<"idle" | "typing" | "thinking" | "result">("idle");
  const [typed, setTyped] = useState("");
  const [thinkIdx, setThinkIdx] = useState(0);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];

    setTyped("");
    setThinkIdx(0);
    setPhase("typing");

    const prompt = scenes[scene].prompt;
    for (let i = 0; i <= prompt.length; i++) {
      timers.push(setTimeout(() => setTyped(prompt.slice(0, i)), 28 * i));
    }
    const afterType = 28 * prompt.length + 320;

    timers.push(setTimeout(() => setPhase("thinking"), afterType));

    const thinks = scenes[scene].thinking;
    thinks.forEach((_, i) => {
      timers.push(setTimeout(() => setThinkIdx(i), afterType + 600 + i * 750));
    });

    const afterThink = afterType + 600 + thinks.length * 750 + 350;
    timers.push(setTimeout(() => setPhase("result"), afterThink));

    timers.push(
      setTimeout(() => setScene((s) => (s + 1) % scenes.length), afterThink + 4200),
    );

    return () => timers.forEach(clearTimeout);
  }, [scene]);

  const current = scenes[scene];

  return (
    <section className={styles.section}>
      <Reveal>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Watch the agent work
        </span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={styles.heading}>
          One <span className={styles.gradient}>career copilot</span>, every stage of the hunt
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p className={styles.lede}>
          From parsing your resume to nudging the recruiter who&apos;s gone quiet. Built on a single
          agent with persistent memory of your goals, applications, and wins.
        </p>
      </Reveal>

      <Reveal delay={240} variant="scale">
        <div className={styles.chatFrame}>
          <div className={styles.beam} aria-hidden />

          <header className={styles.head}>
            <div className={styles.headLeft}>
              <span className={styles.brandDot}>
                <Icon name="sparkles" size={14} />
              </span>
              <div>
                <span className={styles.brandName}>AI Job Applier</span>
                <span className={styles.brandSub}>online · ready to ship</span>
              </div>
            </div>
            <div className={styles.headRight}>
              <span className={styles.headTag}>Gemini 2.5</span>
            </div>
          </header>

          <div className={styles.body}>
            <div className={styles.userRow} key={`u-${scene}`}>
              <span className={styles.bubble} data-from="user">
                {typed}
                {phase === "typing" ? <span className={styles.caret} /> : null}
              </span>
              <span className={styles.userTag}>You</span>
            </div>

            {phase !== "typing" && (
              <div className={styles.agentRow} key={`a-${scene}`}>
                <span className={styles.agentAvatar}>
                  <Icon name="sparkles" size={14} />
                </span>
                <div className={styles.agentBubble}>
                  {phase === "thinking" && (
                    <div className={styles.thinking}>
                      <span className={styles.thinkLine}>{current.thinking[thinkIdx]}</span>
                      <span className={styles.dots}>
                        <span /> <span /> <span />
                      </span>
                    </div>
                  )}

                  {phase === "result" && (
                    <div className={styles.results}>
                      <span className={styles.resultsHead}>
                        <Icon name="check" size={14} /> Done in 7s · 3 picks for you
                      </span>
                      <ul className={styles.resultList}>
                        {current.results.map((r, i) => (
                          <li
                            key={r.title}
                            className={styles.resultItem}
                            style={{ animationDelay: `${i * 110}ms` }}
                          >
                            <div className={styles.resultText}>
                              <span className={styles.resultTitle}>{r.title}</span>
                              <span className={styles.resultMeta}>{r.meta}</span>
                            </div>
                            <span className={styles.resultTag} data-tone={r.tone}>
                              {r.tag}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <footer className={styles.foot}>
            <div className={styles.scenes} role="tablist">
              {scenes.map((s, i) => (
                <button
                  key={s.prompt}
                  type="button"
                  className={styles.sceneDot}
                  data-active={i === scene || undefined}
                  onClick={() => setScene(i)}
                  aria-label={`Scene ${i + 1}`}
                />
              ))}
            </div>
            <span className={styles.footHint}>
              <Icon name="bolt" size={12} /> Auto-cycling demo
            </span>
          </footer>
        </div>
      </Reveal>
    </section>
  );
}
