import styles from "./FormMessage.module.css";

export function FormMessage({ tone = "error", children }: { tone?: "error" | "info"; children: React.ReactNode }) {
  if (!children) return null;
  return <p className={[styles.msg, styles[tone]].join(" ")}>{children}</p>;
}
