<script lang="ts">
  import { TabularInput } from "@sparrow/workspaces/components";

  export let value;
  export let environmentVariables;
  export let onUpdateRequestBody;
  export let onUpdateEnvironment;

  const handleUrlEncodeChange = (pairs) => {
    onUpdateRequestBody(pairs);
  };
  export let handleOpenCurrentDynamicExpression;
</script>

<section class="w-100">
  <TabularInput
    keyValue={value}
    callback={handleUrlEncodeChange}
    {environmentVariables}
    {onUpdateEnvironment}
    isInputBoxEditable={true}
    isCheckBoxEditable={true}
    onToggleBulkEdit={() => {}}
    dynamicExpression={true}
    handleOpenCurrentDynamicExpression={(obj) => {
      handleOpenCurrentDynamicExpression({ ...obj, type: "urlencoded" });
    }}
  />
</section>
