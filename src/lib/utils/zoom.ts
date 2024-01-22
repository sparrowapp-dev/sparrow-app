import { WindowSettingReposistory } from "$lib/repositories/window-settings.repository";
import { invoke } from "@tauri-apps/api";

const windowSettingRepository = new WindowSettingReposistory();

export async function handleZoomOnMac(event) {
  if (event.metaKey && event.code === "Equal") {
    await zoomIn();
  } else if (event.metaKey && event.code === "Minus") {
    await zoomOut();
  }
}

export async function handleZoomOnWindows(event) {
  if (event.ctrlKey && event.code === "Equal") {
    await zoomIn();
  } else if (event.ctrlKey && event.code === "Minus") {
    await zoomOut();
  }
}

async function zoomIn() {
  let windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  windowScaleFactor = windowScaleFactor
    ? +windowScaleFactor._data.value + 0.2
    : 1.2;
  invoke("zoom_window", { scaleFactor: windowScaleFactor });
  setScaleFactorToDb(windowScaleFactor);
}

async function zoomOut() {
  let windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  windowScaleFactor = windowScaleFactor
    ? +windowScaleFactor._data.value - 0.2
    : 1.0;
  invoke("zoom_window", { scaleFactor: windowScaleFactor });
  setScaleFactorToDb(windowScaleFactor);
}

async function setScaleFactorToDb(windowScaleFactor) {
  await windowSettingRepository.setWindowSetting(
    "windowScaleFactor",
    windowScaleFactor,
  );
}
