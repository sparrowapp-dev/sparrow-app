<script lang="ts">
  import { Debounce } from "@sparrow/common/utils";
  import { Modal } from "@sparrow/library/ui";
  import { TickMarkRoundedIcon as TickMark } from "@sparrow/library/assets";
  import { Spinner } from "@sparrow/library/ui";
  let importCurl = "";

  export let workspaceId: string;
  export let onClosePopup: () => void;
  export let onItemImported: (entityType: string, args: any) => void;
  export let onValidateCurl;

  let isInputTouched = false;
  let isCurlValid = false;
  let isCurlDataLoading = false;
  let isLoading = false;
  let isMethodWrong = false;

  const handleInputField = async () => {
    isCurlDataLoading = true;
    isCurlValid = false;
    isMethodWrong = false;

    const response = await onValidateCurl(importCurl);
    if (response.isSuccessful) {
      if (response.method === "INVALID") {
        isMethodWrong = true;
      } else {
        isCurlValid = true;
      }
    }
    isCurlDataLoading = false;
  };

  const debouncedCurlValidate = new Debounce().debounce(handleInputField, 1000);
</script>

<div class="mt-3">
  <p class="sparrow-fs-14 mb-1 text-secondary-1000">Paste cURL here</p>
</div>
<div class="rounded border-0 position-relative">
  <textarea
    bind:value={importCurl}
    on:input={() => {
      isInputTouched = true;
      isCurlDataLoading = true;
      debouncedCurlValidate();
    }}
    on:blur={() => {
      isInputTouched = true;
    }}
    class="pe-4 ps-2 pb-2 pt-2 w-100 bg-tertiary-300 border-0 text-fs-12 rounded textarea-class {isInputTouched &&
    !isCurlDataLoading &&
    !isCurlValid
      ? 'border-error'
      : ''}"
    placeholder="Example- curl -X GET https://api.example.com/resource"
  />
  {#if isCurlDataLoading}
    <div class="position-absolute" style="right: 10px; top:10px;">
      <Spinner size={`16px`} />
    </div>
  {:else if isCurlValid}
    <div class="position-absolute" style="right: 10px; top:8px;">
      <TickMark />
    </div>
  {/if}
</div>
<div>
  {#if isInputTouched && !isCurlDataLoading && importCurl === ""}
    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      Please paste your cURL command here.
    </p>
  {:else if isInputTouched && !isCurlDataLoading && !isCurlValid}
    {#if isMethodWrong}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        The specified HTTP method is currently not supported.
      </p>
    {:else}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        The cURL command format appears to be incorrect, make sure it is in the
        correct format.
      </p>
    {/if}
  {/if}
</div>
<button
  class="mt-3 btn-primary d-flex mb-1 align-items-center justify-content-center border-0 w-100 py-2 fs-6 rounded"
  disabled={isLoading}
  on:click={async () => {
    isLoading = true;
    isInputTouched = true;
    if (isCurlValid) {
      const response = await onItemImported("curl", {
        workspaceId,
        importCurl,
      });
      if (response?.isSuccessful) {
        onClosePopup();
      }
    }
    isLoading = false;
  }}
>
  <span class="me-3">
    {#if isLoading}
      <Spinner size={"16px"} />
    {:else}
      Import
    {/if}
  </span>
</button>

<style lang="scss">
  .border-error {
    border: 1px solid var(--error--color) !important;
  }
  .textarea-class {
    height: 100px;
    outline: none;
  }
  .btn-primary {
    background-color: var(--bg-primary-300);
  }
  .btn-primary:hover {
    background-color: var(--bg-primary-250);
  }
  .btn-primary:active {
    background-color: var(--bg-primary-500);
  }
  .empty-data-error {
    color: var(--error--color);
  }
</style>
