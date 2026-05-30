import Link from "next/link";
import styles from "./GoogleAuthButton.module.css";

/**
 * Server-rendered link that kicks off the Nylas Google OAuth flow.
 * Phase C: signup + login share the same flow (callback finds-or-creates the user).
 */
export function GoogleAuthButton({ label, intent = "signup" }: { label: string; intent?: "signup" | "connect" }) {
  return (
    <Link href={`/api/nylas/auth?intent=${intent}`} className={styles.btn}>
      <span className={styles.icon} aria-hidden>
        <GoogleGlyph />
      </span>
      <span>{label}</span>
    </Link>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8a12 12 0 1 1 0-24c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3a12 12 0 0 1-19-5.5l-6.5 5A20 20 0 0 0 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.5l6.2 5.3c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.5-3.5z"
      />
    </svg>
  );
}
