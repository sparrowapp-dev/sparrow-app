import { ApplicationInsights } from "@microsoft/applicationinsights-web";

export const appInsights = new ApplicationInsights({
  config: {
    connectionString:
      "InstrumentationKey=a1a41bff-dd46-494c-8da5-16deca5daf32;IngestionEndpoint=https://centralindia-0.in.applicationinsights.azure.com/;LiveEndpoint=https://centralindia.livediagnostics.monitor.azure.com/;ApplicationId=79949c18-deba-4d2e-8ab5-00c1f2496b56",
    disableAjaxTracking: true,
    disableFetchTracking: true,
  },
});
appInsights.loadAppInsights();
