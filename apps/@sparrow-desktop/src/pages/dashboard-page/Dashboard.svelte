<script lang="ts">
  import {
    LoginBanner,
    LoginSignupConfirmation,
  } from "@sparrow/common/components";
  import { Sidebar } from "@sparrow/common/features";
  import { Route, navigate } from "svelte-navigator";
  import Navigate from "../../routing/Navigate.svelte";
  import CollectionsPage from "../workspace-page/CollectionsPage.svelte";
  import { DashboardViewModel } from "./Dashboard.ViewModel";
  import { navigationState, user } from "@app/store/auth.store";
  import { Header } from "@sparrow/common/components";
  import { onDestroy, onMount } from "svelte";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import HelpPage from "../help-page/HelpPage.svelte";
  import constants from "@app/constants/constants";
  import { open } from "@tauri-apps/plugin-shell";
  import { Update, check } from "@tauri-apps/plugin-updater";
  import { notifications } from "@sparrow/library/ui";
  import { relaunch } from "@tauri-apps/plugin-process";
  import { Progress } from "@sparrow/library/ui";
  import { Updater } from "@sparrow/common/components";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import Teams from "../teams-page/Teams.svelte";
  import { Modal } from "@sparrow/library/ui";
  import { CreateWorkspace } from "@sparrow/teams/features";

  import { fade } from "svelte/transition";
  import GlobalSearch from "../../../../../packages/@sparrow-common/src/components/popup/global-search/GlobalSearch.svelte";
  import { TeamsViewModel } from "../teams-page/Teams.ViewModel";
  

  import { isGuestUserActive } from "@app/store/auth.store";
  import {
    type SidebarItemBaseInterface,
    SidebarItemPositionBaseEnum,
    SidebarItemIdEnum,
  } from "@sparrow/common/types/sidebar/sidebar-base";


const _viewModel = new DashboardViewModel();
  let userId;
  const userUnsubscribe = user.subscribe(async (value) => {
    if (value) {
      // await _viewModel.refreshTeams(value._id);
      // await _viewModel.refreshWorkspaces(value._id);
      userId = value?._id;
      await _viewModel.refreshTeamsWorkspaces(value._id);
    }
  });
  const environments = _viewModel.environments;
  const activeWorkspace = _viewModel.getActiveWorkspace();
  let workspaceDocuments: Observable<WorkspaceDocument[]>;

  let currentEnvironment = {
    id: "none",
  };

  let externalSparrowLink =
    `${constants.SPARROW_AUTH_URL}` + "/init?source=desktop";
  let isPopupOpen = false;
  let isLoginBannerActive = false;
  let isGuestUser = false;
  let isWorkspaceModalOpen = false;
  let hideGlobalSearch = false;

  const openDefaultBrowser = async () => {
    await open(externalSparrowLink);
  };
  let handlehideGlobalSearch = (val:boolean) => {
    hideGlobalSearch = val;
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
     // Disabling web socket for now due to issues in release_v1 deployment, can be enabled in future if required.
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
  let isGlobalSearchOpen = false;

  const WAIT_TIME_BEFORE_RESTART_IN_SECONDS = 5;

  // Function to handle the click on the search bar
  const handleViewGlobalSearch = () => {
    isGlobalSearchOpen = true;
  };

  // Function to close the GlobalSearch component
  const closeGlobalSearch = () => {
    isGlobalSearchOpen = false;
  };

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
      notifications.error("Update Failed.");
      console.error(e);
    } finally {
      showProgressBar = false;
      updateAvailable = false;
    }
  };


   $: console.log("hide state", hideGlobalSearch);

  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  let sidebarItems: SidebarItemBaseInterface[] = [
    {
      id: SidebarItemIdEnum.HOME,
      route: !isGuestUser ? "/app/home" : "/guest/home",
      heading: "Home",
      disabled: false,
      position: SidebarItemPositionBaseEnum.PRIMARY,
    },
    {
      id: SidebarItemIdEnum.WORKSPACE,
      route: !isGuestUser ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      disabled: false,
      position: SidebarItemPositionBaseEnum.PRIMARY,
    },
    {
      id: SidebarItemIdEnum.COMMUNITY,
      route: "/app/help",
      heading: "Community",
      disabled: !isGuestUser ? false : true,
      position: SidebarItemPositionBaseEnum.SECONDARY,
    },
    {
      id: SidebarItemIdEnum.SETTING,
      route: "/app/setting",
      heading: "Setting",
      disabled: true,
      position: SidebarItemPositionBaseEnum.SECONDARY,
    },
  ];
  // let mahi = { mahiSingh: "mahi" };
</script>


   {#if (isGlobalSearchOpen && (!hideGlobalSearch))}
    <div class="global-search-overlay" transition:fade={{ duration: 300 }}
    on:mousedown|self={closeGlobalSearch} >
      <div
        class="global-search-container"
        transition:fade={{ duration: 300, delay: 150 }}
      >
       <GlobalSearch {closeGlobalSearch} {handlehideGlobalSearch}/>
      </div>
    </div>
 
  {/if}
  <div class="dashboard d-flex flex-column  {isGlobalSearchOpen ? 'blurred' : ''}" style="height: 100vh;"> 

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
    isWebApp={false}
    onLogout={_viewModel.handleLogout}
    isGlobalSearchOpen={isGlobalSearchOpen}
    onSearchClick={handleViewGlobalSearch}
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
    <Progress onClick={() => {}} title="Update in progress" />
  {/if}

  <!-- 
    -- Application includes collection, environment and help page.
   -->
  <div class="d-flex" style="flex:1; overflow:hidden;">
    <!-- 
      --Sidebar to naviagte between collection, environment and help page.
    -->
    <Sidebar
      {user}
      {sidebarItems}
      isVisible={isLoginBannerActive}
      onLogout={_viewModel.handleLogout}
    />
    <!-- 
      -- Dashboard renders any of the pages between collection, environment and help.
    -->
    <section style="flex:1; overflow:hidden;">
      <!-- Route for Collections -->
      <Route path="/collections/*">
        <CollectionsPage />
      </Route>

      <!-- Route for Team and workspaces - Home Tab -->
      <Route path="/home/*"><Teams /></Route>

      <!-- Route for Help -->
      <Route path="/help/*"><HelpPage /></Route>

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

<Modal
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
</Modal>

<style>
    .dashboard {
    transition: filter 300ms ease-out;
  }

  .blurred {
    filter: blur(20px);
    pointer-events: none;
  }

  .global-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 60px;
    z-index: 1000;
  }

  .global-search-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .global-search-content {
    position: relative;
    z-index: 1001;
    filter: none;
    pointer-events: auto;
  }

  .blur-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 10;
  }
</style>
