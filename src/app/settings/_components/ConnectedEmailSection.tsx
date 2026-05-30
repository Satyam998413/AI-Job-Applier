"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Notice } from "@/components/Notice";
import { Spinner } from "@/components/Spinner";
import { FormMessage } from "@/components/FormMessage";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { ConnectedEmailDto } from "@/types";
import styles from "./ConnectedEmailSection.module.css";

export function ConnectedEmailSection() {
  const [status, setStatus] = useState<ConnectedEmailDto | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    try {
      setStatus(await apiFetch<ConnectedEmailDto>("/api/nylas"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load connection");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function disconnect() {
    setBusy(true);
    setError("");
    try {
      setStatus(await apiFetch<ConnectedEmailDto>("/api/nylas", { method: "DELETE" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="bolt" size={18} /> Connected email
        </h2>
        <p className={styles.subtitle}>
          Link your Google account via Nylas to send outreach emails directly from the app.
        </p>
      </header>

      <FormMessage>{error}</FormMessage>

      {status === null ? (
        <Spinner label="Loading…" />
      ) : !status.nylasConfigured ? (
        <Notice tone="warning">
          Server isn&apos;t configured for Nylas yet. Set <code>NYLAS_API_KEY</code> and{" "}
          <code>NYLAS_CLIENT_ID</code> in <code>.env.local</code>, then restart.
        </Notice>
      ) : status.configured ? (
        <div className={styles.body}>
          <div className={styles.row}>
            <div className={styles.info}>
              <span className={styles.address}>{status.emailAddress}</span>
              <div className={styles.meta}>
                <Badge tone={status.syncStatus === "active" ? "success" : "warning"}>
                  <Icon name="check" size={12} />
                  {status.syncStatus === "active" ? "Connected" : status.syncStatus}
                </Badge>
                <span className={styles.provider}>via {status.provider ?? "google"}</span>
                {status.connectedAt ? (
                  <span className={styles.connectedAt}>
                    since {new Date(status.connectedAt).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </div>
            <div className={styles.actions}>
              <Button variant="secondary" href="/api/nylas/auth?intent=connect">
                Reconnect
              </Button>
              <Button variant="ghost" onClick={disconnect} disabled={busy}>
                {busy ? "Disconnecting…" : "Disconnect"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.connect}>
          <p className={styles.connectHint}>No email connected yet.</p>
          <GoogleAuthButton label="Connect Google email" intent="connect" />
        </div>
      )}
    </Card>
  );
}
