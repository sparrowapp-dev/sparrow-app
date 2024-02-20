import { Shortcuts } from "./enums/shortcuts-enum";
import { zoomIn, zoomOut } from "./zoom";

export function handleShortcuts(event) {
  console.log(event.code);
  console.log(event.metaKey);

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
