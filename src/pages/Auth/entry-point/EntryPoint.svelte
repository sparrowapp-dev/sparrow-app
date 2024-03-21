<script lang="ts">
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import sparrowicon from "$lib/assets/sparrow-icon-bg.svg";
  import Redirect from "../redirect/Redirect.svelte";
  import constants from "$lib/utils/constants";
  import Header from "$lib/components/header/Header.svelte";
  import star from "$lib/assets/star.svg";
  import copyToClipBoard from "$lib/utils/copyToClipboard";
  import { open } from "@tauri-apps/plugin-shell";
  import { version } from "../../../../src-tauri/tauri.conf.json";
  import externalLink from "$lib/assets/external_link.svg";
  import copyIcon from "$lib/assets/copy_icon.svg";
  import bg from "$lib/assets/body-gradient.svg";
  let isEntry = false;

  let redirectRules = {
    title: "Opening Web Browser...",
    description: "",
    message: ``,
    isSpinner: true,
    buttonText: "Open Desktop App",
    buttonClick: () => {},
    loadingMessage: "Please wait while we sign you in....",
  };
  let externalSparrowLink = `${constants.SPARROW_AUTH_URL}`;
  const externalSparrowGithub = constants.SPARROW_GITHUB;
  const openDefaultBrowser = async () => {
    await open(externalSparrowLink);
  };
  const handleRedirect = (value) => {
    isEntry = value;
  };
</script>

<Header />
{#if isEntry}
  <Redirect
    title={redirectRules.title}
    description={redirectRules.description}
    message={redirectRules.message}
    isSpinner={redirectRules.isSpinner}
    buttonText={redirectRules.buttonText}
    buttonClick={redirectRules.buttonClick}
    loadingMessage={redirectRules.loadingMessage}
    callback={handleRedirect}
  >
    <p class="sparrow-fs-16">
      If your browser doesn’t open automatically, please visit
      <span
        on:click={openDefaultBrowser}
        class="text-labelColor cursor-pointer text-decoration-underline"
        >Sparrow website <img class="mx-2" src={externalLink} alt="" /></span
      >
      to sign In or copy URL
      <span
        class="text-labelColor cursor-pointer text-decoration-underline"
        on:click={async () => {
          await copyToClipBoard(externalSparrowLink);
          notifications.success("Link copied to clipboard!");
        }}><img src={copyIcon} class="px-2" />Copy</span
      >
    </p></Redirect
  >
{:else}
  <div
    class="parent d-flex align-items-center justify-content-center text-white rounded z-2"
  >
    <div
      class="entry-point rounded container d-flex flex-column align-items-center justify-content-center w-100 z-2"
    >
      <div class="text-white d-flex justify-content-center align-items-center">
        <img src={sparrowicon} width="60px" alt="" class="" />
      </div>
      <p
        class="container-header pt-4 pb-4 sparrow-fs-28 text-whiteColor text-center ms-2 me-2 fw-bold"
      >
        Welcome to Sparrow!
      </p>
      <p class="card-subtitle sparrow-fs-20 mb-3 text-center">
        Create an account or sign In
      </p>
      <div class="mb-1">
        <button
          class="btn btn-primary mb-3 w-100 text-whiteColor border-0"
          on:click={() => {
            handleRedirect(true);
            openDefaultBrowser();
          }}
        >
          Create Account or Sign In</button
        >
      </div>
      <div class="w-100 mb-3 d-flex align-items-center justify-content-center">
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
      <div>
        <p
          class="text-center sparrow-fs-16 d-flex cursor-pointer"
          on:click={async () => {
            await open(externalSparrowGithub);
          }}
        >
          <img src={star} class="me-2" alt="" />
          <span>Star us on GitHub</span>
        </p>
        <p class="text-center sparrow-fs-14 mt-5">Version {version}</p>
      </div>
    </div>
  </div>
{/if}
<div
  style="height:300px; bottom:0; left:0;
right:0;"
  class="w-100 position-fixed z-1"
>
  <img src={bg} alt="" style="height:100%; width:100%;" />
</div>

<style>
  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }
  .parent {
    min-height: calc(100vh - 44px);
    overflow: auto;
    background-color: black;
  }
  .entry-point {
    margin: 30px !important;
    background: linear-gradient(
      to bottom,
      rgba(51, 51, 51, 0.16),
      rgba(42, 42, 51, 1)
    );
    max-width: 504px;
    padding: 48px 48px 30px 48px !important;
  }
  input {
    background-color: transparent;
  }
  a {
    text-decoration: none;
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>
