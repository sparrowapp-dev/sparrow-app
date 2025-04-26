<script lang="ts">
  import { onMount } from "svelte";
  import { TabularInput } from "@sparrow/workspaces/components";
  import { createDeepCopy } from "@sparrow/common/utils";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import { extractQueryParams } from "../../../../../../@sparrow-common/src/utils/testFlow.helper";

  export let requestUrl;
  export let params;
  export let environmentVariables;
  export let authParameter;
  let isBulkEditRequired = false;
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
      .filter((pair) => pair.key.trim() !== "" && pair.checked === true)
      .map(
        (pair) =>
          `${encodeURIComponent(pair.key)}=${encodeURIComponent(pair.value)}`,
      )
      .join("&");

    const baseUrl = requestUrl.split("?")[0];
    const updatedUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    onUpdateRequestState("url", updatedUrl);
  };

  const toggleBulkEdit = (value: boolean) => {
    MixpanelEvent(Events.Bulk_Edit_Parameters);
    onUpdateRequestState({ isParameterBulkEditActive: value });
  };

  const setInitialParams = () => {
    const urlParams = extractQueryParams(requestUrl);
    const mergedArray = params;

    // Add params only if key doesn't already exist
    for (const param of urlParams) {
      if (
        param.key.trim() !== "" &&
        !mergedArray.some(
          (ele: object) => ele?.key.trim() !== param?.key.trim(),
        )
      ) {
        mergedArray.push({
          key: param.key,
          value: param.value,
          checked: param.checked,
        });
      }
    }

    // If nothing found, add an empty param
    if (mergedArray.length === 0) {
      queryParams = [{ key: "", value: "", checked: true }];
    }

    handleParamsChange(mergedArray);
  };

  onMount(() => {
    if (requestUrl !== "") {
      setInitialParams();
    }
  });
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
    onUpdateEnvironment={() => {}}
    {environmentVariables}
    dynamicExpression={true}
  />
</section>
