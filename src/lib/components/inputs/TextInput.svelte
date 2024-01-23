<script lang="ts">
  export let value: string = "";
  export let labelText: string;
  export let labelDescription: string = "";
  export let inputId: string;
  export let inputPlaceholder: string;
  export let isRequired: boolean = false;
  export let invalidValue: boolean = false;
  export let errorText: string = "Invalid Value";
  export let onChange: (e: any) => void;
</script>

<div class="sparrow-text-input-container mt-3">
  <div class="sparrow-input-label-container mb-1">
    <div class="sparrow-input-label-heading">
      <label class="sparrow-input-label text-lightGray fw-light" for={inputId}
        >{labelText}</label
      >
      {#if isRequired}
        <span class="sparrow-input-required">*</span>
      {/if}
    </div>
    <span class="sparrow-input-label-desc">{labelDescription}</span>
  </div>
  <input
    bind:value
    class={`${invalidValue && "invalid"} sparrow-text-input py-2 px-3 w-100 `}
    type="text"
    id={inputId}
    placeholder={inputPlaceholder}
    on:input={(e) => onChange(e)}
  />
  {#if invalidValue}
    <span class="sparrow-input-error-text">{errorText}</span>
  {/if}
</div>

<style lang="scss">
  .sparrow-input-label {
    font-size: 14px;
  }
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .sparrow-text-input {
    background-color: var(--blackColor);
    outline: none;
    border-radius: 4px;
    font-size: 14px;
    border: 1px solid var(--border-color);
  }
  .sparrow-text-input.invalid {
    border: 1px solid var(--dangerColor);
  }
  .sparrow-input-label-desc {
    color: var(--request-arc);
  }
  .sparrow-input-error-text {
    font-size: 12px;
    color: var(--dangerColor);
  }
</style>
