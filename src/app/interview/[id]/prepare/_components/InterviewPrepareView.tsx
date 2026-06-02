"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Notice } from "@/components/Notice";
import { FormMessage } from "@/components/FormMessage";
import { apiFetch } from "@/lib/apiClient";
import type { InterviewDto } from "@/types";
import styles from "./InterviewPrepareView.module.css";

type Props = { initial: InterviewDto };

export function InterviewPrepareView({ initial }: Props) {
  const router = useRouter();
  const [interview, setInterview] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  async function generateAnswers() {
    setLoading(true);
    setMessage("");
    try {
      const updated = await apiFetch<InterviewDto>(`/api/interview/${interview.id}/prepare`, {
        method: "POST",
      });
      setInterview(updated);
      setMessage("✅ Smart answers generated! Review them and click 'Ready to Start' when confident.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to generate answers");
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    try {
      await apiFetch(`/api/interview/${interview.id}/live`, {
        method: "POST",
      });
      router.push(`/interview/${interview.id}/record`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to start recording");
    }
  }

  const isPreparing = interview.status === "preparing";

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Interview Preparation</h1>
        <p className={styles.subtitle}>
          Review the questions and example answers to build confidence before recording.
        </p>
      </header>

      {interview.status === "pending" && (
        <Card>
          <div className={styles.form}>
            <h2 className={styles.sectionTitle}>Ready to prepare?</h2>
            <p className={styles.description}>
              We'll generate smart example answers for each question. This helps you understand the expected level of detail and build confidence.
            </p>
            <Notice>
              Generating {interview.questions.length} smart answers may take 30-60 seconds...
            </Notice>
            <FormMessage>{message}</FormMessage>
            <Button onClick={generateAnswers} disabled={loading}>
              {loading ? "⏳ Generating answers..." : "🚀 Generate Smart Answers"}
            </Button>
          </div>
        </Card>
      )}

      {isPreparing && (
        <Card>
          <div className={styles.form}>
            <h2 className={styles.sectionTitle}>Questions & Example Answers</h2>
            <p className={styles.description}>
              Study these questions and example answers. When you're ready, click "Ready to Start Recording" to begin the live interview.
            </p>

            <div className={styles.questionsList}>
              {interview.questions.map((q, i) => (
                <div key={i} className={styles.questionCard}>
                  <div
                    className={styles.questionHeader}
                    onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.questionMeta}>
                      <Badge tone="neutral">{q.category}</Badge>
                      <span className={styles.questionNumber}>Q{i + 1}/{interview.questions.length}</span>
                    </div>
                    <h3 className={styles.questionText}>{q.question}</h3>
                    <span className={styles.expandIcon}>
                      {expandedIdx === i ? "▼" : "▶"}
                    </span>
                  </div>

                  {expandedIdx === i && (
                    <div className={styles.answerSection}>
                      <div className={styles.answerLabel}>
                        💡 <strong>Example Answer:</strong>
                      </div>
                      <p className={styles.answerText}>{q.smartAnswer || "Loading..."}</p>
                      <div className={styles.answerTips}>
                        <p><strong>Tips:</strong></p>
                        <ul>
                          <li>Use this as a guide, not a script</li>
                          <li>Add your own specific examples</li>
                          <li>Speak naturally and confidently</li>
                          <li>Aim for 1-3 minutes per answer</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <FormMessage>{message}</FormMessage>

            <div className={styles.actions}>
              <Button onClick={() => router.back()}>← Back</Button>
              <Button onClick={startRecording} style={{ background: "var(--color-primary)" }}>
                🎥 Ready to Start Recording
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
