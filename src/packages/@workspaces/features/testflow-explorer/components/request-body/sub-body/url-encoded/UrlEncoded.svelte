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

<section class="w-100">
  <TabularInput
    keyValue={value}
    callback={handleUrlEncodeChange}
    {environmentVariables}
    {onUpdateEnvironment}
    isInputBoxEditable={false}
    isCheckBoxEditable={false}
    onToggleBulkEdit={() => {}}
  />
</section>
