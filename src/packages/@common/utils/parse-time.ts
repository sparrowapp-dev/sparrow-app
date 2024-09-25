export class ParseTime {
  public convertMilliseconds(ms: number): string {
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;

    if (hours >= 1) {
      return `${hours.toFixed(2)} hr`;
    } else if (minutes >= 1) {
      return `${minutes.toFixed(2)} min`;
    } else if (seconds >= 1) {
      return `${seconds.toFixed(2)} sec`;
    } else {
      return `${ms} ms`;
    }
  }
}
