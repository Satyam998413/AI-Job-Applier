"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { FormMessage } from "@/components/FormMessage";
import { apiFetch } from "@/lib/apiClient";
import type { JsearchStatusDto } from "@/types";
import { ApiKeyRow } from "./ApiKeyRow";
import { UsageCard } from "./UsageCard";
import styles from "./JsearchSection.module.css";

export function JsearchSection() {
  const [status, setStatus] = useState<JsearchStatusDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      setStatus(await apiFetch<JsearchStatusDto>("/api/jsearch"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load JSearch status");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function withBusy<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>
            <Icon name="briefcase" size={18} /> JSearch key &amp; usage
          </h2>
          <p className={styles.subtitle}>
            Live job search uses your own JSearch (RapidAPI) key. Subscribe to the free Basic plan at{" "}
            <a
              href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch"
              target="_blank"
              rel="noreferrer"
            >
              rapidapi.com/jsearch
            </a>{" "}
            to enable it.
          </p>
        </div>
      </header>
      <FormMessage>{error}</FormMessage>
      {status === null ? (
        <Spinner label="Loading…" />
      ) : (
        <div className={styles.body}>
          <UsageCard
            used={status.usedThisMonth}
            total={status.totalLimit}
            remaining={status.remaining}
            monthKey={status.monthKey}
            lastCallAt={status.lastCallAt}
          />
          <ApiKeyRow
            label="JSearch (RapidAPI)"
            description="Powers live job ingestion from LinkedIn/Indeed/Glassdoor postings via Google for Jobs."
            configured={status.configured}
            lastFour={status.lastFour}
            isActive={status.configured && status.isActive}
            showActivate={false}
            busy={busy}
            onSave={(apiKey) =>
              withBusy(() => apiFetch("/api/jsearch", { method: "PUT", body: JSON.stringify({ apiKey }) }))
            }
            onActivate={async () => {}}
            onDelete={() => withBusy(() => apiFetch("/api/jsearch", { method: "DELETE" }))}
          />
        </div>
      )}
    </Card>
  );
}
