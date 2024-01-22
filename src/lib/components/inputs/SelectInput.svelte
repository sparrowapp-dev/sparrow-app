<script lang="ts">
  export let labelText: string = "Select";
  export let isRequired: boolean = false;
  export let inputId: string = "";
  export let labelDescription: string = "";
  export let selectInputPlaceholder: string = "Select an option";
  export let options: any[];
  export let invalidValue: boolean = false;
  export let errorText: string = "Invalid Value.";
  export let handleOnSelect: (e: any) => void;
</script>

<div class="sparrow-select-input-container mt-3">
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
  <select
    on:change={(e) => handleOnSelect(e)}
    class={`${invalidValue && "invalid"} sparrow-select-input py-2 px-3 w-100`}
  >
    {#if selectInputPlaceholder !== ""}
      <option class="sparrow-placeholder-option" disabled selected
        >{selectInputPlaceholder}</option
      >
    {/if}
    {#each options as option}
      <option value={option.id}>{option.name}</option>
    {/each}
  </select>
  {#if invalidValue}
    <span class="sparrow-input-error-text">{errorText}</span>
  {/if}
</div>

<style lang="scss">
  .sparrow-input-label {
    font-size: 14px;
  }
  .sparrow-select-input {
    background-color: var(--blackColor);
    outline: none;
    border-radius: 4px;
    font-size: 14px;
    border: 1px solid var(--border-color);
  }
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .sparrow-placeholder-option {
    color: var(--request-arc) !important;
  }
</style>
