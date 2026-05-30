"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { apiFetch } from "@/lib/apiClient";
import type { UserSettingsDto } from "@/types";
import styles from "./SettingsTabShared.module.css";

export function EmailTemplatesTab() {
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
        body: JSON.stringify({ emailTemplates: settings.emailTemplates }),
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
  const t = settings.emailTemplates;

  return (
    <Card>
      <div className={styles.form}>
        <h2 className={styles.sectionTitle}>Email templates</h2>
        <p className={styles.sectionDescription}>
          Reusable bodies for recruiter outreach and follow-ups. Use{" "}
          <code>{"{{candidateName}}"}</code>, <code>{"{{jobTitle}}"}</code>, <code>{"{{jobCompany}}"}</code>{" "}
          as placeholders.
        </p>

        <div className={styles.field}>
          <span className={styles.label}>Recruiter outreach</span>
          <textarea
            className={styles.textarea}
            value={t.recruiter}
            onChange={(e) =>
              setSettings({ ...settings, emailTemplates: { ...t, recruiter: e.target.value } })
            }
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Follow-up</span>
          <textarea
            className={styles.textarea}
            value={t.followUp}
            onChange={(e) =>
              setSettings({ ...settings, emailTemplates: { ...t, followUp: e.target.value } })
            }
          />
        </div>

        <FormMessage>{message}</FormMessage>
        <div className={styles.actions}>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </Card>
  );
}
