import type { CSSProperties } from "react";
import styles from "./ScoreRing.module.css";

function toneFor(score: number): string {
  if (score >= 70) return "var(--color-success)";
  if (score >= 40) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const color = toneFor(score);
  const style = {
    width: size,
    height: size,
    "--aja-deg": `${score * 3.6}deg`,
    "--ring-color": color,
  } as CSSProperties;

  return (
    <div
      className={styles.ring}
      style={style}
      role="img"
      aria-label={`Match score ${score} out of 100`}
    >
      <span className={styles.inner} style={{ color }}>
        {score}
      </span>
    </div>
  );
}
