"use client";

import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { QnaItem } from "./QnaItem";
import type { QnaDto } from "@/types";
import styles from "./QnaList.module.css";

export function QnaList({
  items,
  onUpdated,
  onDeleted,
}: {
  items: QnaDto[];
  onUpdated: (q: QnaDto) => void;
  onDeleted: (id: string) => void;
}) {
  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="briefcase" size={18} /> Your library
        </h2>
        <span className={styles.count}>{items.length}</span>
      </header>
      {items.length === 0 ? (
        <p className={styles.empty}>
          Nothing saved yet. Add answers above or save AI drafts after suggesting.
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((qna) => (
            <QnaItem key={qna.id} qna={qna} onUpdated={onUpdated} onDeleted={onDeleted} />
          ))}
        </ul>
      )}
    </Card>
  );
}
