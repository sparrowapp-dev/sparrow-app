<script lang="ts">
  import { CrossIcon } from "$lib/assets/app.asset";

  import { scale, fade } from "svelte/transition";
  import warningIcon from "$lib/assets/download-warning.svg";

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
      class="testing-desgin"
    ></div>

    <div
      class="sparrow-modal-container-data p-4 gap-2"
      style={`z-index: ${zIndex + 2}; width: ${width}`}
    >
      <div
        class="sparrow-modal-header justify-content-between d-flex align-items-start"
      >
        <div class="d-flex ellipsis">
          {#if icon === "warning"}
            <img src={warningIcon} height="26px" class="me-2" alt="" />
          {/if}
          <h3 class="sparrow-modal-heading fw-normal ellipsis">{title}</h3>
        </div>
        {#if canClose}
          <button
            class="sparrow-modal-close-icon-btn border-0"
            on:click={handleModalState(false)}
          >
            <CrossIcon />
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
  .testing-desgin {
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
    /* background-color: var(--bg-tertiary-400); */
    border-radius: 6px;
  }

  .sparrow-modal-container-data {
    background-color: var(--bg-tertiary-400);
    border-radius: 6px;
  }
  .sparrow-modal-heading {
    font-size: 20px;
  }

  .sparrow-modal-close-icon-btn {
    background-color: transparent;
  }
</style>
