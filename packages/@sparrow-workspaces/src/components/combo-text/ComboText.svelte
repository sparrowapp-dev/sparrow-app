<script lang="ts">
  import { KeyboardShortcuts } from "@sparrow/library/ui";

  export let type: "combo" | "single" = "single";
  export let key = "";
  export let value = "";

  enum TextType {
    COMBO = "combo",
    SINGLE = "single",
  }
</script>

<div class={"d-flex align-items-center justify-content-center gap-1 mb-2"}>
  {#if type === TextType.COMBO}
    <p
      class={`text-secondary-200 shortcut-text mb-0 sparrow-fs-12 w-auto`}
      style={"width: 100px;"}
    >
      {key}
    </p>
    <KeyboardShortcuts keys={value} />
  {:else}
    <KeyboardShortcuts keys={value} />
  {/if}
</div>
