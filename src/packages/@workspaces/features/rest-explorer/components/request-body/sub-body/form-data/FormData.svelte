<script lang="ts">
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";

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
  <KeyValue
    keyValue={textValue}
    callback={handleFormDataTextChange}
    {environmentVariables}
  />
  <p>File</p>
  <KeyValue
    keyValue={fileValue}
    callback={handleFormDataFileChange}
    {environmentVariables}
    type="file"
  />
</section>
