export class FormatDays {
  // Array of day mappings with short and full names
  private weekDays = [
    { label: "Sun", fullName: "Sunday", dayNumber: 0 },
    { label: "Mon", fullName: "Monday", dayNumber: 1 },
    { label: "Tue", fullName: "Tuesday", dayNumber: 2 },
    { label: "Wed", fullName: "Wednesday", dayNumber: 3 },
    { label: "Thu", fullName: "Thursday", dayNumber: 4 },
    { label: "Fri", fullName: "Friday", dayNumber: 5 },
    { label: "Sat", fullName: "Saturday", dayNumber: 6 },
  ];

  /**
   * Format day numbers into day names
   * @param dayNumbers - Single number or array of day numbers (0-6)
   * @returns Formatted string of day names
   */
  public formatDays(dayNumbers: number | string | (number | string)[]): string {
    // Handle empty input
    if (!dayNumbers) return "";

    // Convert single number to array
    const numbers = Array.isArray(dayNumbers) ? dayNumbers : [dayNumbers];

    // Use full names only for single days
    const useFullNames = numbers.length === 1;

    // Map numbers to day names and join with commas
    return numbers
      .map((num) => {
        const dayNum = typeof num === "string" ? parseInt(num) : num;
        const day = this.weekDays.find((d) => d.dayNumber === dayNum);
        return day ? (useFullNames ? day.fullName : day.label) : num.toString();
      })
      .join(", ");
  }
}
