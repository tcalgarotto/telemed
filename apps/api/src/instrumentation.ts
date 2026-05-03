import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent } from "@sentry/core";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV ?? "development",
      beforeSend(event: ErrorEvent) {
        // Filter out sensitive health data
        if (event.request?.data) {
          delete event.request.data;
        }
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV ?? "development",
    });
  }
}
