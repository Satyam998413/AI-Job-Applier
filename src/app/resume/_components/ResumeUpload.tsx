"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { ResumeDto } from "@/types";
import styles from "./ResumeUpload.module.css";

export function ResumeUpload({
  onParsed,
  hasResume,
}: {
  onParsed: (resume: ResumeDto) => void;
  hasResume: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a PDF, DOCX, TXT, MD, HTML, or RTF file first.");
      return;
    }
    setError("");
    setLoading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const resume = await apiFetch<ResumeDto>("/api/resume", { method: "POST", body });
      onParsed(resume);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={[styles.dropzone, fileName ? styles.active : ""].join(" ")}>
          <span className={styles.icon}>
            <Icon name={fileName ? "document" : "upload"} size={26} />
          </span>
          <span className={styles.dropTitle}>
            {fileName || (hasResume ? "Click to replace your resume" : "Click to choose a resume (PDF, DOCX, TXT, MD, HTML, RTF)")}
          </span>
          <span className={styles.dropHint}>AI extracts your skills, summary, and experience.</span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.markdown,.html,.htm,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/html,application/rtf"
            className={styles.input}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
        <FormMessage>{error}</FormMessage>
        {loading ? (
          <Spinner label="Reading your resume with AI…" />
        ) : (
          <Button type="submit">
            <Icon name="sparkles" size={18} /> {hasResume ? "Re-analyze resume" : "Upload & analyze"}
          </Button>
        )}
      </form>
    </Card>
  );
}
