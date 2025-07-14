import { writable } from 'svelte/store';

const throttleMap = new Map<string, number>();

export const throttleStore = writable(throttleMap);

/**
 * Checks if the action for this ID is allowed based on throttle time.
 * @param id Unique ID (e.g., value?._id)
 * @param throttleMs Time in ms to throttle (e.g., 10000)
 * @returns true if allowed to execute, false if throttled
 */
export function shouldRunThrottled(id: string, throttleMs = 10000): boolean {
  const now = Date.now();
  const lastRun = throttleMap.get(id) ?? 0;

  if (now - lastRun > throttleMs) {
    throttleMap.set(id, now);
    throttleStore.set(throttleMap); // trigger reactivity
    return true;
  }

  return false;
}
