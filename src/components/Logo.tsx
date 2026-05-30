import { Icon } from "./Icon";
import styles from "./Logo.module.css";

export function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <span className={styles.logo}>
      <span className={styles.mark}>
        <Icon name="sparkles" size={18} />
      </span>
      {showText ? (
        <span className={styles.word}>
          <span className={styles.accent}>AI</span> Job Applier
        </span>
      ) : null}
    </span>
  );
}
