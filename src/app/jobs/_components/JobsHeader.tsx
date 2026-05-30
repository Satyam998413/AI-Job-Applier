import Link from "next/link";
import { Notice } from "@/components/Notice";
import { JobSearchForm } from "./JobSearchForm";
import styles from "./JobsHeader.module.css";

export function JobsHeader({ hasResume }: { hasResume: boolean }) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Find your next role</h1>
        <p className={styles.subtitle}>
          Search live openings from across the web, then score and tailor your application.
        </p>
      </div>
      <JobSearchForm />
      {!hasResume ? (
        <Notice tone="warning">
          Upload a resume on the <Link href="/resume">Resume</Link> page to score and tailor job matches.
        </Notice>
      ) : null}
    </header>
  );
}
