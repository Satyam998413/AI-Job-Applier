"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SuggestPanel } from "./SuggestPanel";
import { QnaForm } from "./QnaForm";
import { QnaList } from "./QnaList";
import type { QnaDto } from "@/types";
import styles from "./AnswersView.module.css";

export function AnswersView({
  initialItems,
  hasResume,
}: {
  initialItems: QnaDto[];
  hasResume: boolean;
}) {
  const [items, setItems] = useState<QnaDto[]>(initialItems);

  function upsert(qna: QnaDto) {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === qna.id);
      if (i === -1) return [qna, ...prev];
      const next = [...prev];
      next[i] = qna;
      return next;
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className={styles.wrap}>
      <Reveal>
        <header className={styles.header}>
          <h1 className={styles.title}>Saved answers</h1>
          <p className={styles.subtitle}>
            Build a personal library of answers. Auto-detect repeated questions and let AI draft new ones
            from your resume + the job.
          </p>
        </header>
      </Reveal>
      <Reveal delay={80}>
        <SuggestPanel hasResume={hasResume} onSaved={upsert} />
      </Reveal>
      <Reveal delay={160}>
        <QnaForm onSaved={upsert} />
      </Reveal>
      <Reveal delay={240}>
        <QnaList items={items} onUpdated={upsert} onDeleted={remove} />
      </Reveal>
    </div>
  );
}
