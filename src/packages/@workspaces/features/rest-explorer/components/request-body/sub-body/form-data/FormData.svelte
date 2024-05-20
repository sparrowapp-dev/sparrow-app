<script lang="ts">
  import { TabularInputFormData } from "@workspaces/common/components";

  export let keyValue;
  export let onUpdateRequestBody;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let formData;

  const handleFormDataTextChange = (pairs) => {
    onUpdateRequestBody({
      formdata: {
        file: formData.file,
        text: pairs,
      },
    });
  };

  const handleFormDataFileChange = (pairs) => {
    onUpdateRequestBody({
      formdata: {
        file: pairs,
        text: formData.text,
      },
    });
  };

  const handleFormDataChange = (pairs) => {
    onUpdateRequestBody({
      formdata: pairs,
    });
  };
</script>

<section class="w-100" style="height: calc(100% - 65px); overflow-y: scroll;">
  <TabularInputFormData
    {keyValue}
    callback={handleFormDataChange}
    {environmentVariables}
    {onUpdateEnvironment}
  />
</section>
