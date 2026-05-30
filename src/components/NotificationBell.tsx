"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { NotificationDto } from "@/types";
import styles from "./NotificationBell.module.css";

export function NotificationBell() {
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    void refreshList();
    void refreshUnread();
    try {
      const es = new EventSource("/api/notifications/stream");
      sourceRef.current = es;
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as NotificationDto;
          setItems((prev) => [data, ...prev].slice(0, 50));
          setUnread((n) => n + 1);
        } catch {
          // ignore parse errors
        }
      };
      return () => {
        es.close();
        sourceRef.current = null;
      };
    } catch {
      // Unsupported environments (very old browsers) fall back to load-on-open only.
    }
  }, []);

  async function refreshList() {
    try {
      setItems(await apiFetch<NotificationDto[]>("/api/notifications"));
    } catch {
      // Silent fail — bell stays empty rather than throwing inside NavBar.
    }
  }

  async function refreshUnread() {
    try {
      const { count } = await apiFetch<{ count: number }>("/api/notifications/unread-count");
      setUnread(count);
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    try {
      await apiFetch("/api/notifications/mark-all-read", { method: "POST" });
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, seenAt: n.seenAt ?? new Date().toISOString() })));
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles.wrap}>
      <button
        className={styles.bell}
        aria-label={`Notifications (${unread} unread)`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && <span className={styles.badge}>{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Notifications">
          <header className={styles.panelHeader}>
            <span>Notifications</span>
            {unread > 0 && (
              <button className={styles.mark} onClick={markAllRead}>Mark all read</button>
            )}
          </header>
          {items.length === 0 ? (
            <div className={styles.empty}>You're all caught up.</div>
          ) : (
            <ul className={styles.list}>
              {items.map((n) => {
                const inner = (
                  <>
                    <div className={styles.itemTitle}>{n.title}</div>
                    {n.body && <div className={styles.itemBody}>{n.body}</div>}
                    <time className={styles.itemTime}>{new Date(n.createdAt).toLocaleString()}</time>
                  </>
                );
                return (
                  <li key={n.id} className={n.seenAt ? styles.itemRead : styles.itemUnread}>
                    {n.href ? <Link href={n.href}>{inner}</Link> : inner}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
