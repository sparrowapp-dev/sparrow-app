<script lang="ts">
  import Input from "$lib/components/inputs/Input.svelte";

  export let name;
  export let onUpdateRequestName;
</script>

<Input
  bind:value={name}
  on:change={(e) => {
    onUpdateRequestName(e.detail);
  }}
  noBackground={true}
  inputStyleProp="font-size: 1.5rem; font-weight: 500;"
  class="flex-1"
/>
