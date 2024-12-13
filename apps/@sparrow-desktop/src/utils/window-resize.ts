import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";

export const maximizeWindow = async () => {
  const isMaximized = await getCurrentWindow().isMaximized();
  if (!isMaximized) {
    await getCurrentWindow().toggleMaximize();
    await getCurrentWindow().setFocus();
    await getCurrentWindow().center();
  }
};

export const resizeWindowOnLogOut = async () => {
  const isMaximized = await getCurrentWindow().isMaximized();
  if (isMaximized) {
    const monitor = await currentMonitor();
    const monitorPhysicalSize = await getCurrentWindow().innerSize();
    const scaleFactor = monitor!.scaleFactor;
    const logicalSize = monitorPhysicalSize.toLogical(scaleFactor);

    const minWidth = 570;
    const maxWidth = 570;
    const minHeight = 700;
    const maxHeight = 700;

    if (logicalSize.width < minWidth) {
      logicalSize.width = minWidth;
    }
    if (logicalSize.width > maxWidth) {
      logicalSize.width = maxWidth;
    }
    if (logicalSize.height < minHeight) {
      logicalSize.height = minHeight;
    }
    if (logicalSize.height > maxHeight) {
      logicalSize.height = maxHeight;
    }
    await getCurrentWindow().setSize(logicalSize);
    await getCurrentWindow().center();
  }
};
