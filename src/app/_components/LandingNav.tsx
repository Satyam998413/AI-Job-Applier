import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import styles from "./LandingNav.module.css";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Stories", href: "#stories" },
];

export function LandingNav() {
  return (
    <header className={styles.navWrap}>
      <nav className={styles.nav}>
        <Logo />
        <ul className={styles.links}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Link href="/login" className={styles.signin}>
            Sign in
          </Link>
          <Button href="/register">Get started — free</Button>
        </div>
      </nav>
    </header>
  );
}
