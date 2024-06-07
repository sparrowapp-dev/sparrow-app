<script lang="ts">
  export let value = "";
  export let labelText = "";
  export let labelDescription = "";
  export let inputId = "";
  export let inputPlaceholder = "";
  export let isRequired = false;
  export let invalidValue = false;
  export let errorText = "Invalid Value";
  export let type: "input" | "textarea" = "input";
  export let noBackground = false;
  export let maxCharacter = 100;
  export let inputStyleProp = "";
  export let inputClassProp = "";
  export let labelDescriptionClassProp = "";
  export let labelDescriptionStyleProp = "";
  export let labelTextClassProp = "";
  export let labelTextStyleProp = "";
  let componentClass = "";
  export { componentClass as class };

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  enum InputType {
    INPUT = "input",
    TEXTAREA = "textarea",
  }
</script>

<div class={`sparrow-input-label-container ${componentClass}`}>
  {#if labelText.length > 0}
    <div class="sparrow-input-label-heading mb-1">
      <label
        class={`sparrow-input-label text-lightGray fw-light ${labelTextClassProp}`}
        style={`${labelTextStyleProp}`}
        for={inputId}>{labelText}</label
      >
      {#if isRequired}
        <span class="sparrow-input-required">*</span>
      {/if}
    </div>
  {/if}
  {#if labelDescription.length > 0}
    <span
      class={`sparrow-input-label-desc ${labelDescriptionClassProp}`}
      style={`${labelDescriptionStyleProp}`}>{labelDescription}</span
    >
  {/if}
</div>
{#if type === InputType.INPUT}
  <input
    bind:value
    class={`${
      invalidValue && "invalid"
    } sparrow-text-input w-100 ${inputClassProp}`}
    type="text"
    id={inputId}
    placeholder={inputPlaceholder}
    on:input={(e) => dispatch("change", value)}
    style={`${inputStyleProp} ${
      noBackground &&
      "outline: none; background-color: transparent; border: none;"
    }`}
    maxlength={maxCharacter}
  />
{:else}
  <textarea
    class={`${
      invalidValue && "invalid"
    } sparrow-text-input w-100 ${inputClassProp}`}
    {value}
    id={inputId}
    placeholder={inputPlaceholder}
    maxlength={maxCharacter}
    on:input={(e) => dispatch("change", value)}
    style={`${inputStyleProp}`}
  />
{/if}
{#if invalidValue}
  <span class="sparrow-input-error-text">{errorText}</span>
{/if}

<style lang="scss">
  .sparrow-input-label {
    font-size: var(--base-text);
  }
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .sparrow-text-input {
    background-color: var(--blackColor);
    outline: none;
    border-radius: 4px;
    font-size: var(--base-text);
  }
  .sparrow-text-input.invalid {
    border: 1px solid var(--dangerColor);
  }
  .sparrow-input-label-desc {
    color: var(--request-arc);
  }
  .sparrow-input-error-text {
    font-size: var(--small-text);
    color: var(--dangerColor);
  }
</style>
