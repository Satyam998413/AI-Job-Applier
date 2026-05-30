"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/Input";
import { FormMessage } from "@/components/FormMessage";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { QnaDto } from "@/types";
import styles from "./QnaItem.module.css";

export function QnaItem({
  qna,
  onUpdated,
  onDeleted,
}: {
  qna: QnaDto;
  onUpdated: (q: QnaDto) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(qna.question);
  const [answer, setAnswer] = useState(qna.answer);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      const next = await apiFetch<QnaDto>(`/api/qna/${qna.id}`, {
        method: "PATCH",
        body: JSON.stringify({ question, answer }),
      });
      onUpdated(next);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/api/qna/${qna.id}`, { method: "DELETE" });
      onDeleted(qna.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }

  return (
    <li className={styles.item}>
      <div className={styles.head}>
        <Badge tone={qna.source === "ai" ? "neutral" : "success"}>
          {qna.source === "ai" ? (
            <>
              <Icon name="sparkles" size={11} /> AI
            </>
          ) : (
            "Saved"
          )}
        </Badge>
        <span className={styles.category}>{qna.category}</span>
        <span className={styles.meta}>used {qna.usageCount}×</span>
      </div>
      {editing ? (
        <div className={styles.editor}>
          <Input
            id={`q-${qna.id}`}
            label="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <div className={styles.field}>
            <label htmlFor={`a-${qna.id}`} className={styles.label}>Answer</label>
            <textarea
              id={`a-${qna.id}`}
              className={styles.textarea}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              required
            />
          </div>
          <FormMessage>{error}</FormMessage>
          <div className={styles.actions}>
            <Button onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h3 className={styles.question}>{qna.question}</h3>
          <p className={styles.answer}>{qna.answer}</p>
          <FormMessage>{error}</FormMessage>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setEditing(true)} disabled={busy}>
              Edit
            </Button>
            <Button variant="ghost" onClick={remove} disabled={busy}>
              Delete
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
