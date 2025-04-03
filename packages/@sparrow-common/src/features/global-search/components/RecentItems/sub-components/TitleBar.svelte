<script lang="ts">
  export let data = {
    title: "",
    shortcutKeys: [],
  };
  import { KeyboardShortcuts } from "@sparrow/library/ui";
  import { keyCommand } from "../../../images";
</script>

<div class="d-flex align-items-center justify-content-between px-1 mb-1">
  <span
    class="text-ds-font-size-12"
    style="color: var(--text-ds-neutral-500); "
  >
    {data.title}
  </span>
  <div class="d-flex align-items-center gap-1">
    {#if data.shortcutKeys}
      <KeyboardShortcuts keys={data.shortcutKeys} />
    {/if}
  </div>
</div>
