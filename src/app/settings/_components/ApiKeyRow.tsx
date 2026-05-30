"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { ApiKeySetForm } from "./ApiKeySetForm";
import styles from "./ApiKeyRow.module.css";

export type ApiKeyRowProps = {
  label: string;
  description: string;
  configured: boolean;
  lastFour: string | null;
  isActive: boolean;
  showActivate: boolean;
  busy: boolean;
  onSave: (apiKey: string) => Promise<void>;
  onActivate: () => Promise<void>;
  onDelete: () => Promise<void>;
};

export function ApiKeyRow({
  label,
  description,
  configured,
  lastFour,
  isActive,
  showActivate,
  busy,
  onSave,
  onActivate,
  onDelete,
}: ApiKeyRowProps) {
  const [editing, setEditing] = useState(false);

  async function handleSave(apiKey: string) {
    await onSave(apiKey);
    setEditing(false);
  }

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <div className={styles.head}>
          <span className={styles.label}>{label}</span>
          {isActive ? (
            <Badge tone="success">
              <Icon name="check" size={12} /> Active
            </Badge>
          ) : configured ? (
            <Badge tone="neutral">Configured</Badge>
          ) : null}
        </div>
        <p className={styles.desc}>{description}</p>
        {configured && lastFour ? (
          <span className={styles.mask}>•••• {lastFour}</span>
        ) : null}
      </div>
      <div className={styles.actions}>
        {!editing ? (
          <>
            <Button variant="secondary" onClick={() => setEditing(true)} disabled={busy}>
              {configured ? "Replace key" : "Add key"}
            </Button>
            {configured && showActivate && !isActive ? (
              <Button variant="ghost" onClick={onActivate} disabled={busy}>
                Activate
              </Button>
            ) : null}
            {configured ? (
              <Button variant="ghost" onClick={onDelete} disabled={busy}>
                Remove
              </Button>
            ) : null}
          </>
        ) : (
          <ApiKeySetForm
            label={label}
            busy={busy}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        )}
      </div>
    </div>
  );
}
