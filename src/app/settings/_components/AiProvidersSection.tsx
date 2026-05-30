"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { FormMessage } from "@/components/FormMessage";
import { apiFetch } from "@/lib/apiClient";
import { AI_PROVIDER_NAMES, type AiProviderName, type AiProviderRowDto } from "@/types";
import { ApiKeyRow } from "./ApiKeyRow";
import styles from "./AiProvidersSection.module.css";

const META: Record<AiProviderName, { label: string; description: string }> = {
  gemini: { label: "Google Gemini", description: "Used for resume parsing, matching, and tailoring." },
  openai: { label: "OpenAI", description: "GPT-4o-class models for the same AI tasks." },
  claude: { label: "Anthropic Claude", description: "Claude models with tool-call structured outputs." },
  groq: { label: "Groq", description: "Ultra-fast Llama 3.x inference on Groq." },
  ollama: { label: "Ollama (local)", description: "Stored for later — runtime support coming soon.", },
};

export function AiProvidersSection() {
  const [rows, setRows] = useState<AiProviderRowDto[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      setRows(await apiFetch<AiProviderRowDto[]>("/api/ai-providers"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load providers");
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
            <Icon name="bolt" size={18} /> AI providers
          </h2>
          <p className={styles.subtitle}>
            Configure your own API keys. The active provider powers resume parsing, match scoring, and resume tailoring.
          </p>
        </div>
      </header>
      <FormMessage>{error}</FormMessage>
      {rows === null ? (
        <Spinner label="Loading providers…" />
      ) : (
        <div className={styles.list}>
          {AI_PROVIDER_NAMES.map((p) => {
            const row = rows.find((r) => r.provider === p)!;
            return (
              <ApiKeyRow
                key={p}
                label={META[p].label}
                description={META[p].description}
                configured={row.configured}
                lastFour={row.lastFour}
                isActive={row.isActive}
                showActivate={p !== "ollama"}
                busy={busy}
                onSave={(apiKey) =>
                  withBusy(() =>
                    apiFetch(`/api/ai-providers/${p}`, {
                      method: "PUT",
                      body: JSON.stringify({ apiKey }),
                    }),
                  )
                }
                onActivate={() =>
                  withBusy(() => apiFetch(`/api/ai-providers/${p}/activate`, { method: "POST" }))
                }
                onDelete={() =>
                  withBusy(() => apiFetch(`/api/ai-providers/${p}`, { method: "DELETE" }))
                }
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
