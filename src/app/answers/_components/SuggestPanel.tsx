"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Spinner } from "@/components/Spinner";
import { FormMessage } from "@/components/FormMessage";
import { Notice } from "@/components/Notice";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { QnaDto, QnaSuggestResultDto } from "@/types";
import styles from "./SuggestPanel.module.css";

function confidenceLabel(similarity: number): { label: string; tone: "success" | "warning" | "danger" } {
  if (similarity >= 0.999) return { label: "Exact match", tone: "success" };
  if (similarity >= 0.8) return { label: `${Math.round(similarity * 100)}% match`, tone: "success" };
  if (similarity >= 0.65) return { label: `${Math.round(similarity * 100)}% match`, tone: "warning" };
  return { label: `${Math.round(similarity * 100)}% match`, tone: "danger" };
}

export function SuggestPanel({
  hasResume,
  onSaved,
}: {
  hasResume: boolean;
  onSaved: (q: QnaDto) => void;
}) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QnaSuggestResultDto | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [savingAi, setSavingAi] = useState(false);

  async function suggest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const r = await apiFetch<QnaSuggestResultDto>("/api/qna/suggest", {
        method: "POST",
        body: JSON.stringify({ question, includeAi: hasResume }),
      });
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suggest failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveAiAnswer() {
    if (!result?.aiAnswer || !question.trim()) return;
    setSavingAi(true);
    setError("");
    try {
      const saved = await apiFetch<QnaDto>("/api/qna", {
        method: "POST",
        body: JSON.stringify({ question, answer: result.aiAnswer, source: "ai" }),
      });
      onSaved(saved);
      setResult({ ...result, exact: saved });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSavingAi(false);
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="wand" size={18} /> Try a question
        </h2>
        <p className={styles.subtitle}>
          Paste any application question. We&apos;ll surface your saved answers and (if you have a
          resume) draft a personalized AI answer.
        </p>
      </header>
      <form className={styles.form} onSubmit={suggest}>
        <Input
          id="suggest-question"
          label="Application question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          minLength={3}
          placeholder='e.g. "Tell me about a project you led."'
        />
        <FormMessage>{error}</FormMessage>
        <div>
          <Button type="submit" disabled={busy}>
            {busy ? "Searching + drafting…" : "Suggest answers"}
          </Button>
        </div>
      </form>

      {busy ? <Spinner label={hasResume ? "Searching + drafting…" : "Searching saved answers…"} /> : null}

      {result ? (
        <div className={styles.results}>
          {result.suggestions.length === 0 && !result.aiAnswer ? (
            <Notice>No saved match yet. {hasResume ? null : "Upload a resume to enable AI drafts."}</Notice>
          ) : null}

          {result.exact ? (
            <Notice>
              <strong>Exact match found</strong> — usage promoted. Copy below.
            </Notice>
          ) : null}

          {result.suggestions.map((s) => {
            const conf = confidenceLabel(s.similarity);
            return (
              <div key={s.match.id} className={styles.suggestion}>
                <div className={styles.suggestHead}>
                  <Badge tone={conf.tone}>{conf.label}</Badge>
                  <span className={styles.qLabel}>{s.match.question}</span>
                </div>
                <p className={styles.answer}>{s.match.answer}</p>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => copy(s.match.answer)}>
                    Copy
                  </Button>
                </div>
              </div>
            );
          })}

          {result.aiAnswer ? (
            <div className={[styles.suggestion, styles.ai].join(" ")}>
              <div className={styles.suggestHead}>
                <Badge tone="neutral">
                  <Icon name="sparkles" size={12} /> AI draft
                </Badge>
                <span className={styles.qLabel}>Personalized from your resume{result.exact ? " + saved" : ""}</span>
              </div>
              <p className={styles.answer}>{result.aiAnswer}</p>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => copy(result.aiAnswer!)}>
                  Copy
                </Button>
                {!result.exact ? (
                  <Button onClick={saveAiAnswer} disabled={savingAi}>
                    {savingAi ? "Saving…" : "Save to library"}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!hasResume ? (
        <Notice tone="warning">
          Upload a resume on the Resume page to enable AI-drafted answers grounded in your experience.
        </Notice>
      ) : null}
    </Card>
  );
}
