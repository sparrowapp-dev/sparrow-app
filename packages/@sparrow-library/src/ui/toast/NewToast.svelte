<script>
  import { ToastContainer } from "svelte-toasts";
  import {
    NewSuccessIcon,
    NewErrorIcon,
    NewWarningIcon,
    NewCloseIcon,
  } from "./icons";
</script>

<ToastContainer width={"fit-content"} let:data>
  {#if data.title !== undefined}
    <div
      class="d-flex position-relative custom-toast custom-toast-{data.type} toast"
    >
      <div class="w-100 content-wrapper d-flex column gap-4">
        <div class="d-flex">
          <span class="icon">
            <span class="icon-backdrop icon-backdrop-{data.type}" />
            {#if data.type === "success"}
              <div
                class="bg-circle d-flex justify-content-center align-items-center"
              >
                <div class="bg-cirle-success">
                  <NewSuccessIcon />
                </div>
              </div>
            {:else if data.type === "warning"}
              <div
                class="bg-circle d-flex justify-content-center align-items-center"
              >
                <div class="bg-cirle-warning">
                  <NewWarningIcon />
                </div>
              </div>
            {:else}
              <div
                class="bg-circle d-flex justify-content-center align-items-center"
              >
                <div class="bg-circle-error">
                  <NewErrorIcon />
                </div>
              </div>
            {/if}
          </span>
        </div>
        <div class="d-flex row gap-1">
          <p class="data-title text-fs-14">{data.title}</p>
          <span class="description">{data.description}</span>
        </div>
      </div>
      <div class="close-icon-large">
        <span
          data-notification-btn
          role="button"
          on:click={() => data.remove()}
        >
          <NewCloseIcon />
        </span>
      </div>
      {#if data.duration > 0}
        <div
          class="progress-bar progress-bar-{data.type}"
          style="animation-duration: {data.duration}ms;"
        ></div>
      {/if}
    </div>
  {:else}
    <div
      class="d-flex position-relative custom-toast custom-toast-{data.type} toast"
    >
      <div class="w-100 content-wrapper d-flex column gap-2">
        <div class="d-flex">
          <span class="icon">
            <span class="icon-backdrop icon-backdrop-{data.type}" />
            {#if data.type === "success"}
              <div
                class="bg-circle d-flex justify-content-center align-items-center"
              >
                <div class="bg-cirle-success">
                  <NewSuccessIcon />
                </div>
              </div>
            {:else if data.type === "warning"}
              <div
                class="bg-circle d-flex justify-content-center align-items-center"
              >
                <div class="bg-cirle-warning">
                  <NewWarningIcon />
                </div>
              </div>
            {:else}
              <div
                class="bg-circle d-flex justify-content-center align-items-center"
              >
                <div class="bg-circle-error">
                  <NewErrorIcon />
                </div>
              </div>
            {/if}
          </span>
        </div>
        <div class="d-flex">
          <span class="description">{data.description}</span>
        </div>
      </div>
      <div class="close-icon">
        <span
          data-notification-btn
          role="button"
          on:click={() => data.remove()}
        >
          <NewCloseIcon />
        </span>
      </div>
      {#if data.duration > 0}
        <div
          class="progress-bar progress-bar-{data.type}"
          style="animation-duration: {data.duration}ms;"
        ></div>
      {/if}
    </div>
  {/if}
</ToastContainer>

<style>
  .custom-toast {
    height: 68px;
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
  .bg-cirle-success {
    position: relative;
    padding: 2px;
    width: 24;
    height: 24;
  }
  .bg-cirle-warning {
    position: relative;
    left: 0.5px;
    padding: 2px;
    width: 24;
    height: 24;
    top: -2px;
  }
  .bg-circle-error {
    position: relative;
    padding: 2px;
    width: 24;
    height: 24;
    top: -1px;
    left: 0.5px;
  }
  .bg-circle {
    background-color: var(--bg-ds-surface-100);
    border-radius: 50%;
    position: relative;
    height: 32px;
    width: 32px;
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
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :global(.toast-container) {
    z-index: 1000000 !important;
    pointer-events: unset !important;
    padding: 0 !important;
  }

  .close-icon {
    position: relative;
    top: -4px;
    right: 10px;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-icon-large {
    position: relative;
    top: -14px;
    right: 10px;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    /* background-color: var(--bg-ds-green-400); */
    background-color: #33cc7a;
    /* box-shadow: 1px 1px 10px 4px rgba(0, 237, 123, 0.5); */
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
    padding-left: 12px;
    padding-right: 12px;
    margin: 0;
  }
</style>
