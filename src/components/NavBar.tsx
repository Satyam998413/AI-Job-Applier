"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const links =baseLinks;

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  async function logout() {
    setMenuOpen(false);
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // Get initials for avatar
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

        {/* Profile Menu */}
        <div className={styles.profileMenuWrapper} ref={menuRef}>
   
            <div   onClick={() => setMenuOpen(!menuOpen)} className={styles.profileAvatar}>{initials}</div>
         

          {menuOpen && (
            <div className={styles.menu}>
              <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                  {userName}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                  User Account
                </div>
              </div>

              <Link href="/settings" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                <span>⚙️</span>
                <span>Settings</span>
              </Link>

              {isAdmin && (
                <>
                  <hr className={styles.menuDivider} />
                  <Link href="/admin" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                    <span>👨‍💼</span>
                    <span>Admin Dashboard</span>
                  </Link>
                </>
              )}

              <hr className={styles.menuDivider} />

              <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={logout}>
                <span>🚪</span>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
