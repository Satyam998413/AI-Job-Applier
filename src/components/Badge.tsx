import styles from "./Badge.module.css";

type Tone = "neutral" | "success" | "warning" | "danger";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={[styles.badge, styles[tone]].join(" ")}>{children}</span>;
}
