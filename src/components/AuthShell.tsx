import Link from "next/link";
import { Card } from "./Card";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";
import styles from "./AuthShell.module.css";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <Reveal>
          <Link href="/" className={styles.brand}>
            <Logo />
          </Link>
        </Reveal>
        <Reveal delay={80}>
          <Card className={styles.card}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            {children}
          </Card>
        </Reveal>
        <Reveal delay={160}>
          <p className={styles.footer}>{footer}</p>
        </Reveal>
      </div>
    </main>
  );
}
