<script lang="ts">
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";
  import { createDeepCopy } from "$lib/utils/helpers";
  import type { KeyValuePair } from "$lib/utils/interfaces/request.interface";

  export let params;
  export let onUpdateRequestParams;
  export let environmentVariables = [];
  export let authParameter;

  const handleParamsChange = (pairs: KeyValuePair[]): void => {
    onUpdateRequestParams(pairs);
  };
</script>

<section class="w-100" style="height: calc(100% - 50px); overflow-y: scroll;">
  <KeyValue
    readable={authParameter}
    keyValue={createDeepCopy(params)}
    callback={handleParamsChange}
    {environmentVariables}
  />
</section>
