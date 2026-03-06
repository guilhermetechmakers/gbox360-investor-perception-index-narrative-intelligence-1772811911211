import { useMemo } from 'react'

/**
 * Guards loading state and data access. Returns isLoading and a safe data reference.
 * Use when consuming API/Supabase results that may be null or undefined.
 *
 * @param data - Raw data (may be null/undefined)
 * @param isLoading - Explicit loading flag
 * @returns { isLoading, dataSafe } - dataSafe is data ?? null, or empty array for arrays
 */
export function useLoadingState<T>(
  data: T | null | undefined,
  isLoading?: boolean
): { isLoading: boolean; dataSafe: T | null } {
  const dataSafe = useMemo(() => data ?? null, [data])
  const isActuallyLoading = isLoading === true

  return {
    isLoading: isActuallyLoading,
    dataSafe,
  }
}

/**
 * Safely maps over an array. Returns empty array if input is null/undefined or not an array.
 *
 * @param array - Array to map (may be null/undefined)
 * @param callback - Map callback
 * @returns Mapped array or empty array
 */
export function useGuardedMap<T, U>(
  array: T[] | null | undefined,
  callback: (item: T, index: number) => U
): U[] {
  return useMemo(() => {
    const items = array ?? []
    return Array.isArray(items) ? items.map(callback) : []
  }, [array, callback])
}
