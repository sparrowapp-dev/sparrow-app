<script lang="ts">
  import { TabularInput } from "@workspaces/common/components";
  import { createDeepCopy } from "$lib/utils/helpers";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";

  export let params;
  export let onUpdateRequestParams;
  export let environmentVariables = [];
  export let authParameter;
  export let onUpdateEnvironment;

  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestParams(pairs);
  };
</script>

<section class="w-100" style="height: calc(100% - 50px); overflow-y: scroll;">
  <TabularInput
    readable={authParameter}
    keyValue={createDeepCopy(params)}
    callback={handleParamsChange}
    {environmentVariables}
    {onUpdateEnvironment}
  />
</section>
