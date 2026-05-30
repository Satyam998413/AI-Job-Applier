import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "./LandingFooter.module.css";

type Column = { title: string; links: { label: string; href: string }[] };

const columns: Column[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "/register" },
      { label: "Changelog", href: "/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/register" },
      { label: "Stories", href: "#stories" },
      { label: "Careers", href: "/register" },
      { label: "Contact", href: "/register" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Resume guide", href: "/register" },
      { label: "ATS cheatsheet", href: "/register" },
      { label: "Privacy", href: "/register" },
      { label: "Terms", href: "/register" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Logo />
          <p className={styles.tagline}>
            Your personal AI career copilot. We read, score, and tailor — you show up to the
            interview.
          </p>
        </div>

        <div className={styles.cols}>
          {columns.map((col) => (
            <div key={col.title} className={styles.col}>
              <h4 className={styles.colTitle}>{col.title}</h4>
              <ul className={styles.colLinks}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={styles.link}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} AI Job Applier · Built with care for job hunters everywhere.</span>
        <span className={styles.status}>
          <span className={styles.statusDot} />
          All systems operational
        </span>
      </div>
    </footer>
  );
}
