<script lang="ts">
  import { Sidebar } from "@common/components";
  import { Route } from "svelte-navigator";
  import Navigate from "../../routing/Navigate.svelte";
  import CollectionsPage from "../Collections/CollectionsPage.svelte";
  import { DashboardViewModel } from "./Dashboard.ViewModel";
  import { user } from "$lib/store";
  import Mock from "../Mock/Mock.svelte";
  import Environment from "../EnvironmentPage/EnvironmentPage.svelte";
  import Header from "@common/components/header/Header.svelte";
  import { onDestroy, onMount } from "svelte";
  import type {
    EnvironmentDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import type { Observable } from "rxjs";
  import HelpPage from "../Help/HelpPage.svelte";
  import Ticker from "../../../@common/components/ticker/Ticker.svelte";
  import { Update, check } from "@tauri-apps/plugin-updater";
  import { notifications } from "@library/ui/toast/Toast";
  import { relaunch } from "@tauri-apps/plugin-process";
  import ProgressBar from "@library/ui/progress/Progress.svelte";

  const _viewModel = new DashboardViewModel();
  const userUnsubscribe = user.subscribe(async (value) => {
    if (value) {
      // await _viewModel.refreshTeams(value._id);
      // await _viewModel.refreshWorkspaces(value._id);
      await _viewModel.refreshTeamsWorkspaces(value._id);
    }
  });
  const refreshEnv = _viewModel.refreshEnvironment;
  const environments = _viewModel.environments;
  const activeWorkspace = _viewModel.getActiveWorkspace();

  let currentEnvironment = {
    id: "none",
  };

  let currentWorkspaceId = "";
  let currentWorkspaceName = "";
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currentWorkspaceId = activeWorkspaceRxDoc._id;
        currentWorkspaceName = activeWorkspaceRxDoc.name;
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

  onMount(() => {
    _viewModel.getAllFeatures();
  });

  onDestroy(() => {
    userUnsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
  });

  let tickerVisible = true;
  const hideTicker = () => {
    tickerVisible = false;
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

  const handleUpdatePopUp = (flag: boolean) => {
    updateAvailable = flag;
  };

  const initiateUpdate = async () => {
    console.log("Inside inital update");
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
      console.log("Done with  inital update");
    } catch (e) {
      notifications.error("Update Failed!");
      console.error(e);
    } finally {
      showProgressBar = false;
      updateAvailable = false;
    }
  };
</script>

<div class="dashboard vh-100">
  <!-- Application Header -->
  <!-- <div style="height: 44px;">Header</div> -->
  <Header
    environments={$environments?.filter((element) => {
      return element?.workspaceId === currentWorkspaceId;
    }) || []}
    {currentEnvironment}
    onInitActiveEnvironmentToWorkspace={_viewModel.initActiveEnvironmentToWorkspace}
    {currentWorkspaceId}
    {currentWorkspaceName}
  />
  {#if showProgressBar === true}
  <ProgressBar onClick={handleUpdatePopUp} title="Update in progress" />{/if}
  <Ticker
    show={tickerVisible && updateAvailable}
    {hideTicker}
    onUpdate={initiateUpdate}
  />

  <!-- Application Content -->
  <div class="d-flex">
    <Sidebar {user} onLogout={_viewModel.handleLogout} />
    <section class="w-100">
      <!-- Route for Collections -->
      <Route path="/collections/*">
        <CollectionsPage />
      </Route>

      <!-- Route for Workspaces -->
      <!-- <Route path="/workspaces/*"><Collections /></Route> -->

      <!-- Route for Mock -->
      <Route path="/mock/*"><Mock /></Route>

      <!-- Route for Environment -->
      <Route path="/environment/*"><Environment /></Route>

      <!-- Route for Help -->
      <Route path="/help/*"><HelpPage /></Route>

      <!-- Route for More -->
      <Route path="/more/*">More</Route>

      <!-- Route for Setting -->
      <Route path="/setting/*">Setting</Route>

      <!-- Route for Profile -->
      <Route path="/profile/*">Profile</Route>

      <!-- Default Route: Navigate to workspaces -->
      <Route path="/*"><Navigate to="collections" /></Route>
    </section>
  </div>
</div>
