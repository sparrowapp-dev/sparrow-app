<script lang="ts">
  import { CrossIcon } from "$lib/assets/app.asset";
  import { fade, fly } from "svelte/transition";
  export let isOpen = false;
  export let title: string;
  export let type: "primary" | "dark" | "danger" = "primary";
  export let zIndex = 34;
  export let width = 488;
  export let handleModalState: (flag: boolean) => void;
</script>

{#if isOpen}
  <div
    class="sparrow-modal-bg-overlay"
    style={`z-index: ${zIndex}`}
    on:click={handleModalState(false)}
    transition:fade={{ delay: 0, duration: 100 }}
  />
  <div
    class="sparrow-modal-container gap-2 p-4"
    style={`z-index: ${zIndex + 1}; width: ${width}px`}
    transition:fly={{ y: 50, delay: 0, duration: 100 }}
    on:introstart
    on:outroend
  >
    <div class="sparrow-modal-header justify-content-between d-flex">
      <h3 class="sparrow-modal-heading fw-normal ellipsis">{title}</h3>
      <button
        class="sparrow-modal-close-icon-btn border-0"
        on:click={handleModalState(false)}
      >
        <CrossIcon />
      </button>
    </div>
    <div class="sparrow-modal-body">
      <slot />
    </div>
  </div>
{/if}

<style lang="scss">
  .sparrow-modal-bg-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    backdrop-filter: blur(3px);
  }
  .sparrow-modal-container {
    position: fixed;
    height: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    border-radius: 10px;
  }
  .sparrow-modal-heading {
    font-size: 20px;
  }

  .sparrow-modal-close-icon-btn {
    background-color: transparent;
  }
</style>
