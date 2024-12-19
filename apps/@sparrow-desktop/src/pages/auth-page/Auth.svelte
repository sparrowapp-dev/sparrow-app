<script lang="ts">
  import axios, { type Method } from "axios";
  import { notifications, Spinner } from "@sparrow/library/ui";
  import {
    logoSparrowSquare,
    SparrowBackgroundV2,
    sparrowLogoBackground,
  } from "@sparrow/common/images";
  import { DefaultHeader, Redirect } from "@sparrow/common/components";
  import constants from "@app/constants/constants";
  import {
    AISparkle,
    AiSparkleIconV2,
    AiSparkleIconV3,
    ArrowRightIcon,
    CopyIcon2,
    StarIcon,
  } from "@sparrow/library/icons";
  import { StarFilledIcon } from "@sparrow/library/icons";
  import { CopyIcon } from "@sparrow/library/icons";
  import { ExternalLinkIcon } from "@sparrow/library/icons";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { open } from "@tauri-apps/plugin-shell";
  import { version } from "../../../src-tauri/tauri.conf.json";
  import { Background } from "@sparrow/common/components";
  import { platform } from "@tauri-apps/plugin-os";
  import { onMount } from "svelte";
  import { navigate } from "svelte-navigator";
  import { AuthViewModel } from "./Auth.ViewModel";
  import { isGuestUserActive, navigationState } from "@app/store/auth.store";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { leftIconIcon } from "@sparrow/library/assets";
  import { jwtDecode } from "@app/utils/jwt";
  import { handleLoginV2 } from "./sub-pages/login-page/login-page";
  let isEntry = false;
  let isHover = false;
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
  let token = "";
  let isTokenFormEnabled = false;
  let isTokenErrorMessage = false;
  let isTokenValidationLoading = false;

  let isPressed = false;
</script>

<DefaultHeader />

