import { WindowSettingReposistory } from "$lib/repositories/window-settings.repository";
import { invoke } from "@tauri-apps/api";
import { Shortcuts } from "./enums/shortcuts-enum";

const windowSettingRepository = new WindowSettingReposistory();

export async function handleZoom(event) {
  if (event.code === Shortcuts.ZoomInKey) {
    await zoomIn();
  } else if (event.code === Shortcuts.ZoomOutKey) {
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
