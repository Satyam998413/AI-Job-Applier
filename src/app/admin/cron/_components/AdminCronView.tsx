"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Notice } from "@/components/Notice";
import { Reveal } from "@/components/Reveal";
import type { CronRunDto, CronStatus } from "@/types";
import styles from "./AdminCronView.module.css";

const STATUS_TONE: Record<CronStatus, "success" | "warning" | "danger" | "neutral"> = {
  succeeded: "success",
  partial: "warning",
  failed: "danger",
  running: "neutral",
  pending: "neutral",
};

export function AdminCronView({ runs }: { runs: CronRunDto[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className={styles.wrap}>
      <Reveal>
        <header className={styles.header}>
          <h1 className={styles.title}>Cron Logs</h1>
          <p className={styles.subtitle}>
            Last 100 scheduled runs. Per-user stats live in Sentry / database queries;
            this view shows job-level success and failure summaries.
          </p>
        </header>
      </Reveal>

      <Reveal delay={80}>
        <Card>
          {runs.length === 0 ? (
            <Notice>No cron runs recorded yet.</Notice>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Users</th>
                  <th>Duration</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => {
                  const duration =
                    r.startedAt && r.completedAt
                      ? `${Math.round((new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)}s`
                      : "—";
                  const hasErrors = r.errors.length > 0;
                  return (
                    <tbody key={r.id} className={styles.rowGroup}>
                      <tr className={styles.row}>
                        <td className={styles.job}>{r.job}</td>
                        <td>{new Date(r.scheduledAt).toLocaleString()}</td>
                        <td><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                        <td>{r.userCount}</td>
                        <td>{duration}</td>
                        <td>
                          {hasErrors && (
                            <button
                              className={styles.expand}
                              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                            >
                              {expanded === r.id ? "Hide" : `${r.errors.length} error${r.errors.length === 1 ? "" : "s"}`}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expanded === r.id && (
                        <tr className={styles.errorsRow}>
                          <td colSpan={6}>
                            <ul className={styles.errors}>
                              {r.errors.map((e, i) => (
                                <li key={i}>
                                  <span className={styles.errorUser}>{e.userId ?? "—"}</span>
                                  {e.message}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
