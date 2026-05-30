import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Notice } from "@/components/Notice";
import type { PublicInterviewDto } from "@/types";
import styles from "./PublicInterviewSummary.module.css";

export function PublicInterviewSummary({ data }: { data: PublicInterviewDto }) {
  if (data.status !== "scored") {
    return (
      <main className={styles.wrap}>
        <Notice>This interview is still being scored. Check back shortly.</Notice>
      </main>
    );
  }
  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>{data.candidateName}</h1>
        {data.jobTitle && (
          <p className={styles.subtitle}>
            Mock interview for {data.jobTitle}
            {data.jobCompany ? ` at ${data.jobCompany}` : ""}
          </p>
        )}
        {data.completedAt && (
          <p className={styles.completedAt}>
            Completed {new Date(data.completedAt).toLocaleDateString()}
          </p>
        )}
      </header>

      <Card>
        <h2 className={styles.sectionTitle}>Scores</h2>
        <ul className={styles.scores}>
          <li><span className={styles.scoreLabel}>Overall</span><strong>{Math.round(data.scores.overall ?? 0)}</strong></li>
          <li><span className={styles.scoreLabel}>Communication</span><strong>{Math.round(data.scores.communication ?? 0)}</strong></li>
          <li><span className={styles.scoreLabel}>Technical</span><strong>{Math.round(data.scores.technical ?? 0)}</strong></li>
          <li><span className={styles.scoreLabel}>Confidence</span><strong>{Math.round(data.scores.confidence ?? 0)}</strong></li>
        </ul>

        {data.scores.rubric.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>Rubric notes</h3>
            <ul className={styles.rubric}>
              {data.scores.rubric.map((r, i) => (
                <li key={i}>
                  <strong>{r.criterion}</strong> <Badge tone="neutral">{r.score}</Badge>
                  <span> — {r.comment}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <h2 className={styles.sectionTitle}>Question transcript</h2>
        <ol className={styles.questions}>
          {data.questions.map((q, i) => (
            <li key={i}>
              <div className={styles.questionMeta}>
                <Badge tone="neutral">{q.category}</Badge>
              </div>
              <div className={styles.questionText}>{q.question}</div>
              {q.transcript && <p className={styles.answer}><strong>Verbal:</strong> {q.transcript}</p>}
              {q.codeSubmission && (
                <pre className={styles.code}>{q.codeSubmission}</pre>
              )}
              {!q.transcript && !q.codeSubmission && (
                <p className={styles.muted}>(no answer recorded)</p>
              )}
            </li>
          ))}
        </ol>
      </Card>
    </main>
  );
}
