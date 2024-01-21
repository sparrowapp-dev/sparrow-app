<script lang="ts">
  import { CrossIcon } from "$lib/assets/app.asset";
  import { fade, fly } from "svelte/transition";
  import Spinner from "../Transition/Spinner.svelte";

  export let isOpen: boolean;
  export let title: string;
  export let isDanger: boolean = false;
  export let btnText: string;
  export let underSubmission: boolean = false;
  export let handleOpen: () => void;
  export let handleSubmit: () => void;
</script>

{#if isOpen}
  <div
    class="sparrow-modal-bg-overlay"
    on:click={handleOpen}
    transition:fade={{ delay: 0, duration: 100 }}
  />
  <div
    class="sparrow-modal-container gap-2 p-3"
    transition:fly={{ y: 50, delay: 0, duration: 100 }}
    on:introstart
    on:outroend
  >
    <div class="sparrow-modal-header justify-content-between d-flex">
      <h3 class="sparrow-modal-heading fw-normal">{title}</h3>
      <button
        class="sparrow-modal-close-icon-btn border-0"
        on:click={handleOpen}
      >
        <CrossIcon />
      </button>
    </div>
    <div class="sparrow-modal-body">
      <slot />
    </div>
    <div class="sparrow-modal-footer d-flex justify-content-end mt-5">
      <button
        class="sparrow-modal-cancel-btn border-0 py-1 px-3 me-2"
        on:click={handleOpen}>Cancel</button
      >
      {#if isDanger}
        <button
          class="sparrow-modal-danger-btn border-0 py-1 px-3"
          on:click={handleSubmit}>{btnText}</button
        >
      {:else}
        <button
          class="sparrow-modal-primary-btn d-flex border-0 py-1 px-3"
          on:click={() => {
            handleSubmit();
          }}
        >
          {#if underSubmission}
            <Spinner classProp="" size="18px" />
          {/if}
          <span class="ms-2 my-auto">{btnText}</span></button
        >
      {/if}
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
    z-index: 9;
  }
  .sparrow-modal-container {
    position: fixed;
    height: auto;
    width: 540px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 10;
    border-radius: 10px;
  }
  .sparrow-modal-heading {
    font-size: 20px;
  }
  .sparrow-modal-cancel-btn,
  .sparrow-modal-primary-btn,
  .sparrow-modal-danger-btn {
    font-size: 16px;
    border-radius: 4px;
  }
  .sparrow-modal-cancel-btn {
    background-color: var(--border-color);
  }
  .sparrow-modal-primary-btn {
    background-color: var(--primary-btn-color);
  }
  .sparrow-modal-close-icon-btn {
    background-color: transparent;
  }
</style>
