"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { FormMessage } from "@/components/FormMessage";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { apiFetch } from "@/lib/apiClient";
import type { UserDto } from "@/types";
import styles from "./RegisterForm.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch<UserDto>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          mobile: form.get("mobile") || undefined,
          password: form.get("password"),
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <GoogleAuthButton label="Sign up with Google" />
      <div className={styles.divider}>
        <span className={styles.dividerText}>or use email</span>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <Input id="fullName" name="fullName" label="Full name" autoComplete="name" required />
        <Input id="email" name="email" type="email" label="Email" autoComplete="email" required />
        <Input
          id="mobile"
          name="mobile"
          type="tel"
          label="Mobile (optional)"
          autoComplete="tel"
          placeholder="+91 98765 43210"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FormMessage>{error}</FormMessage>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
