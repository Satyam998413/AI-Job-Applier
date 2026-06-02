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
type RecordingMode = "audio" | "video";

export function InterviewSessionView({ initial }: Props) {
  const router = useRouter();
  const [interview, setInterview] = useState(initial);
  const [idx, setIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [code, setCode] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<RecordingMode>("audio");
  const [message, setMessage] = useState("");
  const [share, setShare] = useState<InterviewShareDto | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [enableVideo, setEnableVideo] = useState(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const i = setInterval(() => setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(i);
  }, []);

  // Redirect to prepare page if interview is not live/completed/scoring/scored
  useEffect(() => {
    if (interview.status === "pending" || interview.status === "preparing") {
      router.replace(`/interview/${interview.id}/prepare`);
    }
  }, [interview.status, interview.id, router]);

  // Auto-read question aloud when it changes
  useEffect(() => {
    if (!interview.questions[idx] || speaking) return;
    readQuestionAloud(interview.questions[idx].question);
  }, [idx, interview.questions]);

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      window.speechSynthesis?.cancel();
    };
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

  // Read question aloud with female voice
  function readQuestionAloud(question: string) {
    if (!("speechSynthesis" in window)) {
      setMessage("Text-to-Speech not supported in your browser");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.95;
    utterance.pitch = 1.2; // Higher pitch for female voice
    utterance.volume = 0.8;

    // Try to select female voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) => v.name.includes("female") || v.name.includes("woman") || v.name.includes("Women")
    ) || voices.find((v) => !v.name.includes("male") && !v.name.includes("man")) || voices[0];

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  async function startRecording() {
    try {
      const constraints = {
        audio: true,
        video: enableVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: enableVideo ? "video/webm;codecs=vp8,opus" : "audio/webm",
      });

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };
      recorder.start();
      recorderRef.current = recorder;

      if (enableVideo && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      setRecordingMode(enableVideo ? "video" : "audio");
      setRecording(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Could not access media devices";
      setMessage(errorMsg);
      if (enableVideo && !errorMsg.includes("video")) {
        setEnableVideo(false);
        setMessage("Camera not available, falling back to audio only");
      }
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

    const mimeType = recordingMode === "video" ? "video/webm" : "audio/webm";
    const extension = recordingMode === "video" ? "webm" : "webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });

    try {
      const form = new FormData();
      form.append("file", blob, `q${idx}.${extension}`);
      form.append("kind", recordingMode);
      await fetch(`/api/interview/${interview.id}/upload`, { method: "POST", body: form });
      setMessage(`${recordingMode === "video" ? "Video" : "Audio"} uploaded`);
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
    window.speechSynthesis?.cancel();
    setTranscript("");
    setCode("");
    setMessage("");
    setIdx((i) => Math.min(interview.questions.length - 1, i + 1));
  }

  async function finish() {
    window.speechSynthesis?.cancel();
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
  const isLive = interview.status === "live";

  // Don't render if not in live/completed/scoring/scored status
  if (interview.status === "pending" || interview.status === "preparing") {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
        <p>Redirecting to interview preparation...</p>
      </div>
    );
  }

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
            <h2 className={styles.question}>
              {q.question}
              {speaking && " 🔊"}
            </h2>
            <p className={styles.hint}>
              AI is reading the question aloud. You can disable and re-read it below.
            </p>
            {speaking && <Button onClick={() => window.speechSynthesis?.cancel()}>Stop reading</Button>}
            {!speaking && <Button onClick={() => readQuestionAloud(q.question)}>🔊 Read again</Button>}

            {/* Video/Audio Recording Section */}
            <div className={styles.field}>
              <span className={styles.label}>Record your response</span>
              <div style={{ marginBottom: "var(--space-3)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={enableVideo}
                    onChange={(e) => {
                      if (!recording) setEnableVideo(e.target.checked);
                    }}
                    disabled={recording}
                  />
                  <span>Include video (if camera available)</span>
                </label>
              </div>

              {/* Video Preview */}
              {recording && enableVideo && (
                <div style={{ marginBottom: "var(--space-3)", borderRadius: "6px", overflow: "hidden", background: "#000" }}>
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: "100%", height: "auto", maxHeight: "300px" }}
                  />
                </div>
              )}

              <div className={styles.recordRow}>
                {!recording ? (
                  <Button onClick={startRecording}>
                    {enableVideo ? "🎥 Start video" : "🎤 Start audio"}
                  </Button>
                ) : (
                  <Button onClick={stopAndUpload}>
                    {recordingMode === "video" ? "⏹️ Stop video" : "⏹️ Stop audio"}
                  </Button>
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
            <h2 className={styles.sectionTitle}>Interview Complete ✓</h2>

            {/* Media Playback */}
            {interview.media && interview.media.length > 0 && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <h3 className={styles.sectionTitle}>Recorded Responses</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  {interview.media.map((m, i) => (
                    <div key={i} style={{ padding: "var(--space-4)", background: "rgba(0,0,0,0.02)", borderRadius: "6px" }}>
                      <p style={{ marginBottom: "var(--space-2)", fontWeight: "bold" }}>
                        {m.kind === "video" ? "🎥 Video" : "🎤 Audio"} — Question {i + 1}
                      </p>
                      {m.kind === "video" ? (
                        <video
                          controls
                          style={{ width: "100%", maxWidth: "100%", borderRadius: "4px" }}
                          src={m.url}
                        />
                      ) : (
                        <audio
                          controls
                          style={{ width: "100%" }}
                          src={m.url}
                        />
                      )}
                      <p style={{ marginTop: "var(--space-2)", fontSize: "0.85em", color: "var(--color-text-muted)" }}>
                        {m.durationMs ? `${Math.round(m.durationMs / 1000)}s` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className={styles.sectionTitle}>Performance Scores</h2>
            <ul className={styles.scores}>
              <li><strong>Overall:</strong> {Math.round(interview.scores.overall ?? 0)}/100 ⭐</li>
              <li><strong>Communication:</strong> {Math.round(interview.scores.communication ?? 0)}/100</li>
              <li><strong>Technical:</strong> {Math.round(interview.scores.technical ?? 0)}/100</li>
              <li><strong>Confidence:</strong> {Math.round(interview.scores.confidence ?? 0)}/100</li>
            </ul>

            {interview.scores.rubric.length > 0 && (
              <details style={{ marginTop: "var(--space-4)" }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                  📋 Detailed Feedback ({interview.scores.rubric.length} items)
                </summary>
                <ul className={styles.rubric}>
                  {interview.scores.rubric.map((r, i) => (
                    <li key={i}>
                      <strong>{r.criterion}</strong>
                      <span style={{ marginLeft: "var(--space-2)", background: "rgba(0,0,0,0.1)", padding: "2px 6px", borderRadius: "3px" }}>
                        {r.score}/100
                      </span>
                      <p style={{ marginTop: "var(--space-1)", color: "var(--color-text-muted)" }}>{r.comment}</p>
                    </li>
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
