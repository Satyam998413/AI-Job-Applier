import Link from "next/link";
import { Card } from "@/components/Card";
import { ScoreRing } from "@/components/ScoreRing";
import { Icon } from "@/components/Icon";
import type { PipelineItem } from "@/server/services/jobs/getPipeline";
import styles from "./PipelineCard.module.css";

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function PipelineCard({ item }: { item: PipelineItem }) {
  return (
    <Link href={`/jobs/${item.jobId}`} className={styles.link}>
      <Card className={styles.card}>
        <div className={styles.body}>
          <h3 className={styles.title}>{item.jobTitle}</h3>
          <p className={styles.meta}>
            <Icon name="briefcase" size={12} /> {item.jobCompany} · {item.jobLocation}
          </p>
          <span className={styles.time}>updated {relative(item.updatedAt)}</span>
        </div>
        {item.score !== null ? <ScoreRing score={item.score} size={44} /> : null}
      </Card>
    </Link>
  );
}
