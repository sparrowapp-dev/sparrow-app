<script lang="ts">
  import type { UpdateRequestNameType } from "@workspaces/common/type";

  export let name: string;
  export let onUpdateRequestName: UpdateRequestNameType;
</script>

<!-- <Input
  bind:value={name}
  on:change={(e) => {
    onUpdateRequestName(e.detail);
  }}
  noBackground={true}
  inputStyleProp="font-size: 1.5rem; font-weight: 500;"
  class="flex-1"
/> -->
