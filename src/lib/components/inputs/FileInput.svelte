<script lang="ts">
  import { UploadIcon } from "$lib/assets/app.asset";

  export let value: string = "",
    labelText: string,
    labelDescription: string = "",
    inputId: string,
    inputPlaceholder: string,
    isRequired: boolean = false,
    onChange: (e: any) => void;
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
  <div class="sparrow-file-input w-100 px-auto">
    <span
      class="sparrow-file-input-placeholder fw-normal d-flex justify-content-center mt-4"
      >Drag and Drop or</span
    >
    <div
      class="sparrow-choose-file-input-button d-flex justify-content-center my-4"
    >
      <UploadIcon classProp="my-auto" />
      <input
        class="sparrow-choose-file-input"
        type="file"
        {value}
        id={inputId}
        placeholder={inputPlaceholder}
        on:change={(e) => onChange(e)}
      />
    </div>
  </div>
</div>

<style lang="scss">
  .sparrow-input-label {
    font-size: 14px;
  }
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .sparrow-file-input {
    outline: none;
    border: 1px dashed var(--request-arc);
    border-radius: 4px;
    font-size: 14px;
  }
  .sparrow-input-label-desc {
    color: var(--request-arc);
  }
  .sparrow-file-input-placeholder {
    color: var(--request-arc);
    font-size: 14px;
  }
  .sparrow-choose-file-input::file-selector-button {
    background-color: transparent;
    color: var(--send-button);
    border: 0;
    font-size: 12px;
  }
</style>
