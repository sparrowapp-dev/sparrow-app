import { toasts } from "svelte-toasts";

type Theme = "light" | "dark";

type Placement =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-center"
  | "center-center";

interface NotifySetting {
  title?: string;
  duration?: number;
  theme?: Theme;
  position?: Placement;
  showProgress?: boolean;
}

const MAX_TOASTS = 3;
let activeToasts: number = 0;

const showToast = (
  type: "success" | "error" | "info" | "warning",
  message: string,
  obj?: NotifySetting,
) => {
  if (activeToasts >= MAX_TOASTS) {
    setTimeout(() => showToast(type, message, obj), 1000);
    return;
  }

  activeToasts++;

  toasts.add({
    type,
    description: message,
    duration: obj?.duration ?? 5000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "bottom-right",
    onRemove: () => {
      activeToasts--;
    },
  });
};

const success = (message: string, obj?: NotifySetting) =>
  showToast("success", message, obj);
const error = (message: string, obj?: NotifySetting) =>
  showToast("error", message, obj);
const info = (message: string, obj?: NotifySetting) =>
  showToast("info", message, obj);
const warning = (message: string, obj?: NotifySetting) =>
  showToast("warning", message, obj);

export const notifications = {
  success,
  error,
  info,
  warning,
};
