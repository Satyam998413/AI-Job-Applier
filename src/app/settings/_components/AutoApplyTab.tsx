"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { apiFetch } from "@/lib/apiClient";
import {
  USER_SETTINGS_DATE_FILTERS,
  USER_SETTINGS_EXPERIENCE_BUCKETS,
  type UserSettingsDto,
} from "@/types";
import styles from "./SettingsTabShared.module.css";

const DATE_LABEL: Record<(typeof USER_SETTINGS_DATE_FILTERS)[number], string> = {
  last24h: "Last 24 hours",
  last2d: "Last 2 days",
  last7d: "Last 7 days",
  last30d: "Last 30 days",
};

export function AutoApplyTab() {
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
        body: JSON.stringify({
          autoApplyEnabled: settings.autoApplyEnabled,
          applyLimit: settings.applyLimit,
          dateFilter: settings.dateFilter,
          includeKeywords: settings.includeKeywords,
          excludeKeywords: settings.excludeKeywords,
          locations: settings.locations,
          experienceBuckets: settings.experienceBuckets,
          salaryMin: settings.salaryMin,
        }),
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

  return (
    <Card>
      <div className={styles.form}>
        <h2 className={styles.sectionTitle}>Auto Apply</h2>
        <p className={styles.sectionDescription}>
          Daily cron uses these filters to pick jobs to draft for you. Submission still requires your click — Auto-Apply never sends an application on its own.
        </p>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={settings.autoApplyEnabled}
            onChange={(e) => setSettings({ ...settings, autoApplyEnabled: e.target.checked })}
          />
          <span className={styles.label}>Enable Auto Apply</span>
        </label>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Daily limit</span>
            <input
              className={styles.input}
              type="number"
              min={1}
              max={500}
              value={String(settings.applyLimit)}
              onChange={(e) => setSettings({ ...settings, applyLimit: Number(e.target.value) || 1 })}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Jobs posted within</span>
            <select
              className={styles.select}
              value={settings.dateFilter}
              onChange={(e) =>
                setSettings({ ...settings, dateFilter: e.target.value as UserSettingsDto["dateFilter"] })
              }
            >
              {USER_SETTINGS_DATE_FILTERS.map((d) => (
                <option key={d} value={d}>{DATE_LABEL[d]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Include keywords (comma-separated)</span>
          <input
            className={styles.input}
            value={settings.includeKeywords.join(", ")}
            onChange={(e) =>
              setSettings({ ...settings, includeKeywords: csvToList(e.target.value) })
            }
          />
          <span className={styles.hint}>e.g. Node.js, React, Backend, Remote</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Exclude keywords</span>
          <input
            className={styles.input}
            value={settings.excludeKeywords.join(", ")}
            onChange={(e) =>
              setSettings({ ...settings, excludeKeywords: csvToList(e.target.value) })
            }
          />
          <span className={styles.hint}>e.g. Senior, 10 years, Onsite</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Locations</span>
          <input
            className={styles.input}
            value={settings.locations.join(", ")}
            onChange={(e) => setSettings({ ...settings, locations: csvToList(e.target.value) })}
          />
          <span className={styles.hint}>e.g. Remote, India, USA, Hybrid</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Experience buckets</span>
          <div className={styles.row}>
            {USER_SETTINGS_EXPERIENCE_BUCKETS.map((bucket) => {
              const checked = settings.experienceBuckets.includes(bucket);
              return (
                <label key={bucket} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        experienceBuckets: checked
                          ? settings.experienceBuckets.filter((b) => b !== bucket)
                          : [...settings.experienceBuckets, bucket],
                      })
                    }
                  />
                  <span>{bucket}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Minimum annual salary</span>
          <input
            className={styles.input}
            type="number"
            min={0}
            value={settings.salaryMin === null ? "" : String(settings.salaryMin)}
            onChange={(e) =>
              setSettings({ ...settings, salaryMin: e.target.value === "" ? null : Number(e.target.value) })
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

function csvToList(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
