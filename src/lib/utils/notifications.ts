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
    duration: obj?.duration ?? 4000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "bottom-right",
  });
};

const error = (message: string, obj?: notifySetting) => {
  toasts.add({
    type: "error",
    description: message,
    duration: obj?.duration ?? 4000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "bottom-right",
  });
};

const info = (message: string, obj?: notifySetting) => {
  toasts.add({
    type: "info",
    description: message,
    duration: obj?.duration ?? 4000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "bottom-right",
  });
};

const warning = (message: string, obj?: notifySetting) => {
  toasts.add({
    type: "warning",
    description: message,
    duration: obj?.duration ?? 4000,
    theme: obj?.theme ?? "dark",
    placement: obj?.position ?? "bottom-right",
  });
};

export const notifications = {
  success,
  info,
  warning,
  error,
};
