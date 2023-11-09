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

interface notifySetting {
  title: string;
  duration: number;
  theme: Theme;
  position: Placement;
  showProgress: boolean;
}

const success = (message: string, obj?: notifySetting) => {
  toasts.add({
    type: "success",
    description: message,
    title: obj?.title ?? "Success",
    duration: obj?.duration ?? 3000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "bottom-right",
    showProgress: obj?.showProgress ?? true,
  });
};

const error = (message: string, obj?: notifySetting) => {
  toasts.add({
    type: "error",
    description: message,
    title: obj?.title ?? "Error",
    duration: obj?.duration ?? 3000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "bottom-center",
    showProgress: obj?.showProgress ?? true,
  });
};

const info = (message: string, obj?: notifySetting) => {
  toasts.add({
    type: "info",
    description: message,
    title: obj?.title ?? "Info",
    duration: obj?.duration ?? 3000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "top-right",
    showProgress: obj?.showProgress ?? true,
  });
};

const warning = (message: string, obj?: notifySetting) => {
  toasts.add({
    type: "warning",
    description: message,
    title: obj?.title ?? "Warning",
    duration: obj?.duration ?? 3000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "top-right",
    showProgress: obj?.showProgress ?? true,
  });
};

export const notifications = {
  success,
  info,
  warning,
  error,
};
