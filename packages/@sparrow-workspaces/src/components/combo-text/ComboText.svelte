<script lang="ts">
  import { KeyboardShortcuts } from "@sparrow/library/ui";

  export let type: "combo" | "single" = "single";
  export let comboContainerClassProp = "";
  export let comboContainerStyleProp = "";
  export let key = "";
  export let value = "";
  export let keyClassProp = "";
  export let keyStyleProp = "";

   enum TextType {
    COMBO = "combo",
    SINGLE = "single",
  }
</script>

<div class={comboContainerClassProp} style={comboContainerStyleProp}>
   {#if type === TextType.COMBO}
    <p class={`${keyClassProp} shortcut-text mb-0 sparrow-fs-12`} style={keyStyleProp}>
      {key}
    </p>
    <KeyboardShortcuts keys={value}  />
  {:else}
    <KeyboardShortcuts keys={value} />
  {/if}
</div>
