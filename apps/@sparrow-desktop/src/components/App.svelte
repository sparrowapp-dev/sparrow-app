<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import { Modal, Toast } from "@sparrow/library/ui";
  import Authguard from "../routing/Authguard.svelte";
  import Navigate from "../routing/Navigate.svelte";
  import Dashboard from "@app/pages/dashboard-page/Dashboard.svelte";
  import EntryPoint from "@app/pages/auth-page/Auth.svelte";
  import { maximizeWindow } from "../utils";
  import { onMount } from "svelte";
  import { user } from "@app/store/auth.store";
  import { handleShortcuts } from "@app/utils/shortcuts";
  import { AppUpdater } from "@sparrow/common/features";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { singleInstanceHandler } from "@app/utils/singleinstance/app.singleinstance";
  import { AppViewModel } from "./app.ViewModel";
  import { initPostHog } from "@app/utils/posthog/posthogConfig";
  import { getScaleFactor, setScaleFactorToDb } from "@app/utils/zoom";
  import { listen } from "@tauri-apps/api/event";
  import { invoke } from "@tauri-apps/api/core";
  import { platform } from "@tauri-apps/plugin-os";
  import { writable, derived } from "svelte/store";
  import { policyConfig } from "@sparrow/common/store";
  import { OSDetector } from "@sparrow/common/utils";
  import constants from "@app/constants/constants";
  import { open } from "@tauri-apps/plugin-shell";
  import { Platform } from "@sparrow/common/enums";
  import { inviteModalStore } from "@app/store/inviteModal.store";
  import { navigate } from "svelte-navigator";
  import { NotificationService } from "../services/notification.service";

  let isAccessDeniedModalOpen = false;
  const handleAccessDeniedClose = (flag = false) => {
    isAccessDeniedModalOpen = flag;
  };
  const _viewModel = new AppViewModel(handleAccessDeniedClose);

  export let url = "/";
  let isActiveInternet: boolean = true;

  const doOnlineCheck = () => {
    if (!navigator.onLine && isActiveInternet) {
      isActiveInternet = false;
      // notifications.error("The network connection has been lost. Please check your internet and try again. ");
    } else isActiveInternet = true;
  };

  // Hide Toolbar when window is restored from maximized state
  async function setupMaximizeToggleListenerForMac() {
    if (platform() === "macos") {
      listen("tauri://resize", async () => {
        const isMaximized = await getCurrentWindow().isFullscreen();
        if (!isMaximized) {
          await invoke("hide_toolbar");
        }
      });
    }
  }

  const osDetector = new OSDetector();

  // Track loading state
  export const policyLoading = writable(true);

  // Create a derived store to check if policies are ready
  export const policiesReady = derived(
    [policyLoading, policyConfig],
    ([$loading, $config]) => !$loading,
  );

  // Function to load policy config from the registry
  async function loadPolicyConfig() {
    try {
      policyLoading.set(true);
      const config = await invoke("get_policy_config");
      policyConfig.set({
        enableLogin: config.enable_login,
        enableAIAssistance: config.enable_ai_assistance,
        restrictPublicWorkspaceCreation:
          config.restrict_public_workspace_creation,
        disableActiveSync: config.disable_active_sync,
        hubCreationAllowed: config.hub_creation_allowed,
      });
    } catch (error) {
      console.error("Failed to load policy configuration:", error);
    } finally {
      policyLoading.set(false);
    }
  }

  (async () => {
    try {
      if (osDetector.getOS() === Platform.WINDOWS) {
        await loadPolicyConfig();
      } else {
        policyLoading.set(false); // Still resolve loading
      }
    } catch (err) {
      console.error("Platform detection failed:", err);
      policyLoading.set(false);
    }
  })();

  const openUpdateDocs = async () => {
    if (osDetector.getOS() === Platform.LINUX) {
      await open(constants.LINUX_INSTALL_DOCS);
      return;
    }
  };

  const notificationService = new NotificationService();

  onMount(async () => {
    if (typeof window !== "undefined") {
      initPostHog();
    }
    setupMaximizeToggleListenerForMac();
    const initialUrl = await invoke<string | null>("get_initial_deep_link");
    if (initialUrl) {
      await _viewModel.processDeepLink(initialUrl?.toString());
    }
    await _viewModel.registerDeepLinkHandler();
    await notificationService.loadNotificationsToStore();

    await singleInstanceHandler();
    await setScaleFactorToDb(await getScaleFactor());
    let isloggedIn;
    user.subscribe((value) => {
      isloggedIn = value;
    });

    window.addEventListener(
      "dragover",
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false,
    );
    window.addEventListener(
      "drop",
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false,
    );
    setInterval(() => {
      doOnlineCheck();
    }, 5000);
  });
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
</script>

