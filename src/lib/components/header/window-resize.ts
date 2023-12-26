import { platform } from "@tauri-apps/api/os";
import { appWindow, currentMonitor, getCurrent } from "@tauri-apps/api/window";

export const resizeWindowOnLogin = async () => {
  const platformName = await platform();
  if (platformName == "darwin") {
    const resizeButton = document.getElementById("resize-button");
    if (resizeButton) {
      resizeButton.click();
    }
  } else {
    await appWindow.maximize();
  }
};

export const resizeWindowOnLogOut = async () => {
  const monitor = await currentMonitor();
  const monitorPhysicalSize = await getCurrent().innerSize();
  const scaleFactor = monitor.scaleFactor;
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
  await getCurrent().setSize(logicalSize);
  await getCurrent().center();
};
