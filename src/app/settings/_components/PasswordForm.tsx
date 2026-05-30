"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { apiFetch } from "@/lib/apiClient";
import styles from "./PasswordForm.module.css";

export function PasswordForm() {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <form className={styles.form} onSubmit={onSubmit}>
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
