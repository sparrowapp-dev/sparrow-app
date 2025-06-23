<script lang="ts">
  import { onMount } from "svelte";
  import { TabularInput } from "@sparrow/workspaces/components";
  import { createDeepCopy } from "@sparrow/common/utils";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";

  export let handleOpenCurrentDynamicExpression;
  export let onUpdateEnvironment;

  export let requestUrl;
  export let params;
  export let environmentVariables;
  export let authParameter;
  let isBulkEditRequired = true;
  export let onUpdateRequestState;
  export let isBulkEditActive;
  let bulkEditParamsPlaceholder =
    "Usage - Manage multiple parameters.  Format - Key: Value";
  let queryParams = params;
  // let bulkEditParamsPlaceholder = `Usage: Use bulk edit to manage multiple parameters quickly.Separate each entry with a new line.
  // Format: Parameter-Key: Parameter-Value
  // Example: userID: Sparrow12 `;

  /**
   * Handles changes to query parameters.
   * - Updates `queryParams` in state.
   * - Builds query string from checked pairs.
   * - Updates the `requestUrl` accordingly.
   *
   * @param {KeyValuePair[]} pairs - Array of key-value pairs with isChecked flag.
   */
  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestState("queryParams", pairs);

    const queryString = pairs
      .filter((pair) => pair.checked === true)
      .map((pair) => `${pair.key}=${pair.value}`)
      .join("&");

    const baseUrl = requestUrl.split("?")[0];
    const updatedUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    onUpdateRequestState("url", updatedUrl);
  };

  const toggleBulkEdit = (value: boolean) => {
    MixpanelEvent(Events.Bulk_Edit_Parameters);
    onUpdateRequestState("isParameterBulkEditActive", value);
  };
</script>

<section class="w-100" style="">
  <TabularInput
    isInputBoxEditable={true}
    isCheckBoxEditable={true}
    isTopHeaderRequired={true}
    {isBulkEditRequired}
    bulkEditPlaceholder={bulkEditParamsPlaceholder}
    {isBulkEditActive}
    onToggleBulkEdit={toggleBulkEdit}
    readable={authParameter}
    keyValue={createDeepCopy(params)}
    callback={handleParamsChange}
    {onUpdateEnvironment}
    {environmentVariables}
    dynamicExpression={true}
    handleOpenCurrentDynamicExpression={(obj) => {
      handleOpenCurrentDynamicExpression({ ...obj, type: "parameters" });
    }}
  />
</section>
