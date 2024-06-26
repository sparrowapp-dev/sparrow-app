<script lang="ts">
  import { TabularInput } from "@workspaces/common/components";
  import { createDeepCopy } from "$lib/utils/helpers";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";
  export let params;
  export let onUpdateRequestParams;
  export let environmentVariables = [];
  export let authParameter;
  export let onUpdateEnvironment;

  export let onUpdateRequestState;

  export let isBulkEditActive ;

  let bulkEditParamsPlaceholder=`Usage: Use bulk edit to manage multiple parameters quickly.Separate each entry with a new line.
Format: Parameter-Key: Parameter-Value
Example: userID: Sparrow12 `

  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestParams(pairs);
  };

  function toggleBulkEdit(value) {
    onUpdateRequestState({ isBulkParameter: value });
  }
</script>

<section
  class="outer-section w-100"
  style="height: calc(100% - 50px); overflow-y: scroll;"
>
  <TabularInput
  bulkEditPlaceholder={bulkEditParamsPlaceholder}
    {isBulkEditActive }
    onToggleBulkEdit={toggleBulkEdit}
    readable={authParameter}
    keyValue={createDeepCopy(params)}
    callback={handleParamsChange}
    {environmentVariables}
    {onUpdateEnvironment}
  />
</section>
