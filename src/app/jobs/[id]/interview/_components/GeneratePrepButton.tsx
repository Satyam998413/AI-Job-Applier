"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { FormMessage } from "@/components/FormMessage";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import styles from "./GeneratePrepButton.module.css";

export function GeneratePrepButton({
  jobId,
  hasPrep,
  hasResume,
}: {
  jobId: string;
  hasPrep: boolean;
  hasResume: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/api/jobs/${jobId}/interview-prep`, { method: "POST" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate questions");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <Button onClick={run} disabled={busy || !hasResume}>
        <Icon name="wand" size={16} />
        {busy ? "Generating…" : hasPrep ? "Regenerate questions" : "Generate questions"}
      </Button>
      {busy ? <Spinner label="Generating likely interview questions…" /> : null}
      <FormMessage>{error}</FormMessage>
    </div>
  );
}
