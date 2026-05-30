"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { FormMessage } from "@/components/FormMessage";
import styles from "./ApiKeySetForm.module.css";

export function ApiKeySetForm({
  label,
  busy,
  onSave,
  onCancel,
}: {
  label: string;
  busy: boolean;
  onSave: (apiKey: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSave(value.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save key");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <Input
        id={`key-${label}`}
        label={`${label} API key`}
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        minLength={8}
        placeholder="Paste key here"
      />
      <FormMessage>{error}</FormMessage>
      <div className={styles.actions}>
        <Button type="submit" disabled={busy || submitting}>
          {submitting ? "Saving…" : "Save key"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
