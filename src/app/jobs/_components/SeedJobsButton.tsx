"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/apiClient";

export function SeedJobsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function seed() {
    setLoading(true);
    try {
      await apiFetch("/api/jobs", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={seed} disabled={loading}>
      {loading ? "Loading jobs…" : "Load sample jobs"}
    </Button>
  );
}
