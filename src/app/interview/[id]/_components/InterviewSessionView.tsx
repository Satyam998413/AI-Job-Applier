"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { FormMessage } from "@/components/FormMessage";
import { Notice } from "@/components/Notice";
import { apiFetch } from "@/lib/apiClient";
import type { InterviewDto, InterviewShareDto } from "@/types";
import styles from "./InterviewSessionView.module.css";

type Props = { initial: InterviewDto };

export function InterviewSessionView({ initial }: Props) {
  const router = useRouter();
  const [interview, setInterview] = useState(initial);
  const [idx, setIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [code, setCode] = useState("");
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState("");
  const [share, setShare] = useState<InterviewShareDto | null>(null);
  const [finishing, setFinishing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(i);
  }, []);

  // Poll status post-finish so the UI shows scoring/scored without a refresh.
  useEffect(() => {
    if (interview.status !== "completed" && interview.status !== "scoring") return;
    const poll = setInterval(async () => {
      try {
        const next = await apiFetch<InterviewDto>(`/api/interview/${interview.id}`);
        setInterview(next);
        if (next.status === "scored" || next.status === "failed") clearInterval(poll);
      } catch {
        clearInterval(poll);
      }
    }, 3000);
    return () => clearInterval(poll);
  }, [interview.status, interview.id]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        for (const t of stream.getTracks()) t.stop();
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not access microphone");
    }
  }

  async function stopAndUpload() {
    const r = recorderRef.current;
    if (!r) return;
    await new Promise<void>((resolve) => {
      r.onstop = () => resolve();
      r.stop();
    });
    setRecording(false);
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    try {
      const form = new FormData();
      form.append("file", blob, `q${idx}.webm`);
      form.append("kind", "audio");
      await fetch(`/api/interview/${interview.id}/upload`, { method: "POST", body: form });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function saveAnswer() {
    try {
      await apiFetch(`/api/interview/${interview.id}/answer`, {
        method: "POST",
        body: JSON.stringify({ questionIndex: idx, transcript, codeSubmission: code }),
      });
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  function next() {
    setTranscript("");
    setCode("");
    setMessage("");
    setIdx((i) => Math.min(interview.questions.length - 1, i + 1));
  }

  async function finish() {
    setFinishing(true);
    try {
      const next = await apiFetch<InterviewDto>(`/api/interview/${interview.id}/finish`, { method: "POST" });
      setInterview(next);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not finish");
    } finally {
      setFinishing(false);
    }
  }

  async function getShare() {
    try {
      const dto = await apiFetch<InterviewShareDto>(`/api/interview/${interview.id}/share`, {
        method: "POST",
      });
      setShare(dto);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create share link");
    }
  }

  const q = interview.questions[idx];
  const isLive = interview.status === "live" || interview.status === "pending";

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Interview</h1>
          <p className={styles.subtitle}>
            Question {idx + 1} of {interview.questions.length} · Status: <Badge>{interview.status}</Badge>
          </p>
        </div>
        <div className={styles.timer}>
          {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, "0")} / {interview.durationMin}:00
        </div>
      </header>

      {isLive && q && (
        <Card>
          <div className={styles.form}>
            <Badge tone="neutral">{q.category}</Badge>
            <h2 className={styles.question}>{q.question}</h2>

            <div className={styles.field}>
              <span className={styles.label}>Verbal answer (transcribed by Whisper on finish)</span>
              <div className={styles.recordRow}>
                {!recording ? (
                  <Button onClick={startRecording}>Start recording</Button>
                ) : (
                  <Button onClick={stopAndUpload}>Stop & upload</Button>
                )}
                <span className={styles.hint}>
                  Or type your answer below instead.
                </span>
              </div>
              <textarea
                className={styles.textarea}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Type your spoken answer here, or leave blank and rely on the audio transcription."
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Code answer (optional)</span>
              <textarea
                className={styles.code}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code solution here. Whitespace is preserved."
                spellCheck={false}
              />
            </div>

            <FormMessage>{message}</FormMessage>
            <div className={styles.actions}>
              <Button onClick={saveAnswer}>Save answer</Button>
              {idx < interview.questions.length - 1 ? (
                <Button onClick={next}>Next question</Button>
              ) : (
                <Button onClick={finish} disabled={finishing}>
                  {finishing ? "Finishing…" : "Finish interview"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {(interview.status === "completed" || interview.status === "scoring") && (
        <Notice>Scoring in progress. Whisper transcription + LLM rubric usually take 30–90 seconds.</Notice>
      )}

      {interview.status === "scored" && (
        <Card>
          <div className={styles.form}>
            <h2 className={styles.sectionTitle}>Scores</h2>
            <ul className={styles.scores}>
              <li><strong>Overall:</strong> {Math.round(interview.scores.overall ?? 0)}/100</li>
              <li><strong>Communication:</strong> {Math.round(interview.scores.communication ?? 0)}/100</li>
              <li><strong>Technical:</strong> {Math.round(interview.scores.technical ?? 0)}/100</li>
              <li><strong>Confidence:</strong> {Math.round(interview.scores.confidence ?? 0)}/100</li>
            </ul>
            {interview.scores.rubric.length > 0 && (
              <details>
                <summary>Rubric</summary>
                <ul className={styles.rubric}>
                  {interview.scores.rubric.map((r, i) => (
                    <li key={i}><strong>{r.criterion} ({r.score}):</strong> {r.comment}</li>
                  ))}
                </ul>
              </details>
            )}

            <h3 className={styles.sectionTitle}>Share with recruiters</h3>
            {!share ? (
              <Button onClick={getShare}>Generate public link</Button>
            ) : (
              <div>
                <input className={styles.shareUrl} readOnly value={share.url} />
                <p className={styles.hint}>Expires {new Date(share.expiresAt).toLocaleDateString()}.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {interview.status === "failed" && (
        <Notice>Scoring failed. Sentry has the error; you can re-finish to retry.</Notice>
      )}

      <div className={styles.actions}>
        <Button onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
      </div>
    </div>
  );
}
