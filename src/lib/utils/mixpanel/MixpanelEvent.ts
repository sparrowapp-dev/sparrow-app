import type { MixpanelEvents } from "$lib/utils/interfaces/mixpanel.interface";
import mixpanel from "mixpanel-browser";

const MixpanelEvent = (props?: MixpanelEvents) => {
  mixpanel.track(props.eventName, { ...props.properties });
};

export default MixpanelEvent;
