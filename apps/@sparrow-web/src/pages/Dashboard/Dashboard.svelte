<script lang="ts">
  import {
    Sidebar,
    LoginBanner,
    LoginSignupConfirmation,
  } from "@sparrow/common/components";
  import { Route, navigate } from "svelte-navigator";
  import Navigate from "../../routing/Navigate.svelte";
  import { DashboardViewModel } from "./Dashboard.ViewModel";
  import { navigationState, user } from "@app/store/auth.store";
  import { Header } from "@sparrow/common/components";
  import { onDestroy, onMount } from "svelte";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import constants from "@app/constants/constants";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import Teams from "../Teams/Teams.svelte";
  import { Modal } from "@sparrow/library/ui";
  import { CreateWorkspace } from "@sparrow/teams/features";
  import { CreateTeam } from "@sparrow/common/features";

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
    // await open(externalSparrowLink);
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
  });

  onDestroy(() => {
    userUnsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
  });

  let showProgressBar = false;

  let isCreateTeamModalOpen: boolean = false;
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
    teamDocuments={$teamDocuments}
    onCreateWorkspace={() => (isWorkspaceModalOpen = true)}
    onSwitchWorkspace={_viewModel.handleSwitchWorkspace}
    onSwitchTeam={_viewModel.handleSwitchTeam}
    {user}
    onLogout={_viewModel.handleLogout}
    isWebApp={true}
    bind:isCreateTeamModalOpen
  />

  <!-- 
    -- Guest Login Banner - shows login option to guest users.
    -->
  <LoginBanner
    isVisible={isLoginBannerActive}
    onClick={handleGuestLogin}
    onClose={handleBannerClose}
  />

  <Modal
    title={"New Team"}
    type={"dark"}
    width={"35%"}
    zIndex={1000}
    isOpen={isCreateTeamModalOpen}
    handleModalState={(flag) => {
      isCreateTeamModalOpen = flag;
    }}
  >
    <CreateTeam
      handleModalState={(flag = false) => {
        isCreateTeamModalOpen = flag;
      }}
      onCreateTeam={_viewModel.createTeam}
    />
  </Modal>

  <!-- 
    -- Application includes collection, environment and help page.
   -->
  <div class="d-flex" style="flex:1; overflow:hidden;">
    <!-- 
      --Sidebar to naviagte between collection, environment and help page.
    -->
    <Sidebar {user} onLogout={_viewModel.handleLogout} type="web" />
    <!-- 
      -- Dashboard renders any of the pages between collection, environment and help.
    -->
    <section style="flex:1; overflow:auto;">
      <!-- Route for Team and workspaces - Home Tab -->
      <Route path="/home/*"><Teams /></Route>

      <!-- Default Route: Navigate to collections -->
      <Route path="/*"><Navigate to="home" /></Route>
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
