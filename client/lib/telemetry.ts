type TelemetryPrimitive = string | number | boolean | null | undefined;

export type TelemetryMetadata = Record<string, TelemetryPrimitive>;

export interface ClientErrorTelemetry {
  component: string;
  action: string;
  error: unknown;
  metadata?: TelemetryMetadata;
}

interface TelemetryPayload {
  type: 'client_error';
  component: string;
  action: string;
  message: string;
  errorName: string;
  stack?: string;
  metadata?: TelemetryMetadata;
  path?: string;
  timestamp: string;
}

function normalizeError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message || 'Unknown error',
      stack: error.stack,
    };
  }

  if (typeof error === 'string' && error.trim()) {
    return {
      name: 'Error',
      message: error,
    };
  }

  return {
    name: 'UnknownError',
    message: 'An unknown error occurred',
  };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

export function reportClientError({
  component,
  action,
  error,
  metadata,
}: ClientErrorTelemetry): void {
  const normalized = normalizeError(error);
  const payload: TelemetryPayload = {
    type: 'client_error',
    component,
    action,
    message: normalized.message,
    errorName: normalized.name,
    stack: normalized.stack,
    metadata,
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[telemetry]', {
      component: payload.component,
      action: payload.action,
      message: payload.message,
      errorName: payload.errorName,
      metadata: payload.metadata,
      path: payload.path,
      timestamp: payload.timestamp,
    });
  }

  if (typeof window === 'undefined') return;

  try {
    window.dispatchEvent(new CustomEvent('nesohq:telemetry', { detail: payload }));
  } catch {
    // Ignore dispatch failures; telemetry must never break UX.
  }

  const endpoint = process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT?.trim();
  if (!endpoint) return;

  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    // Fall through to fetch if sendBeacon fails.
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Ignore telemetry transport errors.
  });
}
