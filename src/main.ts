import "@app/styles/style.scss";
import App from "@app/components/App.svelte";
import { RxDB } from "@app/database/database";
import mixpanel from "mixpanel-browser";
import constants from "$lib/utils/constants";
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
