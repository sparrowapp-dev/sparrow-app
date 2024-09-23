<script lang="ts">
  import { TabularInputFormData } from "@workspaces/common/components";

  export let keyValue;
  export let onUpdateRequestBody;
  export let environmentVariables;
  export let onUpdateEnvironment;

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
    isCheckBoxEditable={false}
    isInputBoxEditable={false}
    isTopHeaderRequired={true}
  />
</section>
