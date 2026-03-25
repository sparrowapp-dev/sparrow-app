/**
 * Formats a time value in milliseconds into a human-readable string with unit.
 * Values >= 1000ms are converted to seconds (2 decimal places).
 * @param time - Time in milliseconds.
 * @returns An object with `value` (formatted number string) and `unit` ("ms" or "s").
 */
export const formatTime = (time: number): { value: string; unit: string } => {
  if (time >= 1000) {
    return { value: (time / 1000).toFixed(2), unit: "s" };
  }
  return { value: String(time), unit: "ms" };
};
