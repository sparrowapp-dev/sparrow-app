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

//add dots after certain length cross
export function truncatePath(path: string, maxlength: number) {
  if (path.length > maxlength) {
    return path.substring(0, maxlength) + "...";
  }
  return path;
}
