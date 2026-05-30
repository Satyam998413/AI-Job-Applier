import { ScoreRing } from "@/components/ScoreRing";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import type { AtsResultDto, AtsBreakdownKey } from "@/types";
import styles from "./AtsResultPanel.module.css";

const LABELS: Record<AtsBreakdownKey, string> = {
  keywords: "Keyword coverage",
  structure: "Sections & structure",
  experience: "Experience grounding",
  skills: "Skills relevance",
  clarity: "Clarity & ATS-readability",
  actionVerbs: "Action verbs & impact",
};

function toneFor(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

export function AtsResultPanel({ result }: { result: AtsResultDto }) {
  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <ScoreRing score={result.score} size={80} />
        <div>
          <h3 className={styles.title}>ATS readiness</h3>
          <p className={styles.subtitle}>
            {result.jobTitle
              ? `Targeted at "${result.jobTitle}"${result.jobCompany ? ` — ${result.jobCompany}` : ""}`
              : "General ATS check (no specific job)"}
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <h4 className={styles.sectionLabel}>Breakdown</h4>
        <ul className={styles.breakdown}>
          {result.breakdown.map((b) => {
            const tone = toneFor(b.score);
            return (
              <li key={b.key} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={styles.rowLabel}>{LABELS[b.key] ?? b.key}</span>
                  <span className={[styles.rowScore, styles[tone]].join(" ")}>{b.score}</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={[styles.barFill, styles[tone]].join(" ")}
                    style={{ width: `${b.score}%` }}
                  />
                </div>
                <p className={styles.comment}>{b.comment}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {result.strengths.length > 0 ? (
        <section className={styles.section}>
          <h4 className={styles.sectionLabel}>
            <Badge tone="success">
              <Icon name="check" size={12} /> Strengths
            </Badge>
          </h4>
          <ul className={styles.bullets}>
            {result.strengths.map((s, i) => (
              <li key={`s-${i}`}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.weaknesses.length > 0 ? (
        <section className={styles.section}>
          <h4 className={styles.sectionLabel}>
            <Badge tone="warning">
              <Icon name="bolt" size={12} /> Weaknesses
            </Badge>
          </h4>
          <ul className={styles.bullets}>
            {result.weaknesses.map((w, i) => (
              <li key={`w-${i}`}>{w}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.suggestions.length > 0 ? (
        <section className={styles.section}>
          <h4 className={styles.sectionLabel}>
            <Badge tone="neutral">
              <Icon name="wand" size={12} /> Suggestions
            </Badge>
          </h4>
          <ul className={styles.bullets}>
            {result.suggestions.map((s, i) => (
              <li key={`g-${i}`}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
