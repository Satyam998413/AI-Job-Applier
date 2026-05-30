import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

/** Standard JSON success response. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Standard JSON error response: { error: string }. */
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Maps common thrown errors to JSON responses. Use in route catch blocks. */
export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return fail(err.issues.map((i) => i.message).join("; "), 422);
  }
  // Anything that reaches this branch is a real 500 — report it.
  Sentry.captureException(err);
  if (err instanceof Error) {
    return fail(err.message, 500);
  }
  return fail("Unexpected error", 500);
}
