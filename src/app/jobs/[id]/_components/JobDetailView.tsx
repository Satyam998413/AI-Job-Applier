"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { Spinner } from "@/components/Spinner";
import { FormMessage } from "@/components/FormMessage";
import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { JobDto, MatchDto } from "@/types";
import { JobInfo } from "./JobInfo";
import { MatchPanel } from "./MatchPanel";
import { ArtifactCard } from "./ArtifactCard";
import { StatusPicker, STATUS_LABEL, STATUS_TONE } from "./StatusPicker";
import styles from "./JobDetailView.module.css";

type Busy = "idle" | "matching" | "tailoring" | "coverLetter" | "applying";

const BUSY_LABEL: Record<Exclude<Busy, "idle">, string> = {
  matching: "Scoring your match with AI…",
  tailoring: "Tailoring your resume with AI…",
  coverLetter: "Drafting your cover letter with AI…",
  applying: "Recording application…",
};

export function JobDetailView({
  job,
  initialMatch,
  hasResume,
}: {
  job: JobDto;
  initialMatch: MatchDto | null;
  hasResume: boolean;
}) {
  const [match, setMatch] = useState<MatchDto | null>(initialMatch);
  const [busy, setBusy] = useState<Busy>("idle");
  const [error, setError] = useState("");

  const applied = match?.status === "applied";

  async function run(action: Exclude<Busy, "idle">, path: string) {
    setBusy(action);
    setError("");
    try {
      setMatch(await apiFetch<MatchDto>(path, { method: "POST" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy("idle");
    }
  }

  function apply() {
    // Open the real posting in the user's click gesture (avoids popup blocking), then record it.
    if (job.url) window.open(job.url, "_blank", "noopener,noreferrer");
    void run("applying", `/api/jobs/${job.id}/apply`);
  }

  return (
    <div className={styles.wrap}>
      <Link href="/jobs" className={styles.back}>
        <Icon name="arrowRight" size={16} /> Back to jobs
      </Link>

      <Reveal>
        <JobInfo job={job} />
      </Reveal>

      <div className={styles.actions}>
        {hasResume ? (
          <>
            <Button onClick={() => run("matching", `/api/jobs/${job.id}/match`)} disabled={busy !== "idle"}>
              <Icon name="target" size={18} /> {match?.score !== null && match ? "Recompute match" : "Compute match"}
            </Button>
            {match ? (
              <Button
                variant="secondary"
                onClick={() => run("tailoring", `/api/jobs/${job.id}/tailor`)}
                disabled={busy !== "idle"}
              >
                <Icon name="wand" size={18} /> {match.tailoredResume ? "Regenerate resume" : "Tailor my resume"}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => run("coverLetter", `/api/jobs/${job.id}/cover-letter`)}
              disabled={busy !== "idle"}
            >
              <Icon name="document" size={18} />{" "}
              {match?.coverLetter ? "Regenerate cover letter" : "Draft cover letter"}
            </Button>
          </>
        ) : null}
        {job.url ? (
          <Button variant={applied ? "ghost" : "secondary"} onClick={apply} disabled={busy !== "idle"}>
            <Icon name={applied ? "check" : "arrowRight"} size={18} />{" "}
            {applied ? "Applied — open posting" : "Apply on site"}
          </Button>
        ) : null}
        {hasResume ? (
          <Button href={`/email?jobId=${job.id}`} variant="secondary">
            <Icon name="bolt" size={18} /> Compose outreach
          </Button>
        ) : null}
        {hasResume ? (
          <Button href={`/jobs/${job.id}/interview`} variant="secondary">
            <Icon name="sparkles" size={18} /> Practice interview
          </Button>
        ) : null}
        {match ? (
          <Badge tone={STATUS_TONE[match.status]}>
            <Icon name="target" size={13} /> {STATUS_LABEL[match.status]}
          </Badge>
        ) : null}
      </div>

      {!hasResume ? (
        <Notice tone="warning">
          Upload a resume on the <Link href="/resume">Resume</Link> page to score, tailor, and draft outreach for this job.
        </Notice>
      ) : null}

      {busy !== "idle" ? <Spinner label={BUSY_LABEL[busy]} /> : null}
      <FormMessage>{error}</FormMessage>

      <Reveal variant="scale">
        <StatusPicker jobId={job.id} initialStatus={match?.status ?? "new"} onChange={setMatch} />
      </Reveal>

      {match && match.score !== null ? (
        <Reveal variant="scale">
          <MatchPanel match={match} />
        </Reveal>
      ) : null}
      {match?.tailoredResume ? (
        <Reveal variant="scale">
          <ArtifactCard
            title="Tailored resume"
            icon="wand"
            content={match.tailoredResume}
            filenamePrefix="tailored-resume"
            jobTitle={job.title}
          />
        </Reveal>
      ) : null}
      {match?.coverLetter ? (
        <Reveal variant="scale">
          <ArtifactCard
            title="Cover letter"
            icon="document"
            content={match.coverLetter}
            filenamePrefix="cover-letter"
            jobTitle={job.title}
          />
        </Reveal>
      ) : null}
    </div>
  );
}
