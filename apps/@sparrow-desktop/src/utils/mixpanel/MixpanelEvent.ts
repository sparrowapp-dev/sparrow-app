import mixpanel from "mixpanel-browser";
import constants from "@app/constants/constants";

const MixpanelEvent = (eventName: string, properties?: object) => {
  if (constants.ENABLE_MIX_PANEL === "true") {
    mixpanel.track(eventName, { ...properties });
  }
};

export default MixpanelEvent;
