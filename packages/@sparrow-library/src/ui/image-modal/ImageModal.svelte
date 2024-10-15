<script lang="ts">
  import { CrossIcon } from "@sparrow/library/icons";

  import { scale, fade } from "svelte/transition";
  import { downloadWarningIcon as warningIcon } from "@sparrow/library/assets";

  export let isOpen = false;
  export let title: string;
  export let type: "primary" | "dark" | "danger" = "primary";
  export let canClose = true;
  export let icon = "";
  /**
   * Takes x-index, recommended values => 1, 100, 1000, 10000, 100000.
   */
  export let zIndex = 1000;
  export let width = "35%";
  export let isCrossButton = true;
  /**
   * Callback function to close the modal.
   */
  export let handleModalState: (flag: boolean) => void;
</script>

{#if isOpen}
  <div
    class="sparrow-modal-bg-overlay"
    style={`z-index: ${zIndex} !important`}
    transition:fade={{ delay: 0, duration: 200 }}
  />
  <div
    class="sparrow-modal-container"
    style={`z-index: ${zIndex + 1};`}
    in:scale={{ start: 0.8, duration: 300 }}
    out:scale={{ start: 0.8, duration: 300 }}
  >
    <div
      on:click={canClose ? handleModalState(false) : null}
      class="sparrow-modal-container-firstChild"
    ></div>

    <div
      class="sparrow-modal-container-data gap-2"
      style={`z-index: ${zIndex + 2}; width: ${width}`}
    >
      <div
        class="sparrow-modal-header justify-content-between d-flex align-items-start"
      >
        <div class="d-flex ellipsis">
          {#if icon === "warning"}
            <img src={warningIcon} height="26px" class="me-2" alt="" />
          {/if}
          {#if title}
            <h3 class="sparrow-modal-heading fw-normal ellipsis">{title}</h3>
          {/if}
        </div>
        {#if isCrossButton}
          <button
            class="sparrow-modal-close-icon-btn border-0 d-flex justify-content-center align-items-center"
            style="height: 30px; width:30px; "
            on:click={handleModalState(false)}
          >
            <CrossIcon width="17px" height="17px" />
          </button>
        {/if}
      </div>

      <div class="sparrow-modal-body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .sparrow-modal-container-firstChild {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .sparrow-modal-bg-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }

  .sparrow-modal-container {
    position: fixed;
    height: auto;
    right: 0;
    bottom: 0;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .sparrow-modal-container-data {
    background-color: var(--bg-tertiary-400);
    border-radius: 6px;
    position: relative;
  }
  .sparrow-modal-heading {
    font-size: 20px;
    color: white;
  }

  .sparrow-modal-close-icon-btn {
    background-color: transparent;
    position: absolute;
    top: 2px;
    right: 2px;
  }
  .sparrow-modal-close-icon-btn:hover {
    background-color: var(--bg-tertiary-300);
  }
  .sparrow-modal-close-icon-btn:active {
    background-color: var(--bg-danger-200);
  }
</style>
