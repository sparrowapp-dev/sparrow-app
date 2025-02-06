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
    class="d-flex position-relative custom-toast custom-toast-{data.type} toast"
    style=""
  >
    <div class="w-100 content-wrapper">
      <span class="p-1 icon">
        <span class="icon-backdrop icon-backdrop-{data.type}" />
        {#if data.type === "success"}
          <SuccessIcon />
        {:else if data.type === "warning"}
          <WarningIcon />
        {:else if data.type === "error"}
          <ErrorIcon />
        {:else}
          <InfoIcon />
        {/if}
      </span>
      <span class="description mb-0">{data.description}</span>
    </div>
    <!-- Close Icon -------------------------------------------------------------------------------------->
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
    <!-- Progress Bar -------------------------------------------------------------------------------------->
    {#if data.duration > 0}
      <div
        class="progress-bar progress-bar-{data.type}"
        style="animation-duration: {data.duration}ms;"
      ></div>
    {/if}
  </div>
</ToastContainer>

<style>
  .toast {
    border-radius: 8px;
    width: 345px;
  }
  .icon {
    margin-right: 18px;
    position: relative;
  }

  .icon-backdrop {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 192px;
    height: 192px;
    border-radius: 50%;
    z-index: 1;
  }

  .icon-backdrop-success {
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(0, 237, 81, 0.12) 0%,
      rgba(0, 237, 123, 0) 100%
    );
  }

  .icon-backdrop-error {
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(240, 66, 72, 0.13) 0%,
      rgba(240, 66, 72, 0) 100%
    );
  }

  :global(.toast-container) {
    z-index: 1000000 !important;
    pointer-events: unset !important;
    padding: 0 !important;
  }

  .custom-toast {
    background-color: #272e34;
    padding: 8px;
    position: relative;
    min-height: 56px;
    overflow: hidden;
  }

  .content-wrapper {
    display: flex;
    align-items: center;
    padding: 12px;
  }

  .description {
    font-size: 13px;
    width: 225px;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* Limit to 3 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Progress bar style */
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    border-radius: 0 0 0 8px;
    transform-origin: left;
    animation: progress linear forwards;
    backdrop-filter: blur(4px);
  }

  /* Progress bar colors based on type */
  .progress-bar-success {
    background-color: #01e17b;
    box-shadow: 1px 1px 10px 4px rgba(0, 237, 123, 0.5);
  }

  .progress-bar-error {
    background-color: #f04349;
    box-shadow: 1px 1px 10px 4px rgba(240, 66, 72, 0.5);
  }

  .progress-bar-info {
    background-color: #262114;
  }

  .custom-toast-alert {
    background-color: #262114;
  }

  /* Progress bar animation */
  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0;
    }
  }
</style>
