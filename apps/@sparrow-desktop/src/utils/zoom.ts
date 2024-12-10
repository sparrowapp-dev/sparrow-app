import { WindowSettingReposistory } from "@app/repositories/window-settings.repository";
import { getCurrentWebview } from "@tauri-apps/api/webview";

const windowSettingRepository = new WindowSettingReposistory();
const MAX_ZOOM_SCALE_FACTOR = 1.6;
const MIN_ZOOM_SCALE_FACTOR = 0.6;

export async function zoomIn() {
  let windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  windowScaleFactor = windowScaleFactor
    ? +windowScaleFactor._data.value + 0.2
    : 1.2;
  if (windowScaleFactor < MAX_ZOOM_SCALE_FACTOR) {
    setScaleFactorToDb(windowScaleFactor);
  }
}

export async function zoomOut() {
  let windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  windowScaleFactor = windowScaleFactor
    ? +windowScaleFactor._data.value - 0.2
    : 1.0;
  if (windowScaleFactor > MIN_ZOOM_SCALE_FACTOR) {
    setScaleFactorToDb(windowScaleFactor);
  }
}

export async function setScaleFactorToDb(windowScaleFactor: string) {
  await getCurrentWebview().setZoom(+windowScaleFactor);
  await windowSettingRepository.setWindowSetting(
    "windowScaleFactor",
    windowScaleFactor,
  );
}

export async function getScaleFactor() {
  const windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  return windowScaleFactor._data.value ?? "1";
}
