"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { FormMessage } from "@/components/FormMessage";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { apiFetch } from "@/lib/apiClient";
import type { UserDto } from "@/types";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch<UserDto>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier: form.get("identifier"), password: form.get("password") }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <GoogleAuthButton label="Continue with Google" />
      <div className={styles.divider}>
        <span className={styles.dividerText}>or sign in with</span>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <Input
        id="identifier"
        name="identifier"
        type="text"
        label="Email or mobile"
        autoComplete="username"
        required
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
      />
      <FormMessage>{error}</FormMessage>
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      </form>
    </div>
  );
}
