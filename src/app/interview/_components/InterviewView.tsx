"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function InterviewView({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Start a new interview session
    async function initInterview() {
      try {
        const res = await fetch("/api/interview/start", {
          method: "POST",
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.id) {
          router.push(`/interview/${data.id}`);
        }
      } catch (err) {
        console.error("Failed to start interview:", err);
        router.push("/settings");
      }
    }

    initInterview();
  }, [userId, router]);

  return (
    <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
      <p>Starting your AI interview...</p>
    </div>
  );
}
