import { captureEvent } from "@app/utils/posthog/posthogConfig";

export const handleEventonClickApplyChangesAI = (
  component: string,
  requestType: string,
) => {
  captureEvent("copilot_changes_kept", {
    component: component,
    requestType: requestType,
  });
};

export const handleEventOnClickApplyUndoAI = (
  component: string,
  requestType: string,
) => {
  captureEvent("copilot_changes_undone", {
    component: component,
    requestType: requestType,
  });
};

export const handleEventOnClickDynamicExpressionButton = (
  component: string,
  trigger_mode: string,
  field_type: string,
) => {
  captureEvent("dynamic_expression_popup_opened", {
    component: component,
    trigger_mode: trigger_mode,
    field_type: field_type,
  });
};

export const handleEventOnOpenDE = (component: string, requestType: string) => {
  captureEvent("chip_clicked_to_edit", {
    component: component,
    requestType: requestType,
  });
};
