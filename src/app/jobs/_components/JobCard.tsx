import Link from "next/link";
import { Card } from "@/components/Card";
import { ScoreRing } from "@/components/ScoreRing";
import { SkillTags } from "@/components/SkillTags";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import type { JobDto, MatchStatus } from "@/types";
import styles from "./JobCard.module.css";

export type JobListItem = JobDto & { score: number | null; status: MatchStatus | null };

export function JobCard({ job }: { job: JobListItem }) {
  return (
    <Link href={`/jobs/${job.id}`} className={styles.link}>
      <Card className={styles.card}>
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{job.title}</h2>
            {job.status === "applied" ? (
              <Badge tone="success">
                <Icon name="check" size={13} /> Applied
              </Badge>
            ) : null}
            {job.sources.length > 1 ? <Badge tone="neutral">{job.sources.length} sources</Badge> : null}
          </div>
          <p className={styles.meta}>
            <Icon name="briefcase" size={14} /> {job.company} · {job.location}
          </p>
          <SkillTags skills={job.tags} />
        </div>
        <div className={styles.right}>
          {job.score !== null ? (
            <ScoreRing score={job.score} />
          ) : (
            <span className={styles.unmatched}>Not scored</span>
          )}
          <span className={styles.arrow}>
            <Icon name="arrowRight" size={18} />
          </span>
        </div>
      </Card>
    </Link>
  );
}
