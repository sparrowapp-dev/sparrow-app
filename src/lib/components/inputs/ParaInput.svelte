<script lang="ts">
  export let value: string = "";
  export let maxCharacter: number = 100;
  export let labelText: string;
  export let labelDescription: string = "";
  export let inputId: string;
  export let inputPlaceholder: string;
  export let isRequired: boolean = false;
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
  <textarea
    class="sparrow-para-input py-2 px-3 w-100 border-0"
    {value}
    id={inputId}
    placeholder={inputPlaceholder}
    maxlength={maxCharacter}
    on:input={(e) => onChange(e)}
  />
</div>

<style lang="scss">
  .sparrow-input-label {
    font-size: 14px;
  }

  .sparrow-input-required {
    color: var(--dangerColor);
  }

  .sparrow-para-input {
    background-color: var(--blackColor);
    outline: none;
    border-radius: 4px;
    font-size: 14px;
  }

  .sparrow-input-label-desc {
    color: var(--request-arc);
    font-size: 12px;
  }
</style>
