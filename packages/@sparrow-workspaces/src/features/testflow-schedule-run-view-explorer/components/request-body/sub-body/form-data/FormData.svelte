<script lang="ts">
  import { TabularInputFormData } from "@sparrow/workspaces/components";

  export let keyValue;
  export let onUpdateRequestBody;
  export let environmentVariables;
  export let onUpdateEnvironment;

  const handleFormDataChange = (pairs: any) => {
    onUpdateRequestBody(pairs);
  };
  export let handleOpenCurrentDynamicExpression;
</script>

<section class="w-100">
  <TabularInputFormData
    {keyValue}
    callback={handleFormDataChange}
    {environmentVariables}
    {onUpdateEnvironment}
    isCheckBoxEditable={true}
    isInputBoxEditable={true}
    isTopHeaderRequired={true}
    dynamicExpression={true}
    handleOpenCurrentDynamicExpression={(obj) => {
      handleOpenCurrentDynamicExpression({ ...obj, type: "formdata" });
    }}
  />
</section>
