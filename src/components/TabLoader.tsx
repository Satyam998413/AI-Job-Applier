import { Spinner } from "./Spinner";
import styles from "./TabLoader.module.css";

/**
 * Compact loader shown just below navbar when switching tabs.
 * Appears only briefly during client-side tab switches.
 */
export function TabLoader({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <Spinner label="Loading…" />
    </div>
  );
}
