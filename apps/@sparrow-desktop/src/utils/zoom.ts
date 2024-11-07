import { WindowSettingReposistory } from "@app/repositories/window-settings.repository";
import { invoke } from "@tauri-apps/api/core";

const windowSettingRepository = new WindowSettingReposistory();

export async function zoomIn() {
  await invoke("connect_socket_io_v4", {
    url: "http://localhost:3005",
    namespace: "ns1",
  });
  let windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  windowScaleFactor = windowScaleFactor
    ? +windowScaleFactor._data.value + 0.2
    : 1.2;
  invoke("zoom_window", { scaleFactor: windowScaleFactor });
  setScaleFactorToDb(windowScaleFactor);
}

export async function zoomOut() {
  let windowScaleFactor =
    await windowSettingRepository.getWindowSetting("windowScaleFactor");
  windowScaleFactor = windowScaleFactor
    ? +windowScaleFactor._data.value - 0.2
    : 1.0;
  invoke("zoom_window", { scaleFactor: windowScaleFactor });
  setScaleFactorToDb(windowScaleFactor);
}

async function setScaleFactorToDb(windowScaleFactor: string) {
  await windowSettingRepository.setWindowSetting(
    "windowScaleFactor",
    windowScaleFactor,
  );
}
