//get path for url
export function getPathFromUrl(url: string) {
  try {
    const urlObject = new URL(url);
    return urlObject.pathname;
  } catch (error) {
    console.error("Invalid URL:", url);
  }
}

// replace / with >
export function replaceSlashWithGreaterThanSymbol(str: string) {
  const stringWithoutFirstSlash = str.replace(/^\//, "");
  const replacedStringwithoutSlash = stringWithoutFirstSlash.replace(
    /([^/])\//g,
    "$1>",
  );

  return replacedStringwithoutSlash;
}
