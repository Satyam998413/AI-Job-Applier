import Link from "next/link";
import { Card } from "@/components/Card";
import { Reveal } from "@/components/Reveal";
import { Notice } from "@/components/Notice";
import { Icon } from "@/components/Icon";
import type { InterviewQuestion, JobDto } from "@/types";
import { GeneratePrepButton } from "./GeneratePrepButton";
import { QuestionCard } from "./QuestionCard";
import styles from "./InterviewPrepView.module.css";

export function InterviewPrepView({
  job,
  questions,
  generatedAt,
  hasResume,
}: {
  job: JobDto;
  questions: InterviewQuestion[];
  generatedAt: string | null;
  hasResume: boolean;
}) {
  return (
    <div className={styles.wrap}>
      <Link href={`/jobs/${job.id}`} className={styles.back}>
        <Icon name="arrowRight" size={16} /> Back to job
      </Link>

      <Reveal>
        <header className={styles.header}>
          <h1 className={styles.title}>Interview prep</h1>
          <p className={styles.subtitle}>
            <strong>{job.title}</strong> — {job.company}
            {generatedAt ? (
              <span className={styles.timestamp}> · last generated {new Date(generatedAt).toLocaleString()}</span>
            ) : null}
          </p>
        </header>
      </Reveal>

      {!hasResume ? (
        <Notice tone="warning">
          Upload a resume on the <Link href="/resume">Resume</Link> page first — questions are grounded in your experience.
        </Notice>
      ) : null}

      <Reveal delay={80}>
        <Card>
          <div className={styles.cta}>
            <div>
              <h2 className={styles.ctaTitle}>
                <Icon name="sparkles" size={18} /> {questions.length === 0 ? "Generate your question set" : "Already have a set"}
              </h2>
              <p className={styles.ctaSubtitle}>
                AI builds 8–12 likely questions for this role using your resume + the job description.
                Behavioral, technical, role-specific, and culture-fit, each with a rationale.
              </p>
            </div>
            <GeneratePrepButton jobId={job.id} hasPrep={questions.length > 0} hasResume={hasResume} />
          </div>
        </Card>
      </Reveal>

      {questions.length > 0 ? (
        <div className={styles.list}>
          {questions.map((q, i) => (
            <Reveal key={`${q.category}-${i}`} delay={Math.min(120 + i * 50, 480)}>
              <QuestionCard jobId={job.id} index={i} question={q} />
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}
