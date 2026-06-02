"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { apiFetch } from "@/lib/apiClient";
import type { UserProfileDto } from "@/types";
import styles from "./PasswordForm.module.css";

export function PasswordForm() {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordSetByUser, setPasswordSetByUser] = useState(true);

  // Fetch user profile to determine if they're a Nylas user
  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await apiFetch<UserProfileDto>("/api/user");
        setPasswordSetByUser(user.passwordSetByUser);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      await apiFetch("/api/user/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.get("currentPassword"),
          newPassword: data.get("newPassword"),
        }),
      });
      setInfo("Password updated.");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  }

  async function onSetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      await apiFetch("/api/auth/set-password", {
        method: "POST",
        body: JSON.stringify({
          newPassword: data.get("newPassword"),
        }),
      });
      setInfo("Password set successfully. You can now log in with your email and password.");
      setPasswordSetByUser(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set password");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <form className={styles.form}>
        <h3 className={styles.title}>Password</h3>
        <p>Loading...</p>
      </form>
    );
  }

  // Nylas users who haven't set their password yet
  if (!passwordSetByUser) {
    return (
      <form className={styles.form} onSubmit={onSetPassword}>
        <h3 className={styles.title}>Set password</h3>
        <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
          You signed up with Google/Nylas. Set a password to enable email + password login.
        </p>
        <div className={styles.grid}>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="Password (min 8 chars)"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        {info ? <FormMessage tone="info">{info}</FormMessage> : null}
        <FormMessage>{error}</FormMessage>
        <div>
          <Button type="submit" variant="secondary" disabled={busy}>
            {busy ? "Setting…" : "Set password"}
          </Button>
        </div>
      </form>
    );
  }

  // Regular users who can change their password
  return (
    <form className={styles.form} onSubmit={onChangePassword}>
      <h3 className={styles.title}>Change password</h3>
      <div className={styles.grid}>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          label="Current password"
          autoComplete="current-password"
          required
        />
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          label="New password (min 8 chars)"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {info ? <FormMessage tone="info">{info}</FormMessage> : null}
      <FormMessage>{error}</FormMessage>
      <div>
        <Button type="submit" variant="secondary" disabled={busy}>
          {busy ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
