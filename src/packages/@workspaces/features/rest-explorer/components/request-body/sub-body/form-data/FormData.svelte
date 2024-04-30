<script lang="ts">
  import { TabularInput } from "@library/forms";

  export let textValue;
  export let fileValue;
  export let onUpdateRequestBody;
  export let environmentVariables;
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
</script>

<section class="w-100" style="height: calc(100% - 100px); overflow-y: scroll;">
  <p>Text</p>
  <TabularInput
    keyValue={textValue}
    callback={handleFormDataTextChange}
    {environmentVariables}
  />
  <p>File</p>
  <TabularInput
    keyValue={fileValue}
    callback={handleFormDataFileChange}
    {environmentVariables}
    type="file"
  />
</section>
