import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: isProd,
  tracesSampleRate: isProd ? 0.1 : 0,
  enableLogs: true,
  sendDefaultPii: false,

  ignoreErrors: ["ECONNRESET", "aborted", "Socket closed"],
});
