<script lang="ts">
  import { TabularInputFormData } from "@sparrow/workspaces/components";

  export let keyValue;
  export let onUpdateRequestBody;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isWebApp = false;

  const handleFormDataChange = (pairs) => {
    onUpdateRequestBody({
      formdata: pairs,
    });
  };
</script>

<section class="w-100">
  <TabularInputFormData
    {keyValue}
    callback={handleFormDataChange}
    {environmentVariables}
    {onUpdateEnvironment}
    {isWebApp}
    isCheckBoxEditable={false}
    isInputBoxEditable={false}
  />
</section>
