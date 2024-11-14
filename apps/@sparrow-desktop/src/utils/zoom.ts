import { WindowSettingReposistory } from "@app/repositories/window-settings.repository";
import { getCurrentWebview } from "@tauri-apps/api/webview";

const windowSettingRepository = new WindowSettingReposistory();

export async function zoomIn() {
  let windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  windowScaleFactor = windowScaleFactor
    ? +windowScaleFactor._data.value + 0.2
    : 1.2;
  await getCurrentWebview().setZoom(windowScaleFactor);
  setScaleFactorToDb(windowScaleFactor);
}

export async function zoomOut() {
  let windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  windowScaleFactor = windowScaleFactor
    ? +windowScaleFactor._data.value - 0.2
    : 1.0;
  await getCurrentWebview().setZoom(windowScaleFactor);
  setScaleFactorToDb(windowScaleFactor);
}

async function setScaleFactorToDb(windowScaleFactor: string) {
  await windowSettingRepository.setWindowSetting(
    "windowScaleFactor",
    windowScaleFactor,
  );
}
