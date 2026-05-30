"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { apiFetch } from "@/lib/apiClient";
import type { UserSettingsDto } from "@/types";
import styles from "./SettingsTabShared.module.css";

export function AiInterviewTab() {
  const [settings, setSettings] = useState<UserSettingsDto | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<UserSettingsDto>("/api/user-settings")
      .then(setSettings)
      .catch((err) => setMessage(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    try {
      const next = await apiFetch<UserSettingsDto>("/api/user-settings", {
        method: "PATCH",
        body: JSON.stringify({ interviewDefaults: settings.interviewDefaults }),
      });
      setSettings(next);
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <Card><Spinner /></Card>;
  const d = settings.interviewDefaults;

  return (
    <Card>
      <div className={styles.form}>
        <h2 className={styles.sectionTitle}>AI Interview defaults</h2>
        <p className={styles.sectionDescription}>
          Defaults applied when you start a new AI Interview session. You can override per-session.
        </p>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Question count</span>
            <input
              className={styles.input}
              type="number"
              min={1}
              max={50}
              value={String(d.questionCount)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  interviewDefaults: { ...d, questionCount: Number(e.target.value) || 1 },
                })
              }
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Duration (minutes)</span>
            <input
              className={styles.input}
              type="number"
              min={5}
              max={180}
              value={String(d.durationMin)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  interviewDefaults: { ...d, durationMin: Number(e.target.value) || 5 },
                })
              }
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Language</span>
            <input
              className={styles.input}
              value={d.language}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  interviewDefaults: { ...d, language: e.target.value },
                })
              }
            />
            <span className={styles.hint}>ISO code (en, hi, es, …)</span>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Categories (comma-separated)</span>
          <input
            className={styles.input}
            value={d.categories.join(", ")}
            onChange={(e) =>
              setSettings({
                ...settings,
                interviewDefaults: {
                  ...d,
                  categories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                },
              })
            }
          />
          <span className={styles.hint}>e.g. behavioral, technical, rolespecific, culture</span>
        </div>

        <FormMessage>{message}</FormMessage>
        <div className={styles.actions}>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </Card>
  );
}
