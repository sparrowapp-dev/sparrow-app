<script lang="ts">
  import {
    HubPaymentFailed,
    LoginBanner,
    LoginSignupConfirmation,
    PlanUpgradeModal,
    SwitchWorkspace,
    UpgradePlanBanner,
    UpgradePlanPopUp,
    UpgradeCurrentTeamPlanModal,
  } from "@sparrow/common/components";
  import { Sidebar } from "@sparrow/common/features";
  import { Route, navigate, useLocation } from "svelte-navigator";
  import Navigate from "../../routing/Navigate.svelte";
  import CollectionsPage from "../workspace-page/CollectionsPage.svelte";
  import { DashboardViewModel } from "./Dashboard.ViewModel";
  import { navigationState, user } from "@app/store/auth.store";
  import { Header } from "@sparrow/common/components";
  import { onDestroy, onMount } from "svelte";
  import type {
    CollectionDocument,
    TeamDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import type { Observable } from "rxjs";
  import HelpPage from "../help-page/HelpPage.svelte";
  import constants from "@app/constants/constants";
  import { open } from "@tauri-apps/plugin-shell";
  import { Update, check } from "@tauri-apps/plugin-updater";
  import { Button, notifications } from "@sparrow/library/ui";
  import { relaunch } from "@tauri-apps/plugin-process";
  import { Progress } from "@sparrow/library/ui";
  import { Updater } from "@sparrow/common/components";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import Teams from "../teams-page/Teams.svelte";
  import { Modal } from "@sparrow/library/ui";
  import { CreateWorkspace } from "@sparrow/teams/features";
  import { OSDetector } from "@sparrow/common/utils";

  import { fade } from "svelte/transition";
  import { isGuestUserActive } from "@app/store/auth.store";
  import {
    type SidebarItemBaseInterface,
    SidebarItemPositionBaseEnum,
    SidebarItemIdEnum,
  } from "@sparrow/common/types/sidebar/sidebar-base";
  import { GlobalSearch } from "@sparrow/common/features";
  import * as Sentry from "@sentry/svelte";
  import MarketplacePage from "../marketplace-page/MarketplacePage.svelte";
  import { ResponseMessage, TeamRole } from "@sparrow/common/enums";
  import { planInfoByRole } from "@sparrow/common/utils";
  import {
    isSubscriptionOverDue,
    isSubscriptionOverTeamId,
    planBannerisOpen,
    shouldRunThrottled,
  } from "@sparrow/common/store";
  import {
    addCollectionItem,
    isExpandCollection,
    isExpandEnvironment,
    isExpandTestflow,
  } from "@sparrow/workspaces/stores";
  import { getSelfhostUrls } from "@app/utils/jwt";
  import { get } from "svelte/store";
  import { NotificationService } from "@app/services/notification.service";
  import { highlightTeam, highlightWorkspace } from "@sparrow/common/store";

  const _viewModel = new DashboardViewModel();
  const notificationService = new NotificationService();
  const osDetector = new OSDetector();
  const location = useLocation();
  let userId: string;
  const userUnsubscribe = user.subscribe(async (value) => {
    if (value) {
      userId = value?._id;
      if (userId && shouldRunThrottled(userId)) {
        await Promise.all([
          _viewModel.refreshTeams(userId),
          _viewModel.refreshWorkspaces(userId),
        ]);
        await notificationService.loadNotificationsToStore();
      } else {
        console.error(`Throttled for ${userId}`);
      }
    }
  });
  const environments = _viewModel.environments;
  const activeWorkspace = _viewModel.getActiveWorkspace();
  let workspaceDocuments: Observable<WorkspaceDocument[]>;
  let collectionDocuments: Observable<CollectionDocument[]>;
  let recentVisitedWorkspaces: Observable<RecentWorkspaceDocument[]> =
    _viewModel.recentVisitedWorkspaces;

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
  let isSwitchWorkspaceModalOpen = false;
  let switchWorkspaceName = "";
  let switchRequestName = "";
  let switchWorkspaceId = "";
  let upgradePlanModalWorkspace: boolean = false;
  let planContent: any;
  let userRole: string = "";
  let userLimits: any;
  let teamDetails: {};
  let isUpgradePlanModelOpen: boolean = false;
  let currentWorkspacePlan = "";
  let isUpgradeCurrentTeamPlanModalOpen: boolean = false;
  let notificationPollingInterval: any;

  const openDefaultBrowser = async () => {
    await open(externalSparrowLink);
  };
  let handlehideGlobalSearch = (val: boolean) => {
    hideGlobalSearch = val;
  };

  const handleSwitchWorkspaceModal = (
    _workspaceName: string,
    _requestName: string,
    _workspaceId: string,
  ) => {
    isSwitchWorkspaceModalOpen = true;
    switchWorkspaceName = _workspaceName;
    switchRequestName = _requestName;
    switchWorkspaceId = _workspaceId;
  };

  const handleLimits = async (currentTeamId: string) => {
    const data = await _viewModel.userPlanLimits(currentTeamId);
    userLimits = data;
  };

  const handlegetWorkspaceCount = async (teamId: string) => {
    currentWorkspaceCount = await _viewModel.getWorkspaceCount(teamId);
  };

  const activeTeam: Observable<TeamDocument> = _viewModel.openTeam;

  let currentWorkspaceId = "";
  let currentWorkspaceName = "";
  let currentTeamName = "";
  let currentTeamId = "";
  let currentWorkspaceType = "";
  let selectedType = "";
  let currentWorkspaceCount = 1;
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currentWorkspaceId = activeWorkspaceRxDoc._id;
        currentWorkspaceName = activeWorkspaceRxDoc.name;
        currentTeamName = activeWorkspaceRxDoc.team?.teamName;
        currentTeamId = activeWorkspaceRxDoc.team?.teamId;
        currentWorkspaceType = activeWorkspaceRxDoc?.workspaceType;
        if (currentTeamId) {
          currentWorkspacePlan = await _viewModel.getTeamPlan(currentTeamId);
        }

        const user = activeWorkspaceRxDoc?._data.users.find(
          (u) => u.id === userId,
        );
        userRole = user?.role || "";
        const OwnerDetails = activeWorkspaceRxDoc?._data.users[0];
        teamDetails = {
          teamId: OwnerDetails?.id,
          teamName: OwnerDetails?.name,
          teamEmail: OwnerDetails?.email,
        };
        handlegetWorkspaceCount(currentTeamId);
        handleLimits(currentTeamId);
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

  let openTeam;
  let currentPlan = "";

  const activeTeamSubscriber = activeTeam.subscribe((value) => {
    if (value) {
      openTeam = value?.toMutableJSON();
    }
    currentPlan = openTeam?.plan?.name;
  });

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

  const decidingKey = (event) => {
    if (osDetector.getOS() == "macos") {
      if (event.metaKey) return true;
      else return false;
    } else {
      if (event.ctrlKey) return true;
      else return false;
    }
  };

  const handleGlobalKeyPress = (event, setGlobalSearch, setSelectedType) => {
    if (isGlobalSearchOpen && event.key === "Escape") {
      event.preventDefault();
      setGlobalSearch(false);
      return;
    }

    // Check if the user is inside the response body viewer's CodeMirror editor
    const isInResponseEditor =
      event.target?.closest('[data-response-body-editor="true"] .cm-editor') !==
      null;

    if (
      decidingKey(event) &&
      event.key.toLowerCase() === "f" &&
      !event.shiftKey
    ) {
      // Don't open global search if user is in the response body editor
      if (isInResponseEditor) {
        return;
      }
      event.preventDefault();
      setGlobalSearch(true);
    } else if (decidingKey(event) && event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case "w":
          if (!isGuestUser) {
            event.preventDefault();
            setGlobalSearch(true);
            setSelectedType("workspaces");
          }
          break;
        case "a":
          event.preventDefault();
          setGlobalSearch(true);
          setSelectedType("requests");
          break;
        case "c":
          event.preventDefault();
          setGlobalSearch(true);
          setSelectedType("collections");
          break;
        case "e":
          event.preventDefault();
          setGlobalSearch(true);
          setSelectedType("environments");
          break;
        case "f":
          event.preventDefault();
          setGlobalSearch(true);
          setSelectedType("folders");
          break;
        case "t":
          event.preventDefault();
          setGlobalSearch(true);
          setSelectedType("flows");
          break;
        default:
          break;
      }
    }
  };

  const setGlobalSearch = (value) => {
    isGlobalSearchOpen = value;
  };

  const setSelectedType = (value) => {
    selectedType = value;
  };

  onMount(async () => {
    window.addEventListener("keydown", (event) => {
      handleGlobalKeyPress(event, setGlobalSearch, setSelectedType);
    });
    _viewModel.getAllFeatures();
    const guestUser = await _viewModel.getGuestUser();
    isGuestUser = guestUser?.isGuestUser;
    if (guestUser?.isBannerActive) {
      isLoginBannerActive = guestUser?.isBannerActive;
    }

    // Connect websocket for guest users also for AI testing tab -> (while rest api chatbot will be disabled from UI)
    await _viewModel.connectWebSocket();

    workspaceDocuments = await _viewModel.workspaces();
    teamDocuments = await _viewModel.getTeams();
    collectionDocuments = await _viewModel.getCollectionList();

    // Disabling web socket for now due to issues in release_v1 deployment, can be enabled in future if required.
    // await _viewModel.connectWebSocket();
    // load notifications immediately
    await notificationService.loadNotificationsToStore();
    notificationPollingInterval = setInterval(
      () => {
        notificationService.loadNotificationsToStore();
      },
      5 * 60 * 1000,
    );
  });

  onDestroy(() => {
    userUnsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
    activeTeamSubscriber.unsubscribe();
    if (notificationPollingInterval) {
      clearInterval(notificationPollingInterval);
    }
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
  let isSubscriptionOverDueOpen: boolean = false;

  const WAIT_TIME_BEFORE_RESTART_IN_SECONDS = 5;

  const handleViewGlobalSearch = () => {
    isGlobalSearchOpen = true;
  };

  const closeGlobalSearch = () => {
    isGlobalSearchOpen = false;
    selectedType = "";
  };

  onMount(async () => {
    try {
      updater = await check();
      if (updater?.available) {
        // notifications.warning("Update Available");
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
      Sentry.captureException(e);
      notifications.error("Update Failed.");
      console.error(e);
    } finally {
      showProgressBar = false;
      updateAvailable = false;
    }
  };

  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  const [isSelfhost] = getSelfhostUrls();

  let sidebarItems: SidebarItemBaseInterface[] = [
    {
      id: SidebarItemIdEnum.HOME,
      route: "home",
      heading: "Home",
      disabled: false,
      position: SidebarItemPositionBaseEnum.PRIMARY,
    },
    {
      id: SidebarItemIdEnum.WORKSPACE,
      route: "collections",
      heading: "Workspace",
      disabled: false,
      position: SidebarItemPositionBaseEnum.PRIMARY,
    },
    {
      id: SidebarItemIdEnum.MARKETPLACE,
      route: "marketplace",
      heading: "Marketplace",
      disabled: !isGuestUser ? false : true,
      position: SidebarItemPositionBaseEnum.PRIMARY,
    },
    {
      id: SidebarItemIdEnum.COMMUNITY,
      route: "help",
      heading: "Community",
      disabled: !isGuestUser && !isSelfhost ? false : true,
      position: SidebarItemPositionBaseEnum.SECONDARY,
    },
    {
      id: SidebarItemIdEnum.SETTING,
      route: "setting",
      heading: "Setting",
      disabled: true,
      position: SidebarItemPositionBaseEnum.SECONDARY,
    },
  ];
  let isDestroyOnGlobalSearch = false;

  const handleWorkspaceSwitch = async () => {
    isDestroyOnGlobalSearch = true;
    await _viewModel.activateWorkspace(switchWorkspaceId);
    handlehideGlobalSearch(false);
    isSwitchWorkspaceModalOpen = false;
    isGlobalSearchOpen = false;
    isDestroyOnGlobalSearch = false;
    navigate("collections");
  };

  const handleGlobalSearchRequestNavigation = async (
    apiId: string,
    workspaceId: string,
    collectionId: string,
    folderId: string,
    tree: any,
  ) => {
    try {
      const isActiveWorkspace =
        await _viewModel.checkActiveWorkspace(workspaceId);
      const workspaceData = await _viewModel.getWorkspaceById(workspaceId);
      if (!isActiveWorkspace) {
        handlehideGlobalSearch(true);
        handleSwitchWorkspaceModal(workspaceData.name, "Request", workspaceId);
      }
      await _viewModel.setOpenTeam(workspaceData.toMutableJSON().team?.teamId);
      await _viewModel.switchAndCreateRequestTab(
        workspaceId,
        collectionId,
        folderId,
        tree,
      );
      isExpandCollection.set(true);
      addCollectionItem(collectionId, "collection");
      addCollectionItem(folderId, "folder");
      if (isActiveWorkspace) {
        navigate("collections");
      }

      closeGlobalSearch();
      handlehideGlobalSearch(false);
    } catch (error) {
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    }
  };

  const handleGlobalSearchCollectionNavigation = async (
    workspaceId: string,
    collection: any,
  ) => {
    try {
      const isActiveWorkspace =
        await _viewModel.checkActiveWorkspace(workspaceId);
      const workspaceData = await _viewModel.getWorkspaceById(workspaceId);
      if (!isActiveWorkspace) {
        handlehideGlobalSearch(true);
        handleSwitchWorkspaceModal(
          workspaceData.name,
          "Collection",
          workspaceId,
        );
      }
      await _viewModel.setOpenTeam(workspaceData.toMutableJSON().team?.teamId);
      await _viewModel.switchAndCreateCollectionTab(workspaceId, collection);
      isExpandCollection.set(true);
      addCollectionItem(collection.id, "collection");
      if (isActiveWorkspace) {
        navigate("collections");
      }
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    } catch (error) {
      closeGlobalSearch();
      handlehideGlobalSearch(false);
      console.error("Error opening collection:", error);
      notifications.error("Failed to open collection.");
    }
  };

  const handleGlobalSearchFolderNavigation = async (
    workspaceId: string,
    collectionId: any,
    folder: any,
  ) => {
    try {
      const isActiveWorkspace =
        await _viewModel.checkActiveWorkspace(workspaceId);
      const workspaceData = await _viewModel.getWorkspaceById(workspaceId);
      if (!isActiveWorkspace) {
        handlehideGlobalSearch(true);
        handleSwitchWorkspaceModal(workspaceData.name, "Folder", workspaceId);
      }
      await _viewModel.setOpenTeam(workspaceData.toMutableJSON().team?.teamId);
      await _viewModel.switchAndCreateFolderTab(
        workspaceId,
        collectionId,
        folder,
      );
      isExpandCollection.set(true);
      addCollectionItem(collectionId, "collection");
      addCollectionItem(folder.id, "folder");
      if (isActiveWorkspace) {
        navigate("collections");
      }
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    } catch (error) {
      closeGlobalSearch();
      handlehideGlobalSearch(false);
      console.error("Error opening folder:", error);
      notifications.error("Failed to open folder.");
    }
  };

  const handleGlobalSearchWorkspaceNavigation = async (workspace: any) => {
    try {
      const isActiveWorkspace = await _viewModel.checkActiveWorkspace(
        workspace._id,
      );
      if (!isActiveWorkspace) {
        await _viewModel.activateWorkspace(workspace._id);
        closeGlobalSearch();
        handlehideGlobalSearch(false);
      }
      _viewModel.switchAndCreateWorkspaceTab(workspace);
      const workspaceData = await _viewModel.getWorkspaceById(workspace?._id);
      await _viewModel.setOpenTeam(workspaceData.toMutableJSON().team?.teamId);
      navigate("collections");
      // Additional workspace opening logic here if needed
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    } catch (error) {
      closeGlobalSearch();
      handlehideGlobalSearch(false);
      console.error("Error opening workspace:", error);
      notifications.error("Failed to open workspace.");
    }
  };

  const handleGlobalSearchEnvironmentNavigation = async (environment: any) => {
    try {
      const isActiveWorkspace = await _viewModel.checkActiveWorkspace(
        environment.workspace,
      );
      const workspaceData = await _viewModel.getWorkspaceById(
        environment.workspace,
      );
      if (!isActiveWorkspace) {
        handlehideGlobalSearch(true);
        handleSwitchWorkspaceModal(
          workspaceData.name,
          "Environment",
          environment.workspace,
        );
      }
      await _viewModel.setOpenTeam(workspaceData.toMutableJSON().team?.teamId);
      await _viewModel.switchAndCreateEnvironmentTab(environment);
      isExpandEnvironment.set(true);
      if (isActiveWorkspace) {
        navigate("collections");
      }
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    } catch (error) {
      closeGlobalSearch();
      handlehideGlobalSearch(false);
      console.error("Error opening environment:", error);
      notifications.error("Failed to open environment.");
    }
  };

  const handleGlobalSearchTestflowNavgation = async (testflow: any) => {
    try {
      const isActiveWorkspace = await _viewModel.checkActiveWorkspace(
        testflow.workspaceId,
      );
      const workspaceData = await _viewModel.getWorkspaceById(
        testflow.workspaceId,
      );
      if (!isActiveWorkspace) {
        handlehideGlobalSearch(true);
        handleSwitchWorkspaceModal(
          workspaceData.name,
          "Testflow",
          testflow.workspaceId,
        );
      }
      await _viewModel.setOpenTeam(workspaceData.toMutableJSON().team?.teamId);
      await _viewModel.switchAndCreateTestflowTab(testflow);
      isExpandTestflow.set(true);
      if (isActiveWorkspace) {
        navigate("collections");
      }
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    } catch (error) {
      console.error("Error opening testflow:", error);
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    }
  };

  const openUpdateDocs = async () => {
    if (osDetector.getOS() === "linux") {
      await open(constants.LINUX_INSTALL_DOCS);
      return;
    }
  };
  const handleCreateWorkspace = async (
    workspaceName: string,
    teamId: string,
  ) => {
    const response = await _viewModel.handleCreateWorkspace(
      workspaceName,
      teamId,
    );
    const limits = await _viewModel.userPlanLimits(teamId);
    userLimits?.workspacesPerHub?.value;
    userLimits = limits;
    handlegetWorkspaceCount(teamId);
    if (response?.message === ResponseMessage.PLAN_LIMIT_MESSAGE) {
      isWorkspaceModalOpen = false;
      upgradePlanModalWorkspace = true;
    }
    return response;
  };

  const handleRequestOwner = async () => {
    await _viewModel.requestToUpgradePlan(currentTeamId);
    upgradePlanModalWorkspace = true;
  };

  const handleRedirectToAdminPanel = async () => {
    await _viewModel.handleRedirectToAdminPanel(currentTeamId);
    upgradePlanModalWorkspace = true;
  };
  const handleOpenAdminPanel = async () => {
    await _viewModel.handleRedirectToAdminPanel(currentTeamId);
    isUpgradeCurrentTeamPlanModalOpen = false;
  };

  const handleRedirectToAdmin = async () => {
    await _viewModel.handleRedirectToAdminPanel(openTeam?.teamId);
    planBannerisOpen.set(false);
    isUpgradePlanModelOpen = false;
  };

  // Header upgrade click handler function
  const handleHeaderUpgradeClick = () => {
    if (userRole) {
      planContent = planInfoByRole(userRole);
    }
    upgradePlanModalWorkspace = true;
  };

  async function handleAcceptInvite(e) {
    try {
      const payload = e.detail;

      await notificationService.respondToInvite(
        payload.notificationId,
        "accept",
      );

      await notificationService.loadNotificationsToStore();

      await _viewModel.refreshTeams(userId);
      await _viewModel.refreshWorkspaces(userId);
      await _viewModel.setOpenTeam(payload.teamId);

      if (payload.role === "admin") {
        highlightTeam(payload.teamId);

        const allWorkspaces = await _viewModel.getWorkspacesByTeamId(
          payload.teamId,
        );

        allWorkspaces.forEach((ws) => {
          highlightWorkspace(ws._id);
        });
      } else {
        highlightTeam(payload.teamId);

        payload.workspaceIds?.forEach((id) => {
          highlightWorkspace(id);
        });
      }

      let message = "";

      if (payload.role === "admin") {
        message = `You are now an admin in ${payload.teamName} hub.`;
      } else {
        const workspaceText =
          payload.workspaceNames.length > 1
            ? `${payload.workspaceNames.join(", ")} workspaces`
            : `${payload.workspaceNames[0]} workspace`;

        message = `You are now a ${payload.role} in ${workspaceText}.`;
      }

      notifications.success(message);

      navigate("/app/home");
      window.dispatchEvent(new CustomEvent("closeNotifications"));
    } catch (err) {
      console.error(err);
      notifications.error("Failed to accept invite");
    }
  }

  async function handleDeclineInvite(e) {
    try {
      const payload = e.detail;

      await notificationService.respondToInvite(
        payload.notificationId,
        "reject",
      );

      await notificationService.loadNotificationsToStore();

      await _viewModel.refreshTeams(userId);
      await _viewModel.refreshWorkspaces(userId);

      let message = "";

      if (payload.role === "admin") {
        message = `You declined the invite to join ${payload.teamName} hub.`;
      } else {
        const workspaceText =
          payload.workspaceNames.length > 1
            ? `${payload.workspaceNames.join(", ")} workspaces`
            : `${payload.workspaceNames[0]} workspace`;

        message = `You declined the invite to join ${workspaceText}.`;
      }

      notifications.error(message);
    } catch (err) {
      console.error(err);
      notifications.error("Failed to reject invite");
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();

      await notificationService.loadNotificationsToStore();

      notifications.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark all read failed", err);
      notifications.error("Failed to mark all as read");
    }
  }

  async function handleOpenInvite(e) {
    const notification = e.detail;

    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        await notificationService.loadNotificationsToStore();
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  }

  async function handleClearAllNotifications(e) {
    try {
      await notificationService.clearAllNotifications(e.detail);
      notifications.success("All notifications cleared");
    } catch (err) {
      console.error(err);
      notifications.error("Failed to clear notifications");
    }
  }

  async function handleArchiveNotification(e) {
    try {
      const notification = e.detail;

      await notificationService.archiveNotification(notification._id);
      await notificationService.loadNotificationsToStore();

      // notifications.success("Notification archived");
    } catch (err) {
      console.error(err);
      notifications.error("Failed to archive notification");
    }
  }

  $: {
    if (userRole) {
      planContent = planInfoByRole(userRole);
    }
  }

  $: {
    if (
      $isSubscriptionOverDue &&
      (userRole === TeamRole.TEAM_ADMIN || TeamRole.TEAM_OWNER)
    ) {
      isSubscriptionOverDueOpen = true;
    }
  }
</script>

{#if isGlobalSearchOpen && !hideGlobalSearch}
  <div
    class="global-search-overlay"
    style=" background: var(--background-hover);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);"
    transition:fade={{ duration: 200 }}
    on:mousedown|self={closeGlobalSearch}
  >
    <div
      class="global-search-container"
      transition:fade={{ duration: 200, delay: 50 }}
    >
      <GlobalSearch
        {isGuestUser}
        isWebApp={false}
        {handleSwitchWorkspaceModal}
        {closeGlobalSearch}
        {handlehideGlobalSearch}
        workspaceDocuments={$workspaceDocuments}
        checkActiveWorkspace={_viewModel.checkActiveWorkspace}
        {handleGlobalSearchRequestNavigation}
        {handleGlobalSearchCollectionNavigation}
        {handleGlobalSearchFolderNavigation}
        {handleGlobalSearchWorkspaceNavigation}
        {handleGlobalSearchEnvironmentNavigation}
        {handleGlobalSearchTestflowNavgation}
        {selectedType}
        handleSearchNode={(...args) => _viewModel.searchNode(...args)}
      />
    </div>
  </div>
{/if}
<div class="dashboard d-flex flex-column" style="height: 100vh;">
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
    {currentWorkspaceType}
    {currentPlan}
    {userRole}
    {currentWorkspacePlan}
    {isGuestUser}
    {isLoginBannerActive}
    onLoginUser={handleGuestLogin}
    workspaceDocuments={$workspaceDocuments}
    onCreateWorkspace={() => (isWorkspaceModalOpen = true)}
    onSwitchWorkspace={_viewModel.handleSwitchWorkspace}
    {user}
    isWebApp={false}
    bind:isUpgradeCurrentTeamPlanModalOpen
    onLogout={_viewModel.handleLogout}
    {isGlobalSearchOpen}
    onSearchClick={handleViewGlobalSearch}
    onUpgradeClick={handleHeaderUpgradeClick}
    handleDocsRedirect={_viewModel.redirectDocs}
    handleFeaturesRedirect={_viewModel.redirectFeatureUpdates}
    onAdminRedirect={_viewModel.onAdminRedirect}
    recentVisitedWorkspaces={$recentVisitedWorkspaces}
    on:acceptInvite={handleAcceptInvite}
    on:declineInvite={handleDeclineInvite}
    on:markAllRead={handleMarkAllRead}
    on:openInvite={handleOpenInvite}
    on:clearAllNotifications={handleClearAllNotifications}
    on:archiveNotification={handleArchiveNotification}
  />

  <!--
    -- App Updater Banner - shows app updater for new version upgrade.
   -->
  {#if isGuestUser !== true}
    <Updater
      show={updaterVisible && updateAvailable}
      {hideUpdater}
      onUpdate={initiateUpdate}
      updateDoc={openUpdateDocs}
    />
  {/if}

  {#if $location.pathname === "/app/home"}
    {#if openTeam?.owner === userId || openTeam?.admins?.includes(userId)}
      {#if openTeam?.billing?.status === "payment_failed" || openTeam?.billing?.status === "action_required"}
        <HubPaymentFailed
          onFix={async () => {
            await _viewModel.handleRedirectToAdminPanel(openTeam?.teamId);
          }}
        />
      {:else if openTeam?.plan?.name === "Community"}
        <UpgradePlanBanner bind:isUpgradePlanModelOpen />
      {/if}
    {/if}
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
      {isGuestUser}
    />
    <!-- 
      -- Dashboard renders any of the pages between collection, environment and help.
    -->
    <section style="flex:1; overflow:hidden;">
      <!-- Route for Collections -->
      <Route path="/collections/*">
        {#if !isDestroyOnGlobalSearch}
          <CollectionsPage />
        {/if}
      </Route>

      <!-- Route for Team and workspaces - Home Tab -->
      <Route path="/home/*"><Teams /></Route>

      <Route path="/marketplace/*">
        <MarketplacePage />
      </Route>

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
    onCreateWorkspace={handleCreateWorkspace}
  />
</Modal>

<Modal
  title={"Confirm Workspace Switch?"}
  type={"primary"}
  width={"35%"}
  zIndex={1000}
  isOpen={isSwitchWorkspaceModalOpen}
  handleModalState={(flag) => {
    isSwitchWorkspaceModalOpen = flag;
  }}
>
  <SwitchWorkspace
    bind:isSwitchWorkspaceModalOpen
    workspaceName={switchWorkspaceName}
    requestName={switchRequestName}
    handleSwitch={handleWorkspaceSwitch}
    {handlehideGlobalSearch}
  />
</Modal>

<Modal
  title={"Time to Unlock More Features"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isUpgradePlanModelOpen}
  handleModalState={(flag) => {
    isUpgradePlanModelOpen = flag;
    planBannerisOpen.set(false);
  }}
>
  <UpgradePlanPopUp
    bind:isUpgradePlanModelOpen
    handleSubmit={handleRedirectToAdmin}
  />
</Modal>

<Modal
  title={"Your Subscription is Overdue"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isSubscriptionOverDueOpen}
  handleModalState={(flag) => {
    isSubscriptionOverDueOpen = flag;
  }}
>
  <div class="d-flex flex-column">
    <p class="text-subscription-overdue" style="margin: 0 0 16px 0;">
      We were unable to process the payment for your {currentPlan} for the {currentTeamName}
      Hub.
    </p>

    <p class="text-subscription-overdue" style="margin: 0 0 16px 0;">
      Access for you and your team has been temporarily restricted. To restore
      full access immediately, please update your payment method.
    </p>
    <div class="d-flex justify-content-end gap-2">
      <!-- Close button -->
      <Button
        title="Access Other Hubs"
        type="secondary"
        size="medium"
        onClick={() => (isSubscriptionOverDueOpen = false)}
      />
      <!-- Proceed button -->
      <Button
        title="Restore Hub Access"
        type="primary"
        size="medium"
        onClick={async () => {
          const teamId = get(isSubscriptionOverTeamId);
          await _viewModel.handleRedirectToAdminPanel(teamId);
          isSubscriptionOverDueOpen = false;
        }}
      />
    </div>
  </div>
</Modal>

<Modal
  title={"Time to Unlock More Features"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isUpgradeCurrentTeamPlanModalOpen}
  handleModalState={(flag) => {
    isUpgradeCurrentTeamPlanModalOpen = flag;
  }}
>
  <UpgradeCurrentTeamPlanModal
    bind:isUpgradeCurrentTeamPlanModalOpen
    handleSubmit={handleOpenAdminPanel}
  />
</Modal>

<PlanUpgradeModal
  bind:isOpen={upgradePlanModalWorkspace}
  title={planContent?.title}
  description={planContent?.description}
  planType="Workspaces"
  planLimitValue={userLimits?.workspacesPerHub?.value}
  currentPlanValue={currentWorkspaceCount}
  isOwner={userRole === TeamRole.TEAM_OWNER || userRole === TeamRole.TEAM_ADMIN
    ? true
    : false}
  handleContactSales={_viewModel.handleContactSales}
  handleSubmitButton={userRole === TeamRole.TEAM_OWNER ||
  userRole === TeamRole.TEAM_ADMIN
    ? handleRedirectToAdminPanel
    : handleRequestOwner}
  userName={teamDetails?.teamName || ""}
  userEmail={teamDetails?.teamEmail || ""}
  submitButtonName={planContent?.buttonName}
/>

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
</style>
