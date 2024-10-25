<script>
  import { ToastContainer } from "svelte-toasts";
  import {
    SuccessIcon,
    ErrorIcon,
    InfoIcon,
    WarningIcon,
    CloseIcon,
  } from "./icons";
</script>

<ToastContainer width={"fit-content"} let:data>
  <div
    class=" d-flex border-radius-4 position-relati custom-toast custom-toast-{data.type}"
    style="max-width: 60vw; min-width: 30vw;"
  >
    <div class="w-100" style="">
      <span class="p-1">
        {#if data.type === "success"}
          <SuccessIcon />
        {:else if data.type === "warning"}
          <WarningIcon />
        {:else if data.type === "error"}
          <ErrorIcon
            height={"16px"}
            width={"16px"}
            color={"var(--dangerColor)"}
          />
        {:else}
          <InfoIcon />
        {/if}
      </span>
      <span class="description text-fs-12 mb-0">{data.description}</span>
    </div>
    <div style="width:24px;">
      <span
        data-notification-btn
        class="p-1"
        role="button"
        on:click={() => {
          data.remove();
        }}
      >
        <CloseIcon /></span
      >
    </div>
  </div>
</ToastContainer>

<style>
  :global(.toast-container) {
    z-index: 1000000 !important; /* Increase the z-index as needed */
    pointer-events: unset !important;
    padding: 0 !important;
  }

  .custom-toast {
    padding: 8px;
  }
  .custom-toast-success {
    background-color: #252826;
  }
  .custom-toast-error {
    background-color: #2b1c1d;
  }
  .custom-toast-info {
    background-color: #262114;
  }
  .custom-toast-alert {
    background-color: #262114;
  }
</style>
