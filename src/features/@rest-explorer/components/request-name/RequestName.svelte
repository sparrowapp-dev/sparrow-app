<script lang="ts">
  import Input from "$lib/components/inputs/Input.svelte";

  export let name;
  export let onUpdateRequestName;

  let _name = "";
  name.subscribe({
    next: (data: string) => {
      _name = data;
    },
    error: (error: string) => {
      console.error("Error fetching request method:", error);
    },
  });
</script>

<Input
  bind:value={_name}
  on:change={(e) => {
    onUpdateRequestName(e.detail);
  }}
  noBackground={true}
  inputStyleProp="font-size: 1.5rem; font-weight: 500;"
  class="flex-1"
/>
