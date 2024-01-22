import { Shortcuts } from "./enums/shortcuts-enum";
import { handleZoom } from "./zoom";

export function handleShortcuts(event) {
  if (isZoomShortcutPressed(event)) {
    handleZoom(event);
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
