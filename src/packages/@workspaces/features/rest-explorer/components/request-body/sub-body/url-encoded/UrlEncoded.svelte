<script lang="ts">
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";

  export let value;
  export let environmentVariables;
  export let onUpdateRequestBody;

  const handleUrlEncodeChange = (pairs) => {
    onUpdateRequestBody({ urlencoded: pairs });
  };
</script>

<section class="w-100" style="height: calc(100% - 100px); overflow-y: scroll;">
  <KeyValue
    keyValue={value}
    callback={handleUrlEncodeChange}
    {environmentVariables}
  />
</section>
