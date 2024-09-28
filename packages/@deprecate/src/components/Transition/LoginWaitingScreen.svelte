<script lang="ts">
  import icons from "$lib/assets/app.asset";

  import { fly, fade } from "svelte/transition";
  import { Loader } from "@sparrow/library/ui";
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
  class="container d-flex flex-column mb-0 pb-0 pt-4 rounded-3"
  transition:fly={{ y: 50, delay: 0, duration: 100 }}
  on:introstart
  on:outroend
>
  <div class="d-flex align-items-center justify-content-center mb-3 gap-2">
    <img src={icons.logoSparrow} alt="" />
    <span class="mb-0 text-whiteColor sparrow-fs-36 fw-medium">Sparrow</span>
  </div>

  <Loader
    loaderSize={"60px"}
    loaderMessage="Please wait while we sign you in...."
    messageStyleProp={"font-size: var(--base-text)"}
    messageClassProp={"text-lightGray mt-2"}
  />
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
    width: 500px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 10;
  }
</style>
