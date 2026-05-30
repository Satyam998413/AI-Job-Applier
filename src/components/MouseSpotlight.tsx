"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./MouseSpotlight.module.css";

type Props = {
  children: ReactNode;
  className?: string;
  /** CSS color or gradient for the spotlight blob. */
  color?: string;
  /** Spotlight size in pixels. */
  size?: number;
};

export function MouseSpotlight({
  children,
  className,
  color = "rgba(109, 123, 255, 0.35)",
  size = 420,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  const style: CSSProperties = {
    ["--spot-color" as string]: color,
    ["--spot-size" as string]: `${size}px`,
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
