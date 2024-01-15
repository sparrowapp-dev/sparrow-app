import mixpanel from "mixpanel-browser";

const MixpanelEvent = (eventName: string, properties?: object) => {
  mixpanel.track(eventName, { ...properties });
};

export default MixpanelEvent;
