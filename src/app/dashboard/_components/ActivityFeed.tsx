import Link from "next/link";
import { Card } from "@/components/Card";
import { Icon, type IconName } from "@/components/Icon";
import type { ActivityEvent, ActivityKind } from "@/server/services/stats/getUserActivity";
import styles from "./ActivityFeed.module.css";

const ICON: Record<ActivityKind, IconName> = {
  matched: "target",
  tailored: "wand",
  applied: "check",
  emailSent: "bolt",
  emailFailed: "shield",
  qnaSaved: "document",
};

const TONE: Record<ActivityKind, "default" | "success" | "warning" | "danger"> = {
  matched: "default",
  tailored: "default",
  applied: "success",
  emailSent: "success",
  emailFailed: "danger",
  qnaSaved: "default",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="sparkles" size={18} /> Recent activity
        </h2>
      </header>
      {events.length === 0 ? (
        <p className={styles.empty}>
          Nothing here yet. Score a job, tailor a resume, or send an outreach email to start your history.
        </p>
      ) : (
        <ul className={styles.list}>
          {events.map((e) => {
            const inner = (
              <>
                <span className={[styles.icon, styles[TONE[e.kind]]].join(" ")}>
                  <Icon name={ICON[e.kind]} size={14} />
                </span>
                <span className={styles.text}>
                  <span className={styles.itemTitle}>{e.title}</span>
                  <span className={styles.detail}>{e.detail}</span>
                </span>
                <span className={styles.time}>{relativeTime(e.at)}</span>
              </>
            );
            return (
              <li key={e.id} className={styles.item}>
                {e.jobId ? (
                  <Link href={`/jobs/${e.jobId}`} className={styles.link}>
                    {inner}
                  </Link>
                ) : (
                  <div className={styles.link}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
