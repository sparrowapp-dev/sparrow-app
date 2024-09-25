<script lang="ts">
  import {
    Sidebar,
    LoginBanner,
    LoginSignupConfirmation,
  } from "@common/components";
  import { Route, navigate } from "svelte-navigator";
  import Navigate from "../../routing/Navigate.svelte";
  import CollectionsPage from "../Collections/CollectionsPage.svelte";
  import { DashboardViewModel } from "./Dashboard.ViewModel";
  import { navigationState, user } from "$lib/store";
  import Mock from "../Mock/Mock.svelte";
  import Header from "@common/components/header/Header.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import HelpPage from "../Help/HelpPage.svelte";
  import constants from "$lib/utils/constants";
  import { open } from "@tauri-apps/plugin-shell";
  import LoginPopup from "@common/components/popup/login-popup.svelte";
  import { Update, check } from "@tauri-apps/plugin-updater";
  import { notifications } from "@library/ui/toast/Toast";
  import { relaunch } from "@tauri-apps/plugin-process";
  import ProgressBar from "@library/ui/progress/Progress.svelte";
  import Updater from "../../../@common/components/updater/Updater.svelte";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import Teams from "../Teams/Teams.svelte";
  import ModalWrapperV1 from "@library/ui/modal/Modal.svelte";
  import CreateWorkspace from "@teams/features/create-workspace/layout/CreateWorkspace.svelte";
  import { Modal } from "@library/ui";

  const _viewModel = new DashboardViewModel();
  let userId;
  const userUnsubscribe = user.subscribe(async (value) => {
    if (value) {
      // await _viewModel.refreshTeams(value._id);
      // await _viewModel.refreshWorkspaces(value._id);
      userId - value?._id;
      await _viewModel.refreshTeamsWorkspaces(value._id);
    }
  });
  const refreshEnv = _viewModel.refreshEnvironment;
  const environments = _viewModel.environments;
  const activeWorkspace = _viewModel.getActiveWorkspace();
  let workspaceDocuments: Observable<WorkspaceDocument[]>;

  let currentEnvironment = {
    id: "none",
  };

  let externalSparrowLink = `${constants.SPARROW_AUTH_URL}`;
  let isPopupOpen = false;
  let isLoginBannerActive = false;
  let isGuestUser = false;
  let isWorkspaceModalOpen = false;

  const openDefaultBrowser = async () => {
    await open(externalSparrowLink);
  };

  let currentWorkspaceId = "";
  let currentWorkspaceName = "";
  let currentTeamName = "";
  let currentTeamId = "";
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currentWorkspaceId = activeWorkspaceRxDoc._id;
        currentWorkspaceName = activeWorkspaceRxDoc.name;
        currentTeamName = activeWorkspaceRxDoc.team?.teamName;
        currentTeamId = activeWorkspaceRxDoc.team?.teamId;
        refreshEnv(activeWorkspaceRxDoc?._id);
        const envIdInitiatedToWorkspace =
          activeWorkspaceRxDoc.get("environmentId");
        if (envIdInitiatedToWorkspace) {
          currentEnvironment = {
            id: envIdInitiatedToWorkspace,
          };
        } else {
          currentEnvironment = {
            id: "none",
          };
        }
      }
    },
  );

  const onModalStateChanged = (flag: boolean) => {
    isPopupOpen = flag;
  };

  const handleLogin = () => {
    _viewModel.clearLocalDB();
    navigationState.set("guestUser");
    openDefaultBrowser();
    navigate("/init");
    MixpanelEvent(Events.LOCAL_SIGNUP, {
      source: "Dashboard",
    });
  };

  const handleGuestLogin = () => {
    isPopupOpen = true;
  };

  const handleBannerClose = async () => {
    await _viewModel.updateGuestBannerState();
    isLoginBannerActive = false;
  };
  let teamDocuments: Observable<TeamDocument[]>;

  onMount(async () => {
    _viewModel.getAllFeatures();
    const guestUser = await _viewModel.getGuestUser();
    isGuestUser = guestUser?.isGuestUser;
    if (guestUser?.isBannerActive) {
      isLoginBannerActive = guestUser?.isBannerActive;
    }
    workspaceDocuments = await _viewModel.workspaces();
    teamDocuments = await _viewModel.getTeams();
    // await _viewModel.connectWebSocket();
  });

  onDestroy(() => {
    userUnsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
  });

  let updaterVisible = true;
  const hideUpdater = () => {
    updaterVisible = false;
  };

  let showProgressBar = false;
  let updateAvailable = false;
  let newAppVersion: string | undefined = "";
  let updater: Update | null;

  const WAIT_TIME_BEFORE_RESTART_IN_SECONDS = 5;

  onMount(async () => {
    try {
      updater = await check();
      if (updater?.available) {
        notifications.info("Update Available");
        newAppVersion = updater.version;
        updateAvailable = true;
      }
    } catch (error) {
      console.error(error);
    }
  });

  const initiateUpdate = async () => {
    try {
      updateAvailable = false;
      showProgressBar = true;
      if (updater) {
        await updater.downloadAndInstall();
        notifications.success(
          "Update Completed. Application will restart automatically.",
        );
        setTimeout(async () => {
          await relaunch();
        }, WAIT_TIME_BEFORE_RESTART_IN_SECONDS * 1000);
      }
    } catch (e) {
      notifications.error("Update Failed!");
      console.error(e);
    } finally {
      showProgressBar = false;
      updateAvailable = false;
    }
  };
