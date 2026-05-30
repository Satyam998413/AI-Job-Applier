import { Card } from "@/components/Card";
import { SkillTags } from "@/components/SkillTags";
import type { JobDto } from "@/types";
import styles from "./JobInfo.module.css";

export function JobInfo({ job }: { job: JobDto }) {
  return (
    <Card>
      <h1 className={styles.title}>{job.title}</h1>
      <p className={styles.meta}>
        {job.company} · {job.location}
      </p>
      <SkillTags skills={job.tags} />
      <p className={styles.description}>{job.description}</p>
      {job.url ? (
        <a className={styles.link} href={job.url} target="_blank" rel="noreferrer">
          View original posting ↗
        </a>
      ) : null}
    </Card>
  );
}
