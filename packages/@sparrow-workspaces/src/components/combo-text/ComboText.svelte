<script lang="ts">
  import { KeyboardShortcuts } from "@sparrow/library/ui";
  import { fly } from "svelte/transition";

  export let type: "combo" | "single" = "single";
  export let key = "";
  export let value = "";
  export let isExpandShortcuts: boolean = false;

  enum TextType {
    COMBO = "combo",
    SINGLE = "single",
  }

  const slowCurve = (t: number) => {
    return 1 - Math.pow(1 - t, 3);
  };
</script>

<div
  class="d-flex align-items-center justify-content-center gap-1 mb-2"
  transition:fly={{
    x: isExpandShortcuts ? 20 : -20,
    duration: isExpandShortcuts ? 480 : 360,
    easing: slowCurve,
  }}
>
  {#if type === TextType.COMBO}
    <p
      class="text-secondary-200 shortcut-text mb-0 sparrow-fs-12 w-auto"
      style="width: 100px;"
    >
      {key}
    </p>
    <KeyboardShortcuts keys={value} />
  {:else}
    <KeyboardShortcuts keys={value} />
  {/if}
</div>
