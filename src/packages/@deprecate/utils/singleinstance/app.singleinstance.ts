import { listen } from "@tauri-apps/api/event";
import { getCurrent } from "@tauri-apps/api/window";

export const singleInstanceHandlerWindows = async () => {
  await getCurrent().setFocus();
  await getCurrent().center();
};

export const singleInstanceHandler = async () => {
  await listen("single-instance", singleInstanceHandlerWindows);
};
