<script lang="ts">
  import { TabularInput } from "@workspaces/common/components";
  import { createDeepCopy } from "$lib/utils/helpers";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums";
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
