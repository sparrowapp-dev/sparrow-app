<script lang="ts">
  import KeyValue from "$lib/components/key-value/KeyValue.svelte";

  export let value;
  export let environmentVariables;
  export let onUpdateRequestBody;

  const handleUrlEncodeChange = (pairs) => {
    onUpdateRequestBody({ urlencoded: pairs });
  };
</script>

<KeyValue
  keyValue={value}
  callback={handleUrlEncodeChange}
  {environmentVariables}
/>
