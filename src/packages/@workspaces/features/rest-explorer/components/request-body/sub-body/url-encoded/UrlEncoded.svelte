<script lang="ts">
  import { TabularInput } from "@workspaces/common/components";

  export let value;
  export let environmentVariables;
  export let onUpdateRequestBody;

  const handleUrlEncodeChange = (pairs) => {
    onUpdateRequestBody({ urlencoded: pairs });
  };
</script>

<section class="w-100" style="height: calc(100% - 100px); overflow-y: scroll;">
  <TabularInput
    keyValue={value}
    callback={handleUrlEncodeChange}
    {environmentVariables}
  />
</section>
