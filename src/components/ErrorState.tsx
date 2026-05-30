"use client";

import { Button } from "./Button";
import styles from "./ErrorState.module.css";

export function ErrorState({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Something went wrong</h2>
      <p className={styles.message}>{error.message || "An unexpected error occurred."}</p>
      <Button variant="secondary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
