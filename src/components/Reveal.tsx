import styles from "./Reveal.module.css";

type RevealProps = {
  children: React.ReactNode;
  /** Stagger delay in milliseconds. */
  delay?: number;
  /** Animation style. */
  variant?: "up" | "in" | "scale";
  className?: string;
};

/**
 * Entrance animation wrapper (CSS-only, SSR-safe). Plays once on first paint;
 * reduced-motion users see content immediately via the global motion reset.
 */
export function Reveal({ children, delay = 0, variant = "up", className }: RevealProps) {
  return (
    <div
      className={[styles.reveal, styles[variant], className].filter(Boolean).join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
