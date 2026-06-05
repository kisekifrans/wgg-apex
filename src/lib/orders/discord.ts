/** Normalize Discord handle for lookup (strip @, lowercase). */
export function normalizeDiscordHandle(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase();
}
