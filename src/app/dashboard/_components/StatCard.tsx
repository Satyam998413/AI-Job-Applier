import { Icon, type IconName } from "@/components/Icon";
import styles from "./StatCard.module.css";

type Tone = "default" | "success" | "warning" | "danger";

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: IconName;
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className={[styles.card, styles[tone]].join(" ")}>
      <span className={styles.icon}>
        <Icon name={icon} size={18} />
      </span>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
    </div>
  );
}
