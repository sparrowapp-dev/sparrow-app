<script lang="ts">
  import { notifications } from "@library/ui/toast/Toast";
  import sparrowicon from "@library/icons/logoSparrowSquare.svg";
  import Redirect from "../redirect/Redirect.svelte";
  import constants from "$lib/utils/constants";
  import StarIcon from "../../../../@library/icons/Star.svelte";
  import StarFilled from "@library/icons/StarFilled.svelte";
  import copyToClipBoard from "$lib/utils/copyToClipboard";
  import { open } from "@tauri-apps/plugin-shell";
  import { version } from "../../../../../../src-tauri/tauri.conf.json";
  import externalLink from "$lib/assets/external_link.svg";
  import copyIcon from "$lib/assets/copy_icon.svg";
  import bg from "@library/icons/sparrowLogoBackground.svg";
  import BgContainer from "./BgContainer.svelte";
  import { platform } from "@tauri-apps/plugin-os";
  import { onMount } from "svelte";
  import { navigate } from "svelte-navigator";
  import { AuthViewModel } from "../Auth.ViewModel";
  import { isGuestUserActive, navigationState } from "$lib/store";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import Button from "@library/ui/button/Button.svelte";
  let isEntry = false;

  let isHover = false;
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
  const _viewModel = new AuthViewModel();
  const openDefaultBrowser = async () => {
    await open(externalSparrowLink);
  };
  const handleRedirect = (value: boolean) => {
    isEntry = value;
  };
  let os = "";
  onMount(async () => {
    os = await platform();
    let navigationPath = "";
    navigationState.subscribe((value) => {
      navigationPath = value;
    });
    if (navigationPath === "guestUser") {
      isEntry = true;
      navigationState.set("");
    }
  });

  const skipLoginHandler = async () => {
    // Save Guest User in local DB
    const response = await _viewModel.findUser({ name: "guestUser" });
    if (!response) {
      await _viewModel.addGuestUser();
      await _viewModel.createGuestUserTeamWorkspace();
      isGuestUserActive.set(true);
      navigate("/guest/collections");
      MixpanelEvent(Events.CONTINUE_WITHOUT_SIGNUP, {
        source: "Entry Page",
      });
    }
  };
</script>

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
        class="text-primary-150 cursor-pointer text-decoration-underline"
        >Sparrow website <img class="mx-2" src={externalLink} alt="" /></span
      >
      to sign In or copy URL
      <span
        class="text-labelColor cursor-pointer text-decoration-underline bg-secondary-550"
        style="border-radius: 2px;"
        on:click={async () => {
          await copyToClipBoard(externalSparrowLink);
          notifications.success("Link copied to clipboard!");
        }}><img src={copyIcon} class="px-2" />Copy</span
      >
    </p></Redirect
  >
{:else}
  <BgContainer>
    <div
      class="text-white d-flex justify-content-center align-items-center bg-primary-300"
      style="height: 60px; width: 60px; border-radius: 6px;"
    >
      <img src={sparrowicon} alt="" class="" />
    </div>
    <p
      class="container-header pt-4 pb-4 sparrow-fs-28 sparrow-fw-600 text-whiteColor text-center ms-2 me-2"
      style="font-weight: 500;"
    >
      Welcome to <span class="text-primary-300">Sparrow!</span>
    </p>
    <div class="mb-1" style="height:40px;">
      <button
        class="btn btn-primary mb-3 w-100 text-whiteColor border-0"
        on:click={() => {
          handleRedirect(true);
          openDefaultBrowser();
        }}
      >
        Create an Account or Sign In</button
      >
    </div>
    <div class="mb-1">
      <div
        class="mb-2"
        style="text-align:center; font-size:12px; color:var(  --text-secondary-350);"
      >
        or
      </div>
      <div style="height:32px;">
        <Button
          onClick={() => {
            skipLoginHandler();
          }}
          title={"Try Sparrow Edge"}
          buttonClassProp={"btn mb-2"}
          type={"teritiary"}
          buttonStyleProp={"height:32px; weight:126px; border-color:var( --border-primary-300) !important; font-size:13px; "}
        />
      </div>
    </div>
    <div
      class="mb-2 mt-2 w-[266px]"
      style="text-align:center; font-size:12px; color:var(  --text-secondary-350); padding: 5% 0px; width: 80%;
      font-size: 12px;
      "
    >
      Sparrow Edge: Your instant, no-signup API testing tool stripped down to
      the essentials.
    </div>

    <div class="w-100 d-flex align-items-center justify-content-center">
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
    <div slot="outside">
      <div
        class="mb button-text text-center sparrow-fs-16 gap-1 d-flex cursor-pointer mt-5 d-flex justify-content-center align-items-center mb-5 object-fit-cover"
        on:click={async () => {
          await open(externalSparrowGithub);
        }}
      >
        <div
          class="d-flex"
          on:mouseenter={() => {
            isHover = true;
          }}
          on:mouseleave={() => {
            isHover = false;
          }}
        >
          <div class="me-1">
            {#if isHover}
              <StarFilled />
            {:else}
              <StarIcon />
            {/if}
          </div>

          <p
            class="{isHover ? 'star-text-hover' : ''} mb-0"
            style="margin-top:3px; "
          >
            Star us on GitHub
          </p>
        </div>
      </div>
      <div class="divider-line my-4" />

      <div>
        <p
          class=" cursor-pointer text-center text-secondary-250 sparrow-fs-14 m-1"
        >
          Version {version}
        </p>
      </div>
    </div>
  </BgContainer>
{/if}

<div
  style="height: 100vh; top:0; left:0;
        right:0; z-index:-100 !important"
  class="w-100 position-fixed bg-blackColor"
>
  <img src={bg} alt="" style="height:100%; width:100%;" />
</div>

<style>
  .btn-primary {
    background: var(--bg-primary-300);
  }
  .btn-primary:hover {
    background: var(--text-primary-400);
  }
  .btn-primary:active {
    background: var(--button-active);
  }

  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
    color: var(--primary-btn-color);
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .divider-line {
    height: 2px;
    width: 80vw;
    margin: 0 auto;
    background: linear-gradient(
      90deg,
      var(--bg-secondary-900) 0%,
      #354366 51.5%,
      var(--bg-secondary-900) 100%
    );
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
  .star-text-hover {
    color: var(--primary-btn-color);
    text-decoration: underline;
  }
  .btn-guest {
    color: var(--text-primary-300);
    text-decoration: underline;
    font-size: 13px;
    cursor: pointer;
  }
</style>
