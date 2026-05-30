import { Icon, type IconName } from "./Icon";
import styles from "./Notice.module.css";

const icons: Record<"info" | "warning", IconName> = { info: "sparkles", warning: "bolt" };

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div className={[styles.notice, styles[tone]].join(" ")}>
      <span className={styles.icon}>
        <Icon name={icons[tone]} size={16} />
      </span>
      <span>{children}</span>
    </div>
  );
}
