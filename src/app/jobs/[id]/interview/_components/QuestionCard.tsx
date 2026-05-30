"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { InterviewCategory, InterviewQuestion, QnaSuggestResultDto } from "@/types";
import styles from "./QuestionCard.module.css";

const CATEGORY_LABEL: Record<InterviewCategory, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  rolespecific: "Role-specific",
  culture: "Culture fit",
  other: "Other",
};

const CATEGORY_TONE: Record<InterviewCategory, "success" | "warning" | "danger" | "neutral"> = {
  behavioral: "success",
  technical: "neutral",
  rolespecific: "warning",
  culture: "success",
  other: "neutral",
};

export function QuestionCard({
  jobId,
  index,
  question,
}: {
  jobId: string;
  index: number;
  question: InterviewQuestion;
}) {
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState<"saved" | "ai" | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [busy, setBusy] = useState<"" | "drafting" | "saving">("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function draft() {
    setBusy("drafting");
    setError("");
    setSaved(false);
    try {
      const result = await apiFetch<QnaSuggestResultDto>("/api/qna/suggest", {
        method: "POST",
        body: JSON.stringify({ question: question.question, jobId, includeAi: true }),
      });
      if (result.exact) {
        setAnswer(result.exact.answer);
        setSource("saved");
        setConfidence(1);
      } else if (result.suggestions[0] && result.suggestions[0].similarity >= 0.7) {
        setAnswer(result.suggestions[0].match.answer);
        setSource("saved");
        setConfidence(result.suggestions[0].similarity);
      } else if (result.aiAnswer) {
        setAnswer(result.aiAnswer);
        setSource("ai");
        setConfidence(null);
      } else {
        setError("No answer could be drafted yet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed");
    } finally {
      setBusy("");
    }
  }

  async function saveToLibrary() {
    if (!answer.trim()) return;
    setBusy("saving");
    setError("");
    try {
      await apiFetch("/api/qna", {
        method: "POST",
        body: JSON.stringify({
          question: question.question,
          answer,
          source: source ?? "saved",
          category: "interview",
        }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy("");
    }
  }

  async function copy() {
    if (!answer) return;
    await navigator.clipboard.writeText(answer);
  }

  return (
    <Card className={styles.card}>
      <header className={styles.head}>
        <span className={styles.index}>Q{index + 1}</span>
        <Badge tone={CATEGORY_TONE[question.category]}>{CATEGORY_LABEL[question.category]}</Badge>
        {confidence !== null && source === "saved" ? (
          <Badge tone="success">{Math.round(confidence * 100)}% library match</Badge>
        ) : null}
        {source === "ai" ? (
          <Badge tone="neutral">
            <Icon name="sparkles" size={11} /> AI draft
          </Badge>
        ) : null}
      </header>
      <p className={styles.question}>{question.question}</p>
      {question.rationale ? <p className={styles.rationale}>Why this might come up: {question.rationale}</p> : null}

      <div className={styles.actions}>
        {!answer ? (
          <Button variant="secondary" onClick={draft} disabled={busy !== ""}>
            <Icon name="wand" size={16} /> {busy === "drafting" ? "Drafting…" : "Draft an answer"}
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={draft} disabled={busy !== ""}>
              <Icon name="wand" size={16} /> {busy === "drafting" ? "Re-drafting…" : "Re-draft"}
            </Button>
            <Button variant="secondary" onClick={copy} disabled={busy !== ""}>
              Copy
            </Button>
            <Button onClick={saveToLibrary} disabled={busy !== "" || saved}>
              <Icon name="check" size={16} /> {saved ? "Saved" : busy === "saving" ? "Saving…" : "Save to library"}
            </Button>
          </>
        )}
      </div>

      {busy === "drafting" ? <Spinner label="Drafting your answer…" /> : null}
      <FormMessage>{error}</FormMessage>

      {answer ? (
        <div className={styles.field}>
          <label htmlFor={`a-${index}`} className={styles.label}>Your answer (editable)</label>
          <textarea
            id={`a-${index}`}
            className={styles.textarea}
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setSaved(false);
            }}
            rows={6}
          />
        </div>
      ) : null}
    </Card>
  );
}
