<script lang="ts">
  import { logoSparrowSquare } from "@sparrow/common/images";
  import { Spinner } from "@sparrow/library/ui";
  import leftIcon from "@deprecate/assets/left.svg";
  import constants from "@app/constants/constants";
  import { fly, fade } from "svelte/transition";
  import { version } from "../../../../src-tauri/tauri.conf.json";
  import { onMount } from "svelte";
  import { platform } from "@tauri-apps/plugin-os";
  import { open } from "@tauri-apps/plugin-shell";
  export let title = "Title";
  export let description = "Description";
  export let message = "Detailed Message";
  export let isSpinner = true;
  export let buttonText = "Button";
  export let buttonClick = () => {};
  export let loadingMessage = "";
  export let callback;

  let os = "";
  let externalSparrowLink = `${constants.SPARROW_AUTH_URL}`;
  onMount(async () => {
    os = await platform();
  });
</script>

<!-- <Header /> -->
<div
  class="d-flex align-items-center justify-content-center z-2"
  style="height: 100vh;"
  transition:fade={{ delay: 0, duration: 100 }}
>
  <div
    class="container rounded container d-flex flex-column align-items-center justify-content-center w-100 z-2"
    transition:fly={{ y: 50, delay: 0, duration: 100 }}
    on:introstart
    on:outroend
  >
    <div class="w-100 mb-3">
      <span
        class="cursor-pointer text-lightGray"
        on:click={() => {
          callback(false);
        }}><img src={leftIcon} class="me-2" /> Go Back</span
      >
    </div>
    <div
      class="text-white d-flex justify-content-center align-items-center bg-primary-300"
      style="height: 60px; width: 60px; border-radius: 6px;"
    >
      <img src={logoSparrowSquare} alt="" class="" />
    </div>
    <p
      class="container-header pt-4 pb-0 sparrow-fs-28 text-whiteColor text-center ms-2 me-2 fw-bold"
    >
      {title}
    </p>

    <div class="text-center text-lightGray">
      <p>{description}</p>
    </div>

    <div class="text-center sparrow-fs-14 text-lightGray mt-2">
      <slot />
    </div>

    {#if isSpinner}
      <div
        class="text-lightGray text-center sparrow-fs-14 d-flex align-items-center justify-content-center mt-4"
      >
        <Spinner size={"45px"} />
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
        class="welcome-spinner text-lightGray mt-4 sparrow-fs-14 text-center"
        style="font-weight: 300;"
      >
        <p>{loadingMessage}</p>
      </div>
    {/if}
    <div
      class="w-100 mt-4 mb-3 d-flex align-items-center justify-content-center"
    >
      {#if os === "windows"}
        <a
          href={`mailto:${constants.SPARROW_SUPPORT_EMAIL}`}
          class="px-2 sparrow-fs-12 text-secondary-250">Need Help?</a
        >
        <span class="px-2 text-secondary-250 fw-bold mb-1">|</span>
        <a
          href={`mailto:${constants.SPARROW_SUPPORT_EMAIL}`}
          class="px-2 sparrow-fs-12 text-secondary-250">Report Issue</a
        >
      {:else}
        <a
          on:click={async () => {
            await open(externalSparrowLink + "/support");
          }}
          role="button"
          class="px-2 sparrow-fs-12 text-secondary-250">Need Help?</a
        >
        <span class="px-2 text-secondary-250 fw-bold mb-1">|</span>
        <a
          role="button"
          on:click={async () => {
            await open(externalSparrowLink + "/support");
          }}
          class="px-2 sparrow-fs-12 text-secondary-250">Report Issue</a
        >
      {/if}
    </div>
    <div class="mt-5">
      <p
        class="cursor-pointer text-center text-secondary-250 sparrow-fs-12 mt-3 mb-1"
      >
        Version {version}
      </p>
    </div>
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
    background: linear-gradient(
      270deg,
      #584ffd -0.08%,
      #a1d8ff 25.35%,
      #1193f0 97.06%
    );
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
  a:hover {
    color: var(--primary-btn-color);
    text-decoration: underline;
  }
  .cursor-pointer {
    cursor: pointer;
  }

  .check-for-update {
    background: linear-gradient(
      90deg,
      var(--bg-primary-250) 0%,
      var(--bg-primary-300) 100%
    );
    background-clip: text;
    color: transparent;
  }
</style>
