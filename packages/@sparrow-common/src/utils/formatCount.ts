// Common function for abbreviated count formatting (e.g., GitHub stars/forks)
export const FormatCount = (count: number | string) => {
  const num = typeof count === "string" ? parseInt(count, 10) : count;
  if (!num || isNaN(num)) return "";
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
};
