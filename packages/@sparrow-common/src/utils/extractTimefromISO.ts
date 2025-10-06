/**
 * Utility class for extracting and manipulating time from ISO strings
 */
export class TimeISOExtractor {
  /**
   * Extracts time in HH:MM format from ISO date string
   * @param isoString - ISO formatted date string (e.g., "2025-10-06T10:33:00.000Z")
   * @returns Time in HH:MM format (e.g., "10:33")
   */
  public extractTimeFromISOString(isoString: string): string {
    if (!isoString) return "";

    try {
      // Create a date object from the ISO string
      const date = new Date(isoString);

      // Extract hours and minutes and format with leading zeros
      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");

      // Return in HH:MM format
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error parsing ISO date string:", error);
      return "";
    }
  }
}
