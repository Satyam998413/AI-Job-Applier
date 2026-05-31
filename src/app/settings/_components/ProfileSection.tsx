"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { UserProfileDto } from "@/types";
import { PasswordForm } from "./PasswordForm";
import styles from "./ProfileSection.module.css";

export function ProfileSection() {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setUser(await apiFetch<UserProfileDto>("/api/user"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load profile");
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const next = await apiFetch<UserProfileDto>("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: f.get("fullName"),
          mobile: f.get("mobile") ?? "",
        }),
      });
      setUser(next);
      setInfo("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="shield" size={18} /> Profile
        </h2>
        <p className={styles.subtitle}>Keep your account details accurate and your password fresh.</p>
      </header>

      {!user ? (
        <Spinner label="Loading profile…" />
      ) : (
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.grid}>
            <Input id="fullName" name="fullName" label="Full name" defaultValue={user.fullName} required />
            <Input id="email" name="email" type="email" label="Email (Read-only)" defaultValue={user.email} disabled />
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              label="Mobile (optional)"
              defaultValue={user.mobile ?? ""}
              placeholder="+91 98765 43210"
            />
          </div>
          {info ? <FormMessage tone="info">{info}</FormMessage> : null}
          <FormMessage>{error}</FormMessage>
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}

      <hr className={styles.divider} />
      <PasswordForm />
    </Card>
  );
}
