<script lang="ts">
  import sparrowIcon from "$lib/assets/sparrow-icon-bg.svg";
  import Spinner from "$lib/components/transition/Spinner.svelte";
  import leftIcon from "$lib/assets/left.svg";
  import constants from "$lib/utils/constants";
  import { fly, fade } from "svelte/transition";
  import { version } from "../../../../src-tauri/tauri.conf.json";
  export let title = "Title";
  export let description = "Description";
  export let message = "Detailed Message";
  export let isSpinner = true;
  export let buttonText = "Button";
  export let buttonClick = () => {};
  export let loadingMessage = "";
  export let callback;
</script>

<!-- <Header /> -->
<div
  class="background-overlay d-flex align-items-center justify-content-center z-2"
  transition:fade={{ delay: 0, duration: 100 }}
>
  <div
    class="container rounded container d-flex flex-column align-items-center justify-content-center w-100 z-2"
    transition:fly={{ y: 50, delay: 0, duration: 100 }}
    on:introstart
    on:outroend
  >
    <div class="w-100">
      <span
        class="cursor-pointer"
        on:click={() => {
          callback(false);
        }}><img src={leftIcon} class="me-2" /> Go Back</span
      >
    </div>
    <div class="text-white d-flex justify-content-center align-items-center">
      <img src={sparrowIcon} width="60px" alt="" class="" />
    </div>
    <p
      class="container-header pt-4 pb-0 sparrow-fs-28 text-whiteColor text-center ms-2 me-2 fw-bold"
    >
      {title}
    </p>

    <div class="text-center sparrow-fs-14 text-lightGray">
      <p>{description}</p>
    </div>

    <div class="text-center sparrow-fs-14 text-lightGray mt-2">
      <slot />
    </div>

    {#if isSpinner}
      <div
        class="text-lightGray text-center sparrow-fs-14 d-flex align-items-center justify-content-center mt-3"
      >
        <Spinner size={"80px"} />
      </div>
    {:else}
      <div
        class="text-lightGray sparrow-fs-14 text-center d-flex align-items-center justify-content-center mt-3"
      >
        <button
          class="buttons d-flex justify-content-center align-items-center gap-1 rounded border-0"
          on:click={buttonClick}
        >
          {buttonText}
        </button>
      </div>
    {/if}

    {#if loadingMessage}
      <div
        class="welcome-spinner text-lightGray mt-4 sparrow-fs-12 text-center"
      >
        <p>{loadingMessage}</p>
      </div>
    {/if}
    <div
      class="w-100 mt-3 mb-3 d-flex align-items-center justify-content-center"
    >
      <a
        href={`mailto:${constants.SPARROW_SUPPORT_EMAIL}`}
        class="px-2 sparrow-fs-12">Need Help?</a
      >
      <span class="px-2 text-textColor fw-bold">|</span>
      <a
        href={`mailto:${constants.SPARROW_SUPPORT_EMAIL}`}
        class="px-2 sparrow-fs-12">Report Issue</a
      >
    </div>
    <p class="text-center sparrow-fs-14 mt-3">Version {version}</p>
  </div>
</div>

<style>
  .background-overlay {
    min-height: calc(100vh - 44px);
    background-color: black;
    overflow: auto;
  }

  .container {
    margin: 30px !important;
    max-width: 500px;
    padding: 48px 48px 64px 48px !important;
  }
  .container-header {
    background: linear-gradient(45deg, #b4a9fd, #eef8ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .buttons {
    width: 180px;
    height: 32px;
    padding: 4px, 12px, 4px, 4px;
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }

  a {
    text-decoration: none;
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>
