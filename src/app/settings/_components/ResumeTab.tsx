"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { Notice } from "@/components/Notice";
import { apiFetch } from "@/lib/apiClient";
import type { ResumeDto } from "@/types";
import styles from "./SettingsTabShared.module.css";

export function ResumeTab() {
  const [resumes, setResumes] = useState<ResumeDto[] | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      setResumes(await apiFetch<ResumeDto[]>("/api/resume/list"));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load");
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function setDefault(id: string) {
    setMessage("");
    try {
      await apiFetch(`/api/resume/${id}/default`, { method: "POST" });
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to set default");
    }
  }

  async function remove(id: string) {
    setMessage("");
    try {
      await apiFetch(`/api/resume/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (resumes === null) return <Card><Spinner /></Card>;

  return (
    <Card>
      <div className={styles.form}>
        <h2 className={styles.sectionTitle}>Resumes</h2>
        <p className={styles.sectionDescription}>
          The default resume is what matching, tailoring, cover letters, and interviews read.
          Upload a new resume on the{" "}
          <Link href="/resume">Resume page</Link>.
        </p>

        {resumes.length === 0 ? (
          <Notice>No resumes uploaded yet.</Notice>
        ) : (
          <div className={styles.resumeList}>
            {resumes.map((r) => (
              <div key={r.id} className={styles.resumeRow}>
                <div className={styles.resumeMeta}>
                  <div className={styles.resumeName}>
                    {r.fileName} {r.isDefault ? <Badge tone="success">Default</Badge> : null}
                  </div>
                  <span className={styles.hint}>
                    {r.skills.length} skills · {r.experienceYears}y experience · uploaded{" "}
                    {new Date(r.extractedAt).toLocaleDateString()}
                    {r.fileUrl ? (
                      <>
                        {" · "}
                        <a href={r.fileUrl} target="_blank" rel="noreferrer">View original</a>
                      </>
                    ) : null}
                  </span>
                </div>
                <div className={styles.resumeActions}>
                  {!r.isDefault && (
                    <Button onClick={() => setDefault(r.id)}>Set default</Button>
                  )}
                  {!r.isDefault && (
                    <Button onClick={() => remove(r.id)}>Delete</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <FormMessage>{message}</FormMessage>
      </div>
    </Card>
  );
}
