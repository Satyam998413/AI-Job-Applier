"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormMessage } from "@/components/FormMessage";
import { Spinner } from "@/components/Spinner";
import { Icon } from "@/components/Icon";
import { SeedJobsButton } from "./SeedJobsButton";
import { apiFetch } from "@/lib/apiClient";
import styles from "./JobSearchForm.module.css";

export function JobSearchForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const role = String(form.get("role") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    try {
      await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({ role, location: location || undefined }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.fields}>
          <Input id="role" name="role" label="Role / keywords" placeholder="e.g. React developer" required />
          <Input id="location" name="location" label="Location (optional)" placeholder="e.g. Remote, London" />
        </div>
        <div className={styles.actions}>
          {loading ? (
            <Spinner label="Searching live jobs…" />
          ) : (
            <>
              <Button type="submit">
                <Icon name="briefcase" size={18} /> Search jobs
              </Button>
              <SeedJobsButton />
            </>
          )}
        </div>
        <FormMessage>{error}</FormMessage>
      </form>
    </Card>
  );
}
