"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { FormMessage } from "@/components/FormMessage";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { AtsResultDto } from "@/types";
import { AtsResultPanel } from "./AtsResultPanel";
import styles from "./AtsCheckPanel.module.css";

export type AtsJobOption = { id: string; title: string; company: string };

type Mode = "general" | "job";

export function AtsCheckPanel({ jobs }: { jobs: AtsJobOption[] }) {
  const [mode, setMode] = useState<Mode>(jobs.length > 0 ? "job" : "general");
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [result, setResult] = useState<AtsResultDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      const next = await apiFetch<AtsResultDto>("/api/resume/ats", {
        method: "POST",
        body: JSON.stringify(mode === "job" && jobId ? { jobId } : {}),
      });
      setResult(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ATS check failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="shield" size={18} /> ATS readiness check
        </h2>
        <p className={styles.subtitle}>
          Get a calibrated, AI-graded score on how well your resume will land with applicant tracking
          systems — overall, or targeted at a specific job.
        </p>
      </header>

      <div className={styles.controls}>
        <div className={styles.modeRow} role="tablist" aria-label="Check mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "general"}
            className={[styles.modeBtn, mode === "general" ? styles.modeActive : ""].join(" ")}
            onClick={() => setMode("general")}
          >
            <Icon name="document" size={16} /> General
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "job"}
            disabled={jobs.length === 0}
            className={[styles.modeBtn, mode === "job" ? styles.modeActive : ""].join(" ")}
            onClick={() => setMode("job")}
          >
            <Icon name="target" size={16} /> Targeted at job
          </button>
        </div>

        {mode === "job" ? (
          <div className={styles.field}>
            <label htmlFor="ats-job" className={styles.label}>Job</label>
            <select
              id="ats-job"
              className={styles.select}
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            >
              {jobs.length === 0 ? (
                <option value="">No jobs yet — search on Jobs page</option>
              ) : null}
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <Button onClick={run} disabled={busy || (mode === "job" && !jobId)}>
            <Icon name="sparkles" size={16} /> {busy ? "Scoring…" : "Run ATS check"}
          </Button>
        </div>
      </div>

      <FormMessage>{error}</FormMessage>

      {busy ? <Spinner label="Scoring your resume…" /> : null}

      {result ? (
        <div className={styles.result}>
          <AtsResultPanel result={result} />
        </div>
      ) : null}
    </Card>
  );
}
