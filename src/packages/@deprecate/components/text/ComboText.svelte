<script lang="ts">
  export let type: "combo" | "single" = "single";
  export let comboContainerClassProp = "";
  export let comboContainerStyleProp = "";
  export let singleTextClassProp = "";
  export let singleTextStyleProp = "";
  export let key = "";
  export let value = "";
  export let keyClassProp = "";
  export let keyStyleProp = "";
  export let valueClassProp = "";
  export let valueStyleProp = "";

  enum TextType {
    COMBO = "combo",
    SINGLE = "single",
  }
</script>

<div class={`${comboContainerClassProp}`} style={`${comboContainerStyleProp}`}>
  {#if type === TextType.COMBO}
    <p
      class={`${keyClassProp} shortcut-text mb-0 sparrow-fs-12`}
      style={`${keyStyleProp}`}
    >
      {key}
    </p>
    <button
      disabled
      class={`${valueClassProp} sparrow-fs-12  border-0 py-1 px-2 shortcut-btn-api`}
      style={`${valueStyleProp} ; font-family: "Roboto Mono"; font-weight: 600;`}
    >
      {value}
    </button>
  {:else}
    <div
      class={`${singleTextClassProp} api-type sparrow-fs-12 border border-1 fw-medium me-1`}
      style={`${singleTextStyleProp}`}
    >
      <span class={`${valueClassProp}`} style={`${valueStyleProp}`}
        >{value}</span
      >
    </div>
  {/if}
</div>

<style>
  /* .api-type {
    height: 34px;
    width: 56px;
    border-color: var(--border-color) !important;
  }
  .shortcut-btn-api {
    width: 120px;
  }
  .shortcut-text {
    min-width: 80px;
    width: auto;
  } */
</style>
