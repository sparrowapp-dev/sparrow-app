<script lang="ts">
  import { ToastContainer } from "svelte-toasts";
  import { SuccessIcon, ErrorIcon, WarningIcon, CloseIcon } from "./icons";

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return SuccessIcon;
      case "warning":
        return WarningIcon;
      default:
        return ErrorIcon;
    }
  };
</script>

<div class= "custom-toast-container">
  <ToastContainer width={"fit-content"} let:data>
    <div
      class="d-flex position-relative custom-toast custom-toast-{data.type} toast"
      style="height: {data.title === undefined ? '68px' : '84px'};"
    >
      <div class="w-100 content-wrapper d-flex column gap-4">
        <div class="d-flex">
          <span class="icon">
            <span class="icon-backdrop icon-backdrop-{data.type}" />
            <div
              class="bg-circle d-flex justify-content-center align-items-center"
            >
              <div class="bg-circle-{data.type}">
                <svelte:component this={getIcon(data.type)} />
              </div>
            </div>
          </span>
        </div>
        <div class="d-flex row gap-1">
          {#if data.title !== undefined}
            <p class="data-title text-fs-14">{data.title}</p>
          {/if}
          <span class="description">{data.description}</span>
        </div>
      </div>
      <div
        class="close-icon-large d-flex align-items-center justify-content-center"
      >
        <span
          data-notification-btn
          role="button"
          on:click={() => data.remove()}
        >
          <CloseIcon />
        </span>
      </div>
      {#if data.duration > 0}
        <div
          class="progress-bar progress-bar-{data.type}"
          style="animation-duration: {data.duration}ms;"
        ></div>
      {/if}
    </div>
  </ToastContainer>
</div>

<style>
  .custom-toast {
    background-color: var(--bg-ds-surface-500);
    box-shadow: 0px 16px 32px 0px #0000004d;
    overflow: hidden;
  }
  .content-wrapper {
    display: flex;
    align-items: center;
    padding: 12px;
  }
  .icon {
    position: relative;
  }
  .icon-backdrop {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 215px;
    height: 215px;
    border-radius: 50%;
    z-index: 1;
  }
  .icon-backdrop-success {
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(51, 204, 122, 0.12) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
  .icon-backdrop-error {
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(235, 86, 81, 0.13) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
  .icon-backdrop-warning {
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(236, 197, 81, 0.13) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
  .bg-circle {
    background-color: var(--bg-ds-surface-100);
    border-radius: 50%;
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bg-circle-success,
  .bg-circle-warning,
  .bg-circle-error {
    position: relative;
    padding: 2px;
    justify-content: center;
    align-items: center;
    display: flex;
    width: 24px;
    height: 24px;
  }
  .bg-circle-warning {
    top: -1px;
  }
  .description {
    font-size: 12px;
    font-weight: 500;
    font-family: "Inter", sans-serif;
    line-height: 18px;
    text-align: left;
    color: var(--text-ds-neutral-100);
    width: 236px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }
  .toast-container {
    z-index: 1000000 !important;
    pointer-events: unset !important;
    padding: 0 !important;
  }
  .close-icon-large {
    position: relative;
    top: -14px;
    right: 10px;
    width: 24px;
  }
  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0;
    }
  }
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 100%;
    border-radius: 0 0 0 8px;
    transform-origin: left;
    animation: progress linear forwards;
    backdrop-filter: blur(4px);
  }
  .progress-bar-success {
    background-color: #33cc7a;
  }
  .progress-bar-error {
    background-color: #eb5651;
  }
  .progress-bar-warning {
    background-color: #ecc551;
  }
  .data-title {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    line-height: 20.02px;
    text-align: left;
    padding: 0 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }
  .custom-toast-container {
    position: fixed;
    z-index: 1000000 !important;
  }
</style>
