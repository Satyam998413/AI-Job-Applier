"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { UserDto } from "@/types";
import styles from "./ProfileSettingsTab.module.css";

export function ProfileSettingsTab() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await apiFetch<UserDto>("/api/auth/me", { method: "GET" });
        setUser(userData);
        setFullName(userData.fullName);
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load user info" });
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await apiFetch("/api/auth/update-profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName, mobile }),
      });
      setUser((prev) => (prev ? { ...prev, fullName } : null));
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/api/auth/set-password", {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "Password changed successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Password change failed" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div>Loading profile settings...</div>;
  if (!user) return <div>Unable to load profile</div>;

  return (
    <div className={styles.wrap}>
      {/* Profile Information Section */}
      <div className={styles.section}>
        <header className={styles.header}>
          <h3 className={styles.title}>Profile Information</h3>
          <p className={styles.subtitle}>Update your personal details</p>
        </header>

        <form className={styles.form} onSubmit={handleProfileUpdate}>
          <div className={styles.twoCol}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                Email (Read-only)
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={user.email}
                disabled
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="mobile">
              Mobile Number (Optional)
            </label>
            <input
              id="mobile"
              type="tel"
              className={styles.input}
              placeholder="+1 (555) 123-4567"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? "Updating…" : "Update Profile"}
          </button>
        </form>
      </div>

      {/* Password Change Section */}
      <div className={styles.section}>
        <header className={styles.header}>
          <h3 className={styles.title}>Change Password</h3>
          <p className={styles.subtitle}>Update your login password</p>
        </header>

        <form className={styles.form} onSubmit={handlePasswordChange}>
          <div className={styles.twoCol}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={8}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                minLength={8}
              />
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? "Updating…" : "Change Password"}
          </button>
        </form>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}
    </div>
  );
}
