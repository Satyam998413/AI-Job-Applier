"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { FormMessage } from "@/components/FormMessage";
import { Notice } from "@/components/Notice";
import { Icon } from "@/components/Icon";
import { apiFetch } from "@/lib/apiClient";
import type { AssistantConversationDto, AssistantMessageDto } from "@/types";
import { MessageBubble } from "./MessageBubble";
import styles from "./AssistantView.module.css";

const STARTERS = [
  "What should I focus on next?",
  "How's my pipeline looking?",
  "Which of my missing skills should I learn first?",
  "Help me prep for my next interview.",
];

export function AssistantView({ initial }: { initial: AssistantConversationDto }) {
  const [messages, setMessages] = useState<AssistantMessageDto[]>(initial.messages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sending]);

  async function send(content: string) {
    const text = content.trim();
    if (!text || sending) return;
    setInput("");
    setError("");
    // Optimistically add the user message.
    const userMsg: AssistantMessageDto = { role: "user", content: text, at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const conv = await apiFetch<AssistantConversationDto>("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setMessages(conv.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
      // Roll back the optimistic user message.
      setMessages((prev) => prev.filter((m) => m !== userMsg));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  async function reset() {
    if (!confirm("Reset this conversation? The history will be deleted.")) return;
    try {
      const conv = await apiFetch<AssistantConversationDto>("/api/assistant", { method: "DELETE" });
      setMessages(conv.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Career assistant</h1>
          <p className={styles.subtitle}>
            Grounded in your resume, pipeline, and saved answers. Ask anything career-related.
          </p>
        </div>
        {messages.length > 0 ? (
          <Button variant="ghost" onClick={reset}>
            <Icon name="shield" size={16} /> Reset
          </Button>
        ) : null}
      </header>

      <Card className={styles.chatCard}>
        <div className={styles.thread}>
          {messages.length === 0 ? (
            <div className={styles.empty}>
              <Notice>
                Ask anything about your job search. Suggestions below to get started.
              </Notice>
              <div className={styles.starters}>
                {STARTERS.map((s) => (
                  <button key={s} className={styles.starter} onClick={() => send(s)} disabled={sending}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.messages}>
              {messages.map((m, i) => (
                <MessageBubble key={`${m.role}-${i}`} message={m} />
              ))}
              {sending ? (
                <div className={styles.thinking}>
                  <Spinner label="Thinking…" />
                </div>
              ) : null}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <textarea
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
            rows={2}
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !input.trim()}>
            <Icon name="arrowRight" size={16} /> Send
          </Button>
        </form>

        <FormMessage>{error}</FormMessage>
      </Card>
    </div>
  );
}
