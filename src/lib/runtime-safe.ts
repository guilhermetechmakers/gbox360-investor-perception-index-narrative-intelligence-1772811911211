/**
 * Runtime-safe utilities for guarding against null/undefined in API responses
 * and array operations. Use these consistently across the codebase.
 */

/** Ensure value is an array; return empty array if null/undefined or not array */
export function ensureArray<T>(data: T[] | null | undefined): T[] {
  if (data == null) return []
  return Array.isArray(data) ? data : []
}

/**
 * Safely map over data; returns [] if data is not an array
 */
export function safeArray<T, U>(
  data: T[] | null | undefined,
  mapFn: (item: T, index: number) => U
): U[] {
  const arr = ensureArray(data)
  return arr.map(mapFn)
}

/**
 * Safely access nested object properties with a default fallback
 */
export function safeAccess<T>(
  obj: unknown,
  prop: string,
  defaultValue: T
): T {
  if (obj == null || typeof obj !== 'object') return defaultValue
  const val = (obj as Record<string, unknown>)[prop]
  return (val as T) ?? defaultValue
}

/**
 * Safely access nested path (e.g. 'payload.raw') with optional chaining
 */
export function safeAccessPath<T>(
  obj: unknown,
  path: string,
  defaultValue: T
): T {
  if (obj == null || typeof obj !== 'object') return defaultValue
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return defaultValue
    current = (current as Record<string, unknown>)[part]
  }
  return (current as T) ?? defaultValue
}
