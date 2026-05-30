"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { Icon, type IconName } from "@/components/Icon";
import styles from "./Capabilities.module.css";

type Capability = {
  id: string;
  icon: IconName;
  label: string;
  blurb: string;
  panel: { kicker: string; title: string; body: string; bullets: string[] };
  preview: { label: string; lines: string[] };
};

const caps: Capability[] = [
  {
    id: "parse",
    icon: "document",
    label: "Parse",
    blurb: "PDF → skill graph in 5s",
    panel: {
      kicker: "Stage 01 · Parse",
      title: "Read your resume like a recruiter does — not a keyword counter",
      body: "Our parser doesn't just grab text. It maps roles to seniority, achievements to outcomes, and skills to a graph that updates as you upload.",
      bullets: [
        "PDF, DOCX, Pages — all handled in one pipe",
        "42 average skills mapped per resume",
        "Achievements scored by impact + recency",
      ],
    },
    preview: {
      label: "$ aja parse resume_v6.pdf",
      lines: [
        "› Detected role arc: Mid → Senior → Staff",
        "› Skills mapped: 42 (12 strong · 8 secondary)",
        "› Top achievement: \"cut LCP 38% in 6 weeks\"",
        "✓ Parse complete in 4.8s",
      ],
    },
  },
  {
    id: "match",
    icon: "target",
    label: "Match",
    blurb: "Every role, scored 0–100",
    panel: {
      kicker: "Stage 02 · Match",
      title: "Stop spraying. Apply to roles you can actually win.",
      body: "Each opening gets a fit score with a short, honest rationale. The skills you nail, the ones you don't, and whether it's worth your evening.",
      bullets: [
        "0–100 score with breakdown — no black boxes",
        "Flags gaps you could close in a weekend",
        "Surfaces hidden-gem roles you'd have skipped",
      ],
    },
    preview: {
      label: "› match → senior frontend · linear",
      lines: [
        "Skill match : 11/12 strong, 1 secondary",
        "Seniority   : aligned (Senior · 5y)",
        "Compensation: 12% above your floor",
        "Verdict     : APPLY — 94/100",
      ],
    },
  },
  {
    id: "tailor",
    icon: "wand",
    label: "Tailor",
    blurb: "ATS-ready in 7s",
    panel: {
      kicker: "Stage 03 · Tailor",
      title: "Resumes rewritten in your voice — not AI's",
      body: "We don't generate from scratch. We re-frame your real bullets to land the keywords this JD actually scans for, then pass it through an ATS lint.",
      bullets: [
        "Keyword-aligned, never fabricated",
        "ATS lint catches what hiring tools reject",
        "Side-by-side diff — accept or revert any line",
      ],
    },
    preview: {
      label: "› tailor → stripe · product engineer",
      lines: [
        "- Worked on the checkout team",
        "+ Shipped checkout rewrite ($14M ARR impact)",
        "+ Owned A/B program across 7 surfaces",
        "✓ 12 keywords aligned · 0 fabricated",
      ],
    },
  },
  {
    id: "track",
    icon: "briefcase",
    label: "Track",
    blurb: "Every stage, one board",
    panel: {
      kicker: "Stage 04 · Track",
      title: "A Kanban built for job hunting, not project management",
      body: "Auto-syncs recruiter emails, flags threads that have gone quiet, and tells you exactly when to send the polite nudge that actually works.",
      bullets: [
        "Inbox → board sync, fully automatic",
        "Smart nudges with first-line drafts",
        "Funnel analytics: reply, screen, offer rate",
      ],
    },
    preview: {
      label: "› pipeline status",
      lines: [
        "Applied 14 · Screen 5 · Onsite 2 · Offer 1",
        "Reply rate : 47% (3.2× peer median)",
        "Stale threads worth nudging : 3",
        "Next interview : Vercel · Thu 10:00 IST",
      ],
    },
  },
];

export function Capabilities() {
  const [active, setActive] = useState(caps[0].id);
  const cap = caps.find((c) => c.id === active) ?? caps[0];

  return (
    <section className={styles.section}>
      <Reveal>
        <span className={styles.eyebrow}>Capabilities</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={styles.heading}>
          Four agents in one. <span className={styles.gradient}>All hand-off-free.</span>
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p className={styles.lede}>
          Each capability is fluent in the others. The parser feeds the matcher; the matcher feeds
          the tailor; the tailor feeds the tracker. No copy-paste between tools.
        </p>
      </Reveal>

      <div className={styles.tabs} role="tablist">
        {caps.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === active}
            className={styles.tab}
            data-active={c.id === active || undefined}
            onClick={() => setActive(c.id)}
            type="button"
          >
            <span className={styles.tabIcon}>
              <Icon name={c.icon} size={16} />
            </span>
            <span className={styles.tabText}>
              <span className={styles.tabLabel}>{c.label}</span>
              <span className={styles.tabBlurb}>{c.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      <Reveal delay={80} variant="scale" key={cap.id}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <span className={styles.kicker}>{cap.panel.kicker}</span>
            <h3 className={styles.panelTitle}>{cap.panel.title}</h3>
            <p className={styles.panelBody}>{cap.panel.body}</p>
            <ul className={styles.bullets}>
              {cap.panel.bullets.map((b) => (
                <li key={b}>
                  <Icon name="check" size={14} />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.terminal} aria-hidden>
            <div className={styles.termBar}>
              <span className={styles.termDot} data-c="r" />
              <span className={styles.termDot} data-c="y" />
              <span className={styles.termDot} data-c="g" />
              <span className={styles.termLabel}>{cap.preview.label}</span>
            </div>
            <div className={styles.termBody}>
              {cap.preview.lines.map((l, i) => (
                <span
                  key={`${cap.id}-${i}`}
                  className={styles.termLine}
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