</script>

<div class="dashboard d-flex flex-column" style="height: 100vh;">
  <!-- 
    -- Top Header having app icon and name
  -->
  <Header
    environments={$environments?.filter((element) => {
      return element?.workspaceId === currentWorkspaceId;
    }) || []}
    {currentEnvironment}
    onInitActiveEnvironmentToWorkspace={_viewModel.initActiveEnvironmentToWorkspace}
    {currentWorkspaceId}
    {currentWorkspaceName}
    {currentTeamName}
    {currentTeamId}
    {isGuestUser}
    {isLoginBannerActive}
    onLoginUser={handleGuestLogin}
    workspaceDocuments={$workspaceDocuments}
    onCreateWorkspace={() => (isWorkspaceModalOpen = true)}
    onSwitchWorkspace={_viewModel.handleSwitchWorkspace}
    {user}
    onLogout={_viewModel.handleLogout}
  />

  <!--
    -- App Updater Banner - shows app updater for new version upgrade.
   -->
  {#if isGuestUser !== true}
    <Updater
      show={updaterVisible && updateAvailable}
      {hideUpdater}
      onUpdate={initiateUpdate}
    />
  {/if}

  <!-- 
    -- Guest Login Banner - shows login option to guest users.
    -->
  <LoginBanner
    isVisible={isLoginBannerActive}
    onClick={handleGuestLogin}
    onClose={handleBannerClose}
  />
  {#if showProgressBar === true}
    <ProgressBar onClick={() => {}} title="Update in progress" />
  {/if}

  <!-- 
    -- Application includes collection, environment and help page.
   -->
  <div class="d-flex" style="flex:1; overflow:hidden;">
    <!-- 
      --Sidebar to naviagte between collection, environment and help page.
    -->
    <Sidebar {user} onLogout={_viewModel.handleLogout} />
    <!-- 
      -- Dashboard renders any of the pages between collection, environment and help.
    -->
    <section style="flex:1; overflow:auto;">
      <!-- Route for Collections -->
      <Route path="/collections/*">
        <CollectionsPage />
      </Route>

      <!-- Route for Team and workspaces - Home Tab -->
      <Route path="/home/*"><Teams /></Route>

      <!-- Route for Mock -->
      <Route path="/mock/*"><Mock /></Route>

      <!-- Route for Help -->
      <Route path="/help/*"><HelpPage /></Route>

      <!-- Route for More -->
      <Route path="/more/*">More</Route>

      <!-- Route for Setting -->
      <Route path="/setting/*">Setting</Route>

      <!-- Route for Profile -->
      <Route path="/profile/*">Profile</Route>

      <!-- Default Route: Navigate to collections -->
      <Route path="/*"><Navigate to="collections" /></Route>
    </section>
  </div>
</div>

<Modal
  title={"Confirm SignUp / Login?"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isPopupOpen}
  handleModalState={(flag) => {
    isPopupOpen = flag;
  }}
>
  <LoginSignupConfirmation {handleLogin} bind:isPopupOpen />
</Modal>

<ModalWrapperV1
  title={"New Workspace"}
  type={"primary"}
  width={"35%"}
  zIndex={1000}
  isOpen={isWorkspaceModalOpen}
  handleModalState={(flag) => {
    isWorkspaceModalOpen = flag;
  }}
>
  <CreateWorkspace
    teamDocuments={$teamDocuments}
    {userId}
    handleModalState={(flag = false) => {
      isWorkspaceModalOpen = flag;
    }}
    onCreateWorkspace={_viewModel.handleCreateWorkspace}
  />
</ModalWrapperV1>
