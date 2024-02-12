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
    <p class={`${keyClassProp}`} style={`${keyStyleProp}`}>{key}</p>
    <button disabled class={`${valueClassProp}`} style={`${valueStyleProp}`}>
      {value}
    </button>
  {:else}
    <div
      class={`${singleTextClassProp} api-type sparrow-fs-12`}
      style={`${singleTextStyleProp}`}
    >
      <span class={`${valueClassProp}`} style={`${valueStyleProp}`}
        >{value}</span
      >
    </div>
  {/if}
</div>

<style>
  .api-type {
    height: 34px;
    width: 56px;
    border: 1px solid #313233;
    margin-right: 5px;
  }
  .api-type span {
    font-weight: 500;
  }
</style>
