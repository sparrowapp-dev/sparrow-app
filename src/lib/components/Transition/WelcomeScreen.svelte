<script lang="ts">
  import icons from "$lib/assets/app.asset";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { register_user, setUser } from "$lib/store/auth.store";
  import constants from "$lib/utils/constants";
  import { jwtDecode, setAuthJwt } from "$lib/utils/jwt";
  import { onDestroy, onMount } from "svelte";

  import { fly, fade } from "svelte/transition";
  import { resizeWindowOnLogin } from "../header/window-resize";
  import Header from "../header/Header.svelte";
  import { navigate } from "svelte-navigator";
  import ActiveSideBarTabViewModel from "../../../pages/Dashboard/ActiveSideBarTab.ViewModel";
  export let onClick: (flag: boolean) => void;
  const workspaceLoadtime = constants.API_SEND_TIMEOUT;
  const _activeSidebarViewModel = new ActiveSideBarTabViewModel();
  let registerUser;

  const unsubscribeRegisterUser = register_user.subscribe((value) => {
    registerUser = value;
  });

  const handleWorkspace = () => {
    resizeWindowOnLogin();
    setAuthJwt(
      constants.AUTH_TOKEN,
      registerUser?.data?.data?.accessToken.token,
    );
    setAuthJwt(
      constants.REF_TOKEN,
      registerUser?.data?.data?.refreshToken.token,
    );
    setUser(jwtDecode(registerUser.data?.data?.accessToken?.token));
    navigate("/dashboard/collections");
    _activeSidebarViewModel.addActiveTab("collections");
  };

  let showSpinner: boolean = true;
  let showContinueButton: boolean = false;

  onMount(() => {
    const timeout = setTimeout(() => {
      showSpinner = false;
      showContinueButton = true;
    }, workspaceLoadtime);

    return () => clearTimeout(timeout);
  });
  onDestroy(() => {
    unsubscribeRegisterUser();
  });
</script>

<Header />
<div class="background-overlay" transition:fade={{ delay: 0, duration: 100 }}>
  <div
    class="container d-flex flex-column mb-0 px-4 pb-0 pt-4"
    style="height:{showSpinner ? '433px' : '340px'}"
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
    <div style="font-size: 24px;text-align:center" class="text-whiteColor">
      <p>Welcome to Sparrow!</p>
    </div>

    <div style="font-size: 14px;text-align:center" class="text-lightGray">
      <p>Bridging Frontend and Backend Development.</p>
    </div>

    <div style="font-size: 14px;text-align:center" class="text-lightGray mt-2">
      <p>
        Easily document and manage APIs for seamless collaboration between
        frontend and backend teams. Get started now to simplify your development
        workflows.
      </p>
    </div>

    {#if showSpinner}
      <div
        style="font-size: 14px;text-align:center"
        class="text-lightGray d-flex align-items-center justify-content-center mt-3"
      >
        <Spinner size={"80px"} />
      </div>
    {:else if showContinueButton}
      <div
        style="font-size: 14px;text-align:center"
        class="text-lightGray d-flex align-items-center justify-content-center mt-3"
      >
        <button
          class="buttons d-flex justify-content-center align-items-center gap-1"
          on:click={handleWorkspace}
        >
          Continue
        </button>
      </div>
    {/if}

    {#if showSpinner}
      <div class="welcome-spinner text-lightGray mt-4">
        <p>Please wait while we setup your account....</p>
      </div>
    {/if}
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
    height: 433px;
    width: 585px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 1;
    border-radius: 10px;
  }

  .buttons {
    width: 180px;
    height: 32px;
    padding: 4px, 12px, 4px, 4px;
    border-radius: 4px;
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    border: none;
  }

  .welcome-spinner {
    font-size: 14px;
    text-align: center;
  }
</style>
