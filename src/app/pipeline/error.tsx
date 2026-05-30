"use client";

import { ErrorState } from "@/components/ErrorState";

export default function PipelineError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState error={error} reset={reset} />;
}
