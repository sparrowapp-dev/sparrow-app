<script lang="ts">
  import { CrossIcon } from "@sparrow/library/icons";
  import { DismissRegular } from "@sparrow/library/icons";
  import { scale, fade } from "svelte/transition";
  import { downloadWarningIcon as warningIcon } from "@sparrow/library/assets";
  import { onDestroy } from "svelte";

  export let isOpen = false;
  export let title: string;
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
  export let description: string;

  const trapTab = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
    } else if (event.key === "Escape" && canClose) {
      handleModalState(false);
    }
  };

  $: {
    if (isOpen) {
      document.addEventListener("keydown", trapTab);
    } else {
      document.removeEventListener("keydown", trapTab);
    }
  }

  // Cleanup listener when the component is destroyed
  onDestroy(() => {
    document.removeEventListener("keydown", trapTab);
  });
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
          <div class="flex-column">
            {#if title}
              <h3 class="sparrow-modal-heading fw-normal ellipsis">{title}</h3>
            {/if}
            {#if description}
              <h3 class="sparrow-modal-description fw-normal ellipsis">
                {description}
              </h3>
            {/if}
          </div>
        </div>
        {#if canClose}
          <button
            class="sparrow-modal-close-icon-btn border-0 d-flex justify-content-center align-items-center"
            style="height: 30px; width:30px; "
            on:click={handleModalState(false)}
          >
            <DismissRegular size={"20px"} />
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
    background-color: var(--bg-ds-surface-600);
    border-radius: 8px;
    padding: 30px 30px 20px 30px;
    position: relative;
  }
  .sparrow-modal-heading {
    width: 400px;
    font-size: 20px;
    color: var(--text-ds-neutral-50);
    font-weight: 600;
    line-height: 24px;
  }

  .sparrow-modal-close-icon-btn {
    background-color: transparent;
    position: absolute;
    top: 24px;
    right: 24px;
  }
  .sparrow-modal-close-icon-btn:hover {
    background-color: var(--bg-tertiary-300);
    border-radius: 2px;
  }
  .sparrow-modal-close-icon-btn:active {
    background-color: var(--bg-danger-200);
    border-radius: 2px;
  }
  .sparrow-modal-description {
    font-size: 14px;
    color: var(--text-ds-neutral-100);
    font-weight: 400;
    line-height: 20px;
  }
</style>
