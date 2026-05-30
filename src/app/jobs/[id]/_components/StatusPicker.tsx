"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { FormMessage } from "@/components/FormMessage";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import { MATCH_STATUSES, type MatchDto, type MatchStatus } from "@/types";
import styles from "./StatusPicker.module.css";

export const STATUS_LABEL: Record<MatchStatus, string> = {
  new: "New",
  tailored: "Tailored",
  applied: "Applied",
  responded: "Responded",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_TONE: Record<MatchStatus, "neutral" | "success" | "warning" | "danger"> = {
  new: "neutral",
  tailored: "neutral",
  applied: "success",
  responded: "success",
  interview: "warning",
  offer: "success",
  rejected: "danger",
  withdrawn: "neutral",
};

export function StatusPicker({
  jobId,
  initialStatus,
  onChange,
}: {
  jobId: string;
  initialStatus: MatchStatus;
  onChange?: (match: MatchDto) => void;
}) {
  const [status, setStatus] = useState<MatchStatus>(initialStatus);
  const [pending, setPending] = useState<MatchStatus>(initialStatus);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const dirty = pending !== status || note.trim().length > 0;

  async function save() {
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const match = await apiFetch<MatchDto>(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: pending, note: note.trim() || undefined }),
      });
      setStatus(match.status);
      setPending(match.status);
      setNote("");
      setInfo(`Moved to ${STATUS_LABEL[match.status]}.`);
      onChange?.(match);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="target" size={18} /> Application status
        </h2>
        <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      </header>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="next-status" className={styles.label}>Move to</label>
          <select
            id="next-status"
            className={styles.select}
            value={pending}
            onChange={(e) => setPending(e.target.value as MatchStatus)}
          >
            {MATCH_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="status-note" className={styles.label}>Note (optional)</label>
          <input
            id="status-note"
            className={styles.input}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='"Recruiter screen with Anna on Thu"'
            maxLength={280}
          />
        </div>
        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? "Saving…" : "Update"}
        </Button>
      </div>
      {info ? <FormMessage tone="info">{info}</FormMessage> : null}
      <FormMessage>{error}</FormMessage>
    </Card>
  );
}
