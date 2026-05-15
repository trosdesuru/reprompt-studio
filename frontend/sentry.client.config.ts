import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: isProd,

  tracesSampleRate: isProd ? 0.1 : 0,

  replaysSessionSampleRate: isProd ? 0.05 : 0,
  replaysOnErrorSampleRate: isProd ? 1 : 0,

  integrations: [Sentry.replayIntegration()],

  ignoreErrors: [
    "ECONNRESET",
    "aborted",
    "Socket closed",
    "fetch failed",
    "Network request failed",
  ],
});
