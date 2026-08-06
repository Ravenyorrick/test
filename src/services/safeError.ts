export function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return redactSecrets(message);
}

export function redactSecrets(value: string): string {
  return value
    .replace(/x-api-key["':=\s]+[A-Za-z0-9._-]+/gi, "x-api-key=[redacted]")
    .replace(/api[_-]?key["':=\s]+[A-Za-z0-9._-]+/gi, "api_key=[redacted]");
}
