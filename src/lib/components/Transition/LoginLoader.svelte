<script lang="ts">
  import icons from "$lib/assets/app.asset";
  import Spinner from "$lib/components/Transition/Spinner.svelte";

  import { fly, fade } from "svelte/transition";
  export let onClick: (flag: boolean) => void;
  export let isLoadingPage;
</script>

<div
  class="background-overlay"
  on:click={() => {
    onClick(false);
  }}
  transition:fade={{ delay: 0, duration: 100 }}
/>

<div
  class="container d-flex flex-column mb-0 px-4 pb-0 pt-4"
  transition:fly={{ y: 50, delay: 0, duration: 100 }}
  on:introstart
  on:outroend
>
  <div class="d-flex align-items-center justify-content-center mb-3 gap-2">
    <img src={icons.logoSparrow} alt="" />
    <h5 class="mb-0 text-whiteColor" style="font-weight: 500;font-size:36px;">
      Sparrow
    </h5>
  </div>

  {#if isLoadingPage}
    <div
      style="font-size: 14px;text-align:center"
      class="text-lightGray d-flex align-items-center justify-content-center mt-2"
    >
      <Spinner size={"60px"} />
    </div>
  {/if}

  <div style="font-size: 14px;text-align:center" class="text-lightGray mt-2">
    <p>Please wait while we sign you in....</p>
  </div>
</div>

<style>
  .background-overlay {
    position: fixed;
    top: 44px;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 1;
  }

  .container {
    position: fixed;
    height: 200px;
    width: 500px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 1;
    border-radius: 10px;
  }
</style>
