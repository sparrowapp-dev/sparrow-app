<script lang="ts">
  import { TabularInput } from "@sparrow/workspaces/components";

  export let value;
  export let environmentVariables;
  export let onUpdateRequestBody;
  export let onUpdateEnvironment;

  const handleUrlEncodeChange = (pairs) => {
    onUpdateRequestBody({ urlencoded: pairs });
  };
</script>

<section class="w-100">
  <TabularInput
    keyValue={value}
    callback={handleUrlEncodeChange}
    {environmentVariables}
    {onUpdateEnvironment}
  />
</section>
