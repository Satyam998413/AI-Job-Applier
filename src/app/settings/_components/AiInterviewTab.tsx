"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/apiClient";
import styles from "./SettingsTabShared.module.css";

interface InterviewConfig {
  jobRole: string;
  experienceLevel: string;
  focusArea: string;
  questionCount: number; // New field
  timeLimitPerQuestion: number; // New field (in seconds)
}

export function AiInterviewTab() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Controls which "tab" or step is currently visible (1 = Form, 2 = Confirmation)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Default values initialized here
  const [formData, setFormData] = useState<InterviewConfig>({
    jobRole: "Software Engineer",
    experienceLevel: "Mid-level",
    focusArea: "Frontend (React/Next.js)",
    questionCount: 5, // Defaulting to a quick 5-question round
    timeLimitPerQuestion: 60, // Defaulting to 60 seconds per response
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Ensure numeric values are stored as numbers instead of strings
    const formattedValue = name === "questionCount" || name === "timeLimitPerQuestion" 
      ? Number(value) 
      : value;

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Triggered when clicking "Next" on the form
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    setCurrentStep(2); // Switches to the confirmation tab layout
  };

  // Final confirmation to launch the interview payload
  async function startNewInterview() {
    setIsLoading(true);
    try {
      const result = await apiFetch<{ id: string }>("/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      // Go to preparation page instead of recording
      router.push(`/interview/${result.id}/prepare`);
    } catch (err) {
      console.error("Failed to start interview:", err);
      alert(err instanceof Error ? err.message : "Failed to start interview");
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <div className={styles.form}>
        <h2 className={styles.sectionTitle}>AI Interview Wizard</h2>
        
        {/* --- STEP 1: FORM FILLUP TAB --- */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep}>
            <p className={styles.sectionDescription}>
              Configure your upcoming session. Default values have been pre-filled for you.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
              {/* Job Role Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label htmlFor="jobRole" style={{ fontWeight: "bold" }}>Target Job Role</label>
                <input
                  id="jobRole"
                  name="jobRole"
                  type="text"
                  value={formData.jobRole}
                  onChange={handleChange}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                  required
                />
              </div>

              {/* Experience Select */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label htmlFor="experienceLevel" style={{ fontWeight: "bold" }}>Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead / Manager</option>
                </select>
              </div>

              {/* Focus Area Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label htmlFor="focusArea" style={{ fontWeight: "bold" }}>Focus Area / Tech Stack</label>
                <input
                  id="focusArea"
                  name="focusArea"
                  type="text"
                  value={formData.focusArea}
                  onChange={handleChange}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                  required
                />
              </div>

              {/* Number of Questions Select */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label htmlFor="questionCount" style={{ fontWeight: "bold" }}>Number of Questions</label>
                <select
                  id="questionCount"
                  name="questionCount"
                  value={formData.questionCount}
                  onChange={handleChange}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="3">3 Questions (Short)</option>
                  <option value="5">5 Questions (Standard)</option>
                  <option value="10">10 Questions (Deep Dive)</option>
                </select>
              </div>

              {/* Timing Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label htmlFor="timeLimitPerQuestion" style={{ fontWeight: "bold" }}>Response Time Limit (Per Question)</label>
                <select
                  id="timeLimitPerQuestion"
                  name="timeLimitPerQuestion"
                  value={formData.timeLimitPerQuestion}
                  onChange={handleChange}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="30">30 Seconds</option>
                  <option value="60">1 Minute</option>
                  <option value="120">2 Minutes</option>
                  <option value="180">3 Minutes</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "var(--space-6)" }}>
              <Button type="submit">
                Next: Review Setup ➡️
              </Button>
            </div>
          </form>
        )}

        {/* --- STEP 2: SUMMARY & START TAB --- */}
        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <p className={styles.sectionDescription}>
              Please review your simulation settings below before initiating the AI engine.
            </p>

            <div style={{ padding: "var(--space-4)", background: "rgba(0,0,0,0.02)", borderRadius: "6px", border: "1px dashed #ccc" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <li><strong>Role:</strong> {formData.jobRole} ({formData.experienceLevel})</li>
                <li><strong>Focus:</strong> {formData.focusArea}</li>
                <li><strong>Length:</strong> {formData.questionCount} Questions</li>
                <li><strong>Timer:</strong> {formData.timeLimitPerQuestion} seconds allowed per prompt</li>
              </ul>
            </div>
             

        <h3 className={styles.sectionTitle}>System Details</h3>
        <ul style={{ margin: "var(--space-4) 0", paddingLeft: "var(--space-6)", color: "var(--color-text-muted)" }}>
          <li>🤖 Questions adapt directly to your stack configurations.</li>
          <li>⏱️ The application tracks your response limit and auto-submits upon timeout.</li>
          <li>☁️ Recordings are securely stored in Vercel Blob.</li>
        </ul>

            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
              <Button type="button" onClick={() => setCurrentStep(1)} style={{ background: "transparent", border: "1px solid #ccc", color: "inherit" }}>
                ⬅️ Back to Form
              </Button>
              
              <Button type="button" onClick={startNewInterview} disabled={isLoading}>
                {isLoading ? "⏳ Spinning Up Room..." : "🎤 Start Interview Now"}
              </Button>
            </div>
            
          </div>
        )}

     
      </div>
    </Card>
  );
}