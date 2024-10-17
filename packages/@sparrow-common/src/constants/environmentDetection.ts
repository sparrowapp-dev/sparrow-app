export function isWebApp(): boolean {
  return typeof window !== "undefined" && !window.require;
}

export function isDesktopApp(): boolean {
  return typeof window !== "undefined" && !!window.require;
}
