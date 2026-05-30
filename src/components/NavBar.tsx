"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import styles from "./NavBar.module.css";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resume", label: "Resume" },
  { href: "/jobs", label: "Jobs" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/answers", label: "Answers" },
  { href: "/email", label: "Email" },
  { href: "/assistant", label: "Assistant" },
  { href: "/settings", label: "Settings" },
];

export function NavBar({ userName, isAdmin = false }: { userName: string; isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = isAdmin ? [...baseLinks, { href: "/admin", label: "Admin" }] : baseLinks;

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className={styles.bar}>
      <Link href="/dashboard" className={styles.brand}>
        <Logo />
      </Link>
      <nav className={styles.nav}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname.startsWith(l.href) ? styles.active : styles.link}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className={styles.right}>
        <NotificationBell />
        <span className={styles.user}>{userName}</span>
        <button className={styles.logout} onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
