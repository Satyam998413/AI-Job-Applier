"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./VideoRecordingTab.module.css";

type RecordingState = "idle" | "recording" | "paused" | "finished";

export function VideoRecordingTab() {
  const [state, setState] = useState<RecordingState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);
  const [fileName, setFileName] = useState("recording");

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording
  async function startRecording() {
    try {
      setMessage(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setMessage({ type: "success", text: "Video recorded successfully" });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState("recording");
      setSeconds(0);
      setMessage({ type: "info", text: "Recording started..." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to access camera";
      setMessage({ type: "error", text: message });
    }
  }

  // Pause recording
  function pauseRecording() {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.pause();
      setState("paused");
      setMessage({ type: "info", text: "Recording paused" });
    }
  }

  // Resume recording
  function resumeRecording() {
    if (mediaRecorderRef.current && state === "paused") {
      mediaRecorderRef.current.resume();
      setState("recording");
      setMessage({ type: "info", text: "Recording resumed" });
    }
  }

  // Stop recording
  function stopRecording() {
    if (mediaRecorderRef.current && (state === "recording" || state === "paused")) {
      mediaRecorderRef.current.stop();
      setState("finished");

      // Stop all tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }

  // Reset
  function reset() {
    setVideoUrl(null);
    setState("idle");
    setSeconds(0);
    setMessage(null);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    recordedChunksRef.current = [];
    mediaRecorderRef.current = null;
  }

  // Download video
  function downloadVideo() {
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = `${fileName}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Timer effect
  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const sec = secs % 60;
    return [hours, mins, sec].map((t) => String(t).padStart(2, "0")).join(":");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <header className={styles.header}>
          <h3 className={styles.title}>Record Video</h3>
          <p className={styles.subtitle}>Record yourself for video interviews or presentations</p>
        </header>

        {message && (
          <div className={`${styles.status} ${styles[`status${message.type[0].toUpperCase()}${message.type.slice(1)}`]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.videoContainer}>
          {state === "idle" && !videoUrl && (
            <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
              <p>📹 Click "Start Recording" to begin</p>
            </div>
          )}

          {(state === "recording" || state === "paused" || (state === "finished" && videoUrl)) && videoRef.current?.srcObject && (
            <video ref={videoRef} className={styles.video} autoPlay muted />
          )}

          {state === "finished" && videoUrl && !videoRef.current?.srcObject && (
            <video src={videoUrl} className={styles.preview} controls />
          )}
        </div>

        {(state === "recording" || state === "paused") && (
          <div className={styles.timer}>{formatTime(seconds)}</div>
        )}

        <div className={styles.controls}>
          {state === "idle" && (
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={startRecording}>
              ⏺️ Start Recording
            </button>
          )}

          {state === "recording" && (
            <>
              <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={pauseRecording}>
                ⏸️ Pause
              </button>
              <button className={`${styles.button} ${styles.buttonDanger}`} onClick={stopRecording}>
                ⏹️ Stop
              </button>
            </>
          )}

          {state === "paused" && (
            <>
              <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={resumeRecording}>
                ▶️ Resume
              </button>
              <button className={`${styles.button} ${styles.buttonDanger}`} onClick={stopRecording}>
                ⏹️ Stop
              </button>
            </>
          )}

          {state === "finished" && (
            <>
              <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={downloadVideo}>
                ⬇️ Download
              </button>
              <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={reset}>
                🔄 Record Again
              </button>
            </>
          )}
        </div>

        {state === "finished" && (
          <div style={{ marginTop: "var(--space-4)" }}>
            <label htmlFor="fileName" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
              File Name
            </label>
            <input
              id="fileName"
              type="text"
              className={styles.filledInput}
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
            />
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.info}>
          <div className={styles.infoTitle}>💡 Tips</div>
          <ul style={{ margin: 0, paddingLeft: "var(--space-4)" }}>
            <li>Ensure your camera and microphone are working before recording</li>
            <li>Find good lighting and a quiet environment for better quality</li>
            <li>Your browser may request camera/microphone permissions</li>
            <li>Videos are recorded in WebM format and stored locally</li>
            <li>You can pause and resume recordings as needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
