import "server-only";

import * as Sentry from "@sentry/nextjs";

export type CaptureErrorContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

export function captureError(
  error: unknown,
  context?: CaptureErrorContext
): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[error]", message, context?.extra ?? "");

  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      scope.setExtras(context.extra);
    }
    Sentry.captureException(error);
  });
}
