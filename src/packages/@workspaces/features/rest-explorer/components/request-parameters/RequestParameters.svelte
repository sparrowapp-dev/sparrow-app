<script lang="ts">
  import { TabularInput } from "@workspaces/common/components";
  import { createDeepCopy } from "$lib/utils/helpers";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";
  export let params;
  export let onUpdateRequestParams;
  export let environmentVariables = [];
  export let authParameter;
  export let onUpdateEnvironment;

  let isBulkEditRequired = true;
  export let onUpdateRequestState;

  export let isBulkEditActive;

  let bulkEditParamsPlaceholder = `Usage: Use bulk edit to manage multiple parameters quickly.Separate each entry with a new line.
Format: Parameter-Key: Parameter-Value
Example: userID: Sparrow12 `;

  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestParams(pairs);
  };

  const toggleBulkEdit = (value) => {
    onUpdateRequestState({ isParameterBulkEditActive: value });
  };
</script>

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
  />
</section>
