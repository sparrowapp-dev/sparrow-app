import { zoomIn, zoomOut } from "./zoom";
enum Shortcuts {
  ZoomInKey = "Equal",
  ZoomOutKey = "Minus",
}
let isZooming = false;

export function handleShortcuts(event) {
  if (isZoomShortcutPressed(event) && !isZooming) {
    isZooming = true;

    if (event.code === Shortcuts.ZoomInKey) {
      zoomIn();
    } else if (event.code === Shortcuts.ZoomOutKey) {
      zoomOut();
    }

    // Reset the flag after a short delay
    setTimeout(() => {
      isZooming = false;
    }, 200); // Adjust delay time as needed
  }
}

function isZoomShortcutPressed(event) {
  if (
    (event.metaKey || event.ctrlKey) &&
    (event.code === Shortcuts.ZoomInKey || event.code === Shortcuts.ZoomOutKey)
  ) {
    return true;
  }
  return false;
}
