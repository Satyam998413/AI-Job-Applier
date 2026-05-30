"use client";

import { ErrorState } from "@/components/ErrorState";

export default function PublicInterviewError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState error={error} reset={reset} />;
}
