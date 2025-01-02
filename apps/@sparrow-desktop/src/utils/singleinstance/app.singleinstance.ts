import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const singleInstanceHandlerWindows = async () => {
  await getCurrentWindow().setFocus();
  // await getCurrentWindow().center();
};

export const singleInstanceHandler = async () => {
  await listen("single-instance", singleInstanceHandlerWindows);
};