<Background>
  {#if isTokenFormEnabled}
    <div style="position:absolute; top:0; left: 28px; top:28px;">
      <button
        style="width: 33px; height:33px; border-radius: 10px; border: 1px solid  var(--border-secondary-300); outline:none;"
        class="d-flex align-items-center justify-content-center bg-transparent"
        on:click={() => {
          isTokenFormEnabled = false;
          token = "";
        }}
      >
        <img src={leftIconIcon} class="" />
      </button>
    </div>
  {/if}
  <div class="d-flex align-items-start gap-2">
    <div
      class="text-white d-flex justify-content-center align-items-center bg-primary-300"
      style="height: 25px; width: 25px; border-radius: 6px;"
    >
      <img height="17px" width="17px" src={logoSparrowSquare} alt="" class="" />
    </div>
    <p style="font-weight:500;">Sparrow</p>
  </div>

  <div style="display: flex ; flex-direction:column; align-items:center;">
    <p
      class="container-header text-fs-24 sparrow-fw-600 text-whiteColor text-center ms-2 me-2 mb-1"
      style="font-weight: 400; padding-top:20px; line-height:28px; text-align:center;"
    >
      Welcome to Sparrow!
    </p>
    <p class="sparrow-fs-12 mt-0" style="color: var(--text-secondary-200);">
      The only API Sidekick you need
    </p>
  </div>

  {#if !isTokenFormEnabled}
    <div
      class=""
      style="display: flex ; flex-direction:column; align-items:center;"
    >
      <div class="d-flex" style="height:44px; width:100%; margin-top:44px;">
        <button
          on:mousedown={() => (isPressed = true)}
          on:mouseup={() => (isPressed = false)}
          on:mouseleave={() => (isPressed = false)}
          class="btn btn-primary w-100 border-0 {isPressed
            ? 'shadow-pressed'
            : 'shadow-none'}"
          on:click={() => {
            handleRedirect(true);
            openDefaultBrowser();
            isTokenFormEnabled = true;
          }}
          id="create_account_or_sign_in"
        >
          Login or Create</button
        >
      </div>

      <div class="divider w-100">
        <span class="line"></span>
        <span class="text" style="color:var(--text-secondary-200)">Or</span>
        <span class="line"></span>
      </div>

      <div class="d-flex" style="height:44px; width:100%;">
        <button
          class="btn btn-secondary w-100 text-whiteColor"
          style=""
          on:click={() => {
            skipLoginHandler();
          }}
          id="create_account_or_sign_in"
        >
          Try Sparrow Edge</button
        >
      </div>

      <div
        class="mb-2 mt-2 w-[266px]"
        style=" text-align:center; font-size:12px; color:var(--text-secondary-1030);  width: 100%;
      font-size: 12px; font-weight:400;
      "
      >
        <AiSparkleIconV2 height={"20"} width={"20"} /> Instantly test APIs without
        signing up-just the essentials to get started fast.
      </div>
    </div>
  {:else}
    <div
      class="w-100"
      style="display: flex ; flex-direction:column; align-items:center;"
    >
      <div class="w-100">
        <label
          for="exampleInputEmail1"
          class="form-label text-lightGray text-fs-12 d-flex"
          >Token
          <p class="ms-1 mb-0 sparrow-fw-600 text-dangerColor">*</p>
        </label>
        <!-- <img src={starIcon} alt="" class="mb-3" style="width: 7px;" /> -->
        <input
          type="email"
          class="form-control py-2 text-fs-12-important"
          style={isTokenErrorMessage
            ? "border: 1px solid var(--border-danger-200)"
            : ""}
          placeholder="Enter your token"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          bind:value={token}
          on:input={() => {
            isTokenErrorMessage = false;
          }}
          on:blur={async () => {}}
        />
        {#if isTokenErrorMessage}
          <small class="text-danger-200 text-fs-12"
            >Invalid or expired code.</small
          >
        {/if}
      </div>

      <div class="d-flex" style="height:44px; width:100%; margin-top:15px;">
        <button
          class="btn d-flex justify-content-center align-items-center btn-primary w-100 text-blackColor border-0"
          on:click={async () => {
            const params = new URLSearchParams(token.split("?")[1]);
            const accessToken = params.get("accessToken");
            const refreshToken = params.get("refreshToken");
            const userDetails = jwtDecode(accessToken);
            const apiUrl = constants.API_URL;
            const userId = userDetails?._id;
            const userEmail = userDetails?.email;
            if (!userEmail || !userId || !accessToken || !refreshToken) {
              isTokenErrorMessage = true;
              return;
            }
            try {
              isTokenValidationLoading = true;
              await axios({
                method: "GET",
                url: `${apiUrl}/api/team/user/${userId}`,
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              isTokenErrorMessage = false;
              handleLoginV2(token);
            } catch (e) {
              isTokenErrorMessage = true;
            } finally {
              isTokenValidationLoading = false;
            }
          }}
          id="create_account_or_sign_in"
          disabled={!token || isTokenValidationLoading}
        >
          {#if isTokenValidationLoading}
            <Spinner size={"16px"} />
          {:else}
            Login
          {/if}
        </button>
      </div>
      <div class="sparrow-fw-400 sparrow-fs-16" style="margin-top: 6px;">
        <div
          style="text-align:center; max-width: 370px;"
          class="text-lightGray mt-4 sparrow-fw-300 sparrow-fs-12"
        >
          <p>
            <span
              role="button"
              on:click={async () => {
                await copyToClipBoard(externalSparrowLink);
                notifications.success("Link copied to clipboard.");
              }}
            >
              <CopyIcon2 height={"14px"} width={"16px"} color={"#CCCCCCE5"} />
              <span
                style="text-decoration: underline; text-underline-offset: 4px;"
                >copy</span
              >
            </span>
            the link if you are facing any issue in redirecting to the login page.
          </p>
        </div>
      </div>
    </div>
  {/if}

  <div
    class="w-100 d-flex align-items-center justify-content-center"
    style="margin-top: 64px;"
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
        class="link-button px-2 sparrow-fs-12">Need Help?</a
      >
      <span class="px-2 text-secondary-250 fw-bold mb-1">|</span>
      <a
        role="button"
        on:click={async () => {
          await open(externalSparrowLink + "/support");
        }}
        class="px-2 link-button sparrow-fs-12">Report Issue</a
      >
    {/if}
  </div>
</Background>

<div
  style="height: 100vh; top:0; left:0;
        right:0; z-index:-100 !important"
  class="w-100 position-fixed bg-blackColor"
>
  <img src={SparrowBackgroundV2} alt="" style="height:100%; width:100%;" />
</div>

<style>
  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
    color: var(--text-primary-300);
  }
  .cursor-pointer {
    cursor: pointer;
  }

  button {
    transition: all 300ms ease-in-out;
  }

  .btn-primary {
    font-weight: 400;
    font-size: 14px;
    background: var(--bg-secondary-100);
    color: var(--text-secondary-900);
    border: 1px solid #ffffff;
  }

  .btn-primary:hover {
    background-color: #6147ff; /* purple-600 */
    border-color: transparent;
    color: var(--text-secondary-100);
  }

  .btn-primary.shadow-none {
    box-shadow: none;
  }

  .btn-primary.shadow-pressed {
    box-shadow: inset 0px 0px 12px 5px rgba(0, 0, 0, 0.55);
    border: 0.4px solid white !important;
  }

  .btn-primary:active {
    box-shadow: inset 0px 0px 12px 5px rgba(0, 0, 0, 0.55);
  }
  .btn-primary:disabled {
    background-color: var(--bg-secondary-100);
    border: 1px solid #ffffff;
  }

  .btn-secondary {
    font-weight: 400;
    font-size: 14px;
    background-color: transparent;
    border: 1px solid rgba(214, 211, 209, 0.9);
    border-radius: 8px;
  }

  .btn-secondary:hover {
    background-color: #6147ff;
    border-color: transparent;
  }

  .btn-secondary:active {
    box-shadow: inset 0px 0px 12px 5px rgba(0, 0, 0, 0.55);
    transition: all 100ms ease-in-out;
  }

  .btn-secondary:disabled {
    background-color: transparent;
    border: 1px solid rgba(214, 211, 209, 0.9);
  }

  .link-button {
    color: #62636c;
    font-weight: 400;
    font-size: 14px;
    cursor: pointer;
  }

  .link-button:hover {
    color: var(--text-primary-300);
  }

  .link-button:active {
    color: var(--text-primary-300);
  }

  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
    font-family: Arial, sans-serif;
  }

  .divider .line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #62636c00, #bfc0d2);
  }

  .divider .line:last-child {
    background: linear-gradient(to left, #62636c00, #bfc0d2);
  }

  .divider .text {
    margin: 0 4px;
    color: #bfc0d2;
    font-size: 14px;
  }

  input {
    background-color: transparent !important;
    outline: none;
  }
  button:disabled {
    opacity: 0.7;
  }
</style>
