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
  <div
    class="d-flex position-relative custom-toast custom-toast-{data.type} toast"
  >
    <div class="w-100 content-wrapper">
      <span class="icon">
        <span class="icon-backdrop icon-backdrop-{data.type}" />
        {#if data.type === "success"}
          <div class="bg-circle">
            <NewSuccessIcon />
          </div>
        {:else if data.type === "warning"}
          <div class="bg-circle">
            <NewWarningIcon />
          </div>
        {:else}
          <div class="bg-circle">
            <NewErrorIcon />
          </div>
        {/if}
      </span>
      <span class="description">{data.description}</span>
    </div>
    <!-- Close Icon -->
    <div class="close-icon">
      <span data-notification-btn role="button" on:click={() => data.remove()}>
        <NewCloseIcon />
      </span>
    </div>
    <!-- Progress Bar -->
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
    display: flex;
    align-items: center;
  }
  .custom-toast {
    height: 60px;
  }

  .content-wrapper {
    display: flex;
    align-items: center;
    padding: 12px;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 18px;
    position: relative;
    min-width: 40px;
  }

  .bg-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-ds-surface-100);
    border-radius: 50%;
    height: 32px;
    width: 32px;
  }

  .description {
    font-size: 13px;
    color: var(--text-ds-neutral-100);
    width: 225px;
    font-family: "Inter", sans-serif;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .close-icon {
    position: relative;
    top: -12px;
    right: 10px;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

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

  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0;
    }
  }
</style>
