<script lang="ts">
  import { TabularInput } from "@workspaces/common/components";

  export let value;
  export let environmentVariables;
  export let onUpdateRequestBody;
  export let onUpdateEnvironment;

  const handleUrlEncodeChange = (pairs) => {
    onUpdateRequestBody({ urlencoded: pairs });
  };
</script>

<section class="w-100" style="height: calc(100% - 65px); overflow-y: auto;">
  <TabularInput
    keyValue={value}
    callback={handleUrlEncodeChange}
    {environmentVariables}
    {onUpdateEnvironment}
  />
</section>
