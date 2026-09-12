export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>]/g, '')     // Remove dangling brackets
    .trim();
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().toLowerCase();
}
