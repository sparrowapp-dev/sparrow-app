import constants from "@app/constants/constants";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";

export const appInsights = new ApplicationInsights({
  config: {
    connectionString: `${constants.AZURE_INSIGHTS_CONNECTION_STRING}`,
    disableAjaxTracking: true,
    disableFetchTracking: true,
  },
});
appInsights.loadAppInsights();
