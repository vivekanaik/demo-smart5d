/**
 * Executes a server-side data fetching function safely.
 * If the call throws (e.g. no DB connection while offline),
 * returns the provided fallback value instead of crashing.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
