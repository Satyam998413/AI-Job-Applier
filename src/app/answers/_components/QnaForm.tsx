"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { QnaDto } from "@/types";
import styles from "./QnaForm.module.css";

export function QnaForm({ onSaved }: { onSaved: (q: QnaDto) => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const saved = await apiFetch<QnaDto>("/api/qna", {
        method: "POST",
        body: JSON.stringify({
          question,
          answer,
          category: category || undefined,
          source: "saved",
        }),
      });
      onSaved(saved);
      setQuestion("");
      setAnswer("");
      setCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="document" size={18} /> Save a new answer
        </h2>
        <p className={styles.subtitle}>
          Capture answers you already know — they&apos;ll be auto-suggested next time the same
          question shows up.
        </p>
      </header>
      <form className={styles.form} onSubmit={submit}>
        <Input
          id="qna-question"
          label="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          minLength={3}
          placeholder='e.g. "Why are you interested in this role?"'
        />
        <div className={styles.field}>
          <label htmlFor="qna-answer" className={styles.label}>Answer</label>
          <textarea
            id="qna-answer"
            className={styles.textarea}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            required
            placeholder="Type your answer here…"
          />
        </div>
        <Input
          id="qna-category"
          label="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="general, salary, motivation…"
        />
        <FormMessage>{error}</FormMessage>
        <div>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save answer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
