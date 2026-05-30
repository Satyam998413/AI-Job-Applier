import { Spinner } from "./Spinner";
import styles from "./PageLoading.module.css";

export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className={styles.wrap}>
      <Spinner label={label} />
    </div>
  );
}
