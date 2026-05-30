"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { Notice } from "@/components/Notice";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { ConnectedEmailDto, EmailSendResultDto } from "@/types";
import styles from "./EmailComposerView.module.css";

export type ComposerJob = { id: string; title: string; company: string };

type Mode = "outreach" | "test";

type Draft = { subject: string; body: string };

export function EmailComposerView({ jobs, hasResume }: { jobs: ComposerJob[]; hasResume: boolean }) {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") ?? (jobs[0]?.id ?? "");
  const [mode, setMode] = useState<Mode>("outreach");
  const [conn, setConn] = useState<ConnectedEmailDto | null>(null);
  const [jobId, setJobId] = useState(initialJobId);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [attachResume, setAttachResume] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void apiFetch<ConnectedEmailDto>("/api/nylas").then(setConn).catch(() => setConn(null));
  }, []);

  async function draftWithAi() {
    if (!jobId) {
      setError("Pick a job first.");
      return;
    }
    setDrafting(true);
    setError("");
    setSuccess("");
    try {
      const draft = await apiFetch<Draft>("/api/nylas/draft", {
        method: "POST",
        body: JSON.stringify({ jobId, recipientName: recipientName || undefined, notes: notes || undefined }),
      });
      setSubject(draft.subject);
      setBody(draft.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Drafting failed");
    } finally {
      setDrafting(false);
    }
  }

  async function send() {
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch<EmailSendResultDto>("/api/nylas/send", {
        method: "POST",
        body: JSON.stringify({
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          body,
          jobId: mode === "outreach" ? jobId : undefined,
          attachResume: mode === "outreach" ? attachResume : false,
          mode: mode === "test" ? "test" : "compose",
        }),
      });
      setSuccess(`Email sent${result.messageId ? ` (id ${result.messageId.slice(0, 10)}…)` : ""}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  const composerDisabled = !conn?.configured || conn.syncStatus !== "active";

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Outreach &amp; email</h1>
        <p className={styles.subtitle}>
          Draft a personalized application email with AI, edit it, and send via your connected Google account.
        </p>
      </header>

      {!conn ? <Spinner label="Checking connection…" /> : null}
      {conn && !conn.nylasConfigured ? (
        <Notice tone="warning">
          Server isn&apos;t configured for Nylas yet. Configure NYLAS keys and restart, then return here.
        </Notice>
      ) : null}
      {conn && conn.nylasConfigured && !conn.configured ? (
        <Notice tone="warning">
          Connect your Google email in <Link href="/settings">Settings</Link> to send messages.
        </Notice>
      ) : null}
      {conn?.configured ? (
        <div className={styles.connInfo}>
          <Badge tone="success">
            <Icon name="check" size={12} /> Sending from {conn.emailAddress}
          </Badge>
        </div>
      ) : null}

      <Card>
        <div className={styles.modeRow} role="tablist" aria-label="Compose mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "outreach"}
            className={[styles.modeBtn, mode === "outreach" ? styles.modeActive : ""].join(" ")}
            onClick={() => setMode("outreach")}
          >
            <Icon name="wand" size={16} /> Job outreach
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "test"}
            className={[styles.modeBtn, mode === "test" ? styles.modeActive : ""].join(" ")}
            onClick={() => setMode("test")}
          >
            <Icon name="bolt" size={16} /> Test send
          </button>
        </div>

        {mode === "outreach" ? (
          <div className={styles.outreachBlock}>
            {!hasResume ? (
              <Notice tone="warning">
                Upload a resume on the <Link href="/resume">Resume</Link> page to enable AI drafts.
              </Notice>
            ) : null}
            <div className={styles.field}>
              <label htmlFor="job" className={styles.label}>Job</label>
              <select
                id="job"
                className={styles.select}
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              >
                {jobs.length === 0 ? <option value="">No jobs yet — search on Jobs page</option> : null}
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.row2}>
              <Input
                id="recipientName"
                label="Recipient name (optional)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Hiring manager"
              />
              <Input
                id="notes"
                label="Notes for AI (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything specific to mention?"
              />
            </div>
            <div>
              <Button variant="secondary" onClick={draftWithAi} disabled={drafting || !hasResume || !jobId}>
                <Icon name="sparkles" size={16} /> {drafting ? "Drafting…" : "Draft with AI"}
              </Button>
            </div>
          </div>
        ) : null}

        <div className={styles.form}>
          <Input
            id="to"
            label="To (comma-separated)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="someone@company.com"
            required
          />
          <div className={styles.row2}>
            <Input id="cc" label="CC (optional)" value={cc} onChange={(e) => setCc(e.target.value)} />
            <Input id="bcc" label="BCC (optional)" value={bcc} onChange={(e) => setBcc(e.target.value)} />
          </div>
          <Input
            id="subject"
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <div className={styles.field}>
            <label htmlFor="body" className={styles.label}>Body</label>
            <textarea
              id="body"
              className={styles.textarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              required
              placeholder="Write or click 'Draft with AI'…"
            />
          </div>
          {mode === "outreach" ? (
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={attachResume}
                onChange={(e) => setAttachResume(e.target.checked)}
              />
              <span>Attach my tailored resume for this job</span>
            </label>
          ) : null}
          <FormMessage>{error}</FormMessage>
          {success ? <FormMessage tone="info">{success}</FormMessage> : null}
          <div>
            <Button onClick={send} disabled={sending || composerDisabled || !to || !subject || !body}>
              <Icon name="arrowRight" size={16} /> {sending ? "Sending…" : mode === "test" ? "Send test" : "Send email"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
