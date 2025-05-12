// import "@app/styles/style.scss";
import "@sparrow/library/styles";
import "@sparrow/library/fluent-icons";
import "@sparrow/library/fluent-icons-regular";
import App from "./components/App.svelte";
import { RxDB } from "./database/database";
import mixpanel from "mixpanel-browser";
import constants from "@app/constants/constants";
import * as Sentry from "@sentry/svelte";
import { version } from "../package.json";

// // Initialize Sentry
if (
  constants.APP_ENVIRONMENT !== "LOCAL-FE" &&
  constants.SENTRY_DSN &&
  constants.APP_ENVIRONMENT
) {
  Sentry.init({
    dsn: constants.SENTRY_DSN,
    environment: constants.APP_ENVIRONMENT, // Set the environment
    release: version,
    beforeSend: (event, hint) => {
      const error = hint?.originalException;
      const status = (error as any)?.status || (error as any)?.response?.status;

      if (status >= 400 && status < 500) {
        return null;
      }
      return event;
    },
  });
}

async function init() {
  if (constants.ENABLE_MIX_PANEL === "true") {
    const mixPanelToken: string = constants.MIX_PANEL_TOKEN;
    mixpanel.init(mixPanelToken);
  }
  const rxdbInstance = RxDB.getInstance();
  await rxdbInstance.getDb();
  return new App({
    target: document.getElementById("app"),
  });
}

const app = init();
export default app;
