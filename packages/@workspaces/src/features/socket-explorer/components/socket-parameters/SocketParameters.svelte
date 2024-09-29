<script lang="ts">
  import { TabularInput } from "@sparrow/workspaces/components";
  import { createDeepCopy } from "@sparrow/common/utils";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  export let params;
  export let onUpdateRequestParams;
  export let environmentVariables = [];
  export let onUpdateEnvironment;

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

<section class="w-100" style="">
  <TabularInput
    {isBulkEditRequired}
    bulkEditPlaceholder={bulkEditParamsPlaceholder}
    {isBulkEditActive}
    onToggleBulkEdit={toggleBulkEdit}
    keyValue={createDeepCopy(params)}
    callback={handleParamsChange}
    {environmentVariables}
    {onUpdateEnvironment}
  />
</section>
