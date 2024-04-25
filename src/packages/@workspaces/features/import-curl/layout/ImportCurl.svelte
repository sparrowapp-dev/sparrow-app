<script lang="ts">
  import { ModalWrapperV1 } from "$lib/components";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  let importCurl = "";
  let progressBar = {
    isLoading: false,
  };

  export let workspaceId: () => void;
  export let onClosePopup: () => void;
  export let onItemImported: (entityType: string, args: any) => void;
</script>

<ModalWrapperV1
  title={"Import via cURL"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={true}
  handleModalState={onClosePopup}
>
  <div class="sparrow-fs-14 text-muted mt-3">
    <p>Paste cURL here</p>
  </div>
  <div class="textarea-div rounded border-0">
    <textarea
      bind:value={importCurl}
      class="form-control border-0 rounded bg-blackColor textarea-class"
      placeholder="Copy and paste cURL of the API request"
    />
  </div>
  <button
    class="btn-primary d-flex align-items-center justify-content-center border-0 w-100 py-2 fs-6 rounded"
    on:click={() => {
      onItemImported("curl", { workspaceId, importCurl });
      onClosePopup();
    }}
  >
    <span class="me-3">
      {#if progressBar.isLoading}
        <Spinner size={"16px"} />
      {/if}</span
    >
    Import API Request</button
  >
</ModalWrapperV1>

<style lang="scss">
  .textarea-div {
    height: 120px;
    border: 2px solid red;
  }
  .textarea-class {
    height: 80%;
  }
  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }
</style>
