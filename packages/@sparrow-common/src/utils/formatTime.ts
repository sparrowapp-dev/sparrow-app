export class FormatTime {
  public formatTimeAgo = (date) => {
    const diffInSeconds = (new Date() - new Date(date)) / 1000;
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours >= 1) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes >= 1) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      const seconds = Math.floor(diffInSeconds);
      return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
  };
}
