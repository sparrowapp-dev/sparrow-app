<script lang="ts">
  import { TabularInput } from "@sparrow/workspaces/components";
  import { createDeepCopy } from "@sparrow/common/utils";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import { Loader } from "@sparrow/library/ui";
  export let params;
  export let onUpdateRequestParams;
  export let environmentVariables = [];
  export let authParameter;
  export let onUpdateEnvironment;

  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: KeyValuePair[];

  let isBulkEditRequired = true;
  export let onUpdateRequestState;

  export let isBulkEditActive;

  //   let bulkEditParamsPlaceholder = `Usage: Use bulk edit to manage multiple parameters quickly.Separate each entry with a new line.
  // Format: Parameter-Key: Parameter-Value
  // Example: userID: Sparrow12 `;

  let bulkEditParamsPlaceholder =
    "Usage - Manage multiple parameters.  Format - Key: Value";

  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestParams(pairs);
  };

  const toggleBulkEdit = (value) => {
    MixpanelEvent(Events.Bulk_Edit_Parameters);
    onUpdateRequestState({ isParameterBulkEditActive: value });
  };
</script>

{#if isMergeViewLoading}
  <div
    class=""
    style="top: 0px; left: 0; right: 0; bottom: 0; z-index:3; position:absolute;"
  >
    <Loader loaderSize={"20px"} />
  </div>
{/if}
<section class="w-100" style="">
  <TabularInput
    {isBulkEditRequired}
    bulkEditPlaceholder={bulkEditParamsPlaceholder}
    {isBulkEditActive}
    onToggleBulkEdit={toggleBulkEdit}
    readable={authParameter}
    keyValue={createDeepCopy(params)}
    callback={handleParamsChange}
    {environmentVariables}
    {onUpdateEnvironment}
    bind:showMergeView={isMergeViewEnabled}
    bind:isMergeViewLoading
    bind:newModifiedPairs={newModifiedContent}
  />
</section>
