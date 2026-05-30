"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { ResumeSummary } from "./ResumeSummary";
import { ResumeUpload } from "./ResumeUpload";
import { AtsCheckPanel, type AtsJobOption } from "./AtsCheckPanel";
import type { ResumeDto } from "@/types";
import styles from "./ResumeView.module.css";

export function ResumeView({
  initialResume,
  jobs,
}: {
  initialResume: ResumeDto | null;
  jobs: AtsJobOption[];
}) {
  const [resume, setResume] = useState<ResumeDto | null>(initialResume);

  return (
    <div className={styles.wrap}>
      <Reveal>
        <header className={styles.header}>
          <h1 className={styles.title}>Your resume</h1>
          <p className={styles.subtitle}>
            {resume
              ? "Looking good. Upload a new file anytime to refresh your profile."
              : "Upload a PDF, DOCX, TXT, MD, HTML, or RTF file and let AI map your skills, summary, and experience."}
          </p>
        </header>
      </Reveal>
      {resume ? (
        <Reveal delay={80}>
          <ResumeSummary resume={resume} />
        </Reveal>
      ) : null}
      <Reveal delay={resume ? 160 : 80}>
        <ResumeUpload onParsed={setResume} hasResume={Boolean(resume)} />
      </Reveal>
      {resume ? (
        <Reveal delay={240}>
          <AtsCheckPanel jobs={jobs} />
        </Reveal>
      ) : null}
    </div>
  );
}
