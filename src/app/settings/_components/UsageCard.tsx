import { Icon } from "@/components/Icon";
import styles from "./UsageCard.module.css";

export function UsageCard({
  used,
  total,
  remaining,
  monthKey,
  lastCallAt,
}: {
  used: number;
  total: number;
  remaining: number;
  monthKey: string;
  lastCallAt: string | null;
}) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((used / total) * 100));
  const tone = percent >= 90 ? "danger" : percent >= 70 ? "warning" : "ok";
  const lastCall = lastCallAt ? new Date(lastCallAt).toLocaleString() : "Never";

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.stats}>
          <span className={styles.number}>{used}</span>
          <span className={styles.of}>/ {total}</span>
          <span className={styles.label}>requests this month ({monthKey})</span>
        </div>
        <span className={[styles.pill, styles[tone]].join(" ")}>
          {remaining} remaining
        </span>
      </div>
      <div className={styles.barTrack}>
        <div className={[styles.barFill, styles[tone]].join(" ")} style={{ width: `${percent}%` }} />
      </div>
      <p className={styles.meta}>
        <Icon name="bolt" size={14} /> Last call: {lastCall}
      </p>
    </div>
  );
}