<AppUpdater updateDoc={openUpdateDocs} />

<Modal
  title="Access Denied"
  type="dark"
  width="45%"
  zIndex={1000}
  isOpen={isAccessDeniedModalOpen}
  handleModalState={handleAccessDeniedClose}
>
  <div class="py-0">
    <p class="text-fs-14">
      You don't seem to have access to this resource. Please check if you are
      using the right account.
    </p>
  </div>
</Modal>

{#if $inviteModalStore.show && $inviteModalStore.data}
  <Modal
    title=""
    type="dark"
    width="560px"
    zIndex={2000}
    isOpen={true}
    handleModalState={() => {
      inviteModalStore.set({ show: false, data: null });
    }}
  >
    <div
      style="display:flex; flex-direction:column; gap:20px; padding:8px 4px;"
    >
      <div style="display:flex; justify-content:center;">
        <div
          style="
            height:56px;
            width:56px;
            border-radius:50%;
            background:rgba(25,160,80,0.15);
            display:flex;
            align-items:center;
            justify-content:center;
          "
        >
          <span style="font-size:28px;">🎉</span>
        </div>
      </div>

      <div style="text-align:center;">
        <h3 style="margin:0; font-weight:600;">Access Granted</h3>
        <p style="margin-top:6px; color:#9B9DA1; font-size:14px;">
          You’ve been added successfully
        </p>
      </div>

      <div
        style="
          background:#1F2430;
          border-radius:10px;
          padding:14px;
        "
      >
        <p class="text-fs-14" style="margin:0;">
          You’re now a
          <b>{$inviteModalStore.data.role}</b>
          in the following workspace(s) under the
          <b>{$inviteModalStore.data.teamName}</b> hub:
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        {#each $inviteModalStore.data.workspaceNames as workspace, index}
          <div
            style="
              display:flex;
              align-items:center;
              gap:10px;
              padding:10px 12px;
              border-radius:8px;
              background:#181C26;
              border:1px solid #2A2F3A;
            "
          >
            <div
              style="
                height:26px;
                width:26px;
                border-radius:6px;
                background:#2A2F3A;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:13px;
              "
            >
              {index + 1}
            </div>
            <span style="font-size:14px;">
              {workspace}
            </span>
          </div>
        {/each}
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top:8px;">
        <button
          class="btn btn-primary"
          style="padding:8px 18px;"
          on:click={() => {
            inviteModalStore.set({ show: false, data: null });
            navigate("/app/home");
          }}
        >
          Continue to App →
        </button>
      </div>
    </div>
  </Modal>
{/if}

<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/app/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/app/" /></Route>
    </section>
    <section slot="guestUser">
      <Route path="/guest/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/guest/" /></Route>
    </section>
    <section slot="unauthorized">
      <Route path="/init" component={EntryPoint} />
      <Route path="/init/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/init" /></Route>
    </section>
  </Authguard>
</Router>

<Toast />
<svelte:window on:keydown={handleShortcuts} on:keyup={handleShortcuts} />

<style>
</style>
