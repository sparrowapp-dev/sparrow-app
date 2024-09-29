import { zoomIn, zoomOut } from "./zoom";
enum Shortcuts {
  ZoomInKey = "Equal",
  ZoomOutKey = "Minus",
}
export function handleShortcuts(event) {
  if (isZoomShortcutPressed(event)) {
    if (event.code === Shortcuts.ZoomInKey) {
      zoomIn();
    } else {
      zoomOut();
    }
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
