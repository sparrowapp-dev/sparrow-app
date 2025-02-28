import constants from "@app/constants/constants";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
let appInsights: ApplicationInsights | null = null;

if (constants.AZURE_INSIGHTS_CONNECTION_STRING) {
  appInsights = new ApplicationInsights({
    config: {
      connectionString: constants.AZURE_INSIGHTS_CONNECTION_STRING,
      disableAjaxTracking: true,
      disableFetchTracking: true,
    },
  });
  appInsights.loadAppInsights();
} else {
  console.warn(
    "Azure Application Insights is not configured. Skipping initialization.",
  );
}

export { appInsights };
