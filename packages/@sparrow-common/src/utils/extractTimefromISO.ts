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

      // Convert to IST by adding 5 hours and 30 minutes to UTC time
      const istHours = (date.getUTCHours() + 5) % 24;
      const istMinutes = (date.getUTCMinutes() + 30) % 60;

      // Adjust hours if minutes overflow
      const adjustedHours =
        istMinutes < date.getUTCMinutes() ? (istHours + 1) % 24 : istHours;

      // Format with leading zeros
      const hours = adjustedHours.toString().padStart(2, "0");
      const minutes = istMinutes.toString().padStart(2, "0");

      // Return in HH:MM format
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error parsing ISO date string:", error);
      return "";
    }
  }
}
