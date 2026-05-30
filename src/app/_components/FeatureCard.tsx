import { Card } from "@/components/Card";
import { Icon, type IconName } from "@/components/Icon";
import styles from "./FeatureCard.module.css";

type Accent = "primary" | "violet" | "cyan" | "success" | "warning" | "danger";

export function FeatureCard({
  icon,
  title,
  body,
  accent = "primary",
  tag,
}: {
  icon: IconName;
  title: string;
  body: string;
  accent?: Accent;
  tag?: string;
}) {
  return (
    <Card className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.head}>
        <span className={styles.icon}>
          <Icon name={icon} size={22} />
        </span>
        {tag ? <span className={styles.tag}>{tag}</span> : null}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
      <span className={styles.arrow}>
        <Icon name="arrowRight" size={16} />
      </span>
    </Card>
  );
}
