<script lang="ts">
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { EnvironmentList } from "@environments/features";
  import { EnvironmentViewModel } from "./EnvironmentPage.ViewModel";
  import type { Observable } from "rxjs";
  import type { WorkspaceDocument } from "$lib/database/app.database";
  import { onDestroy, onMount } from "svelte";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums";
  import {
    environmentLeftPanelWidth,
    environmentRightPanelWidth,
  } from "$lib/store/environment";
  import { user, userWorkspaceLevelRole } from "$lib/store";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import EnvironmentExplorerPage from "../EnvironmentExplorer/EnvironmentExplorerPage.svelte";
  import { Route } from "svelte-navigator";

  const _viewModel = new EnvironmentViewModel();
  // export let loggedUserRoleInWorkspace: WorkspaceRole;
  const environments = _viewModel.environments;
  let activeEnvironment = _viewModel.getactiveEnvironmentTab("");
  onMount(() => {
    MixpanelEvent(Events.ENVIRONMENT_SIDE_PANEL);
  });

  let trackWorkspaceId;
  let isEnvLoading = false;
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.getActiveWorkspace();

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        value._data.users.forEach((user) => {
          if (user.id === $user._id) {
            userWorkspaceLevelRole.set(user.role);
          }
        });
        const workspaceId = activeWorkspaceRxDoc.get("_id");
        if (trackWorkspaceId !== workspaceId) {
          isEnvLoading = true;
          activeEnvironment = _viewModel.getactiveEnvironmentTab(workspaceId);
          await _viewModel.refreshEnvironment(workspaceId);
          isEnvLoading = false;
        }
        trackWorkspaceId = workspaceId;
      }
    },
  );

  let splitter;
  onMount(() => {
    splitter = document.querySelector(
      ".splitter-sidebar .splitpanes__splitter",
    );
    splitter.style.width = "1px";
  });

  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });

  // Rerender animation on tab switch
  let isAnimation = true;
  let prevTabId: string = "";
  activeEnvironment.subscribe((value) => {
    if (value) {
      if (prevTabId !== value.environmentId) {
        isAnimation = false;
        setTimeout(() => {
          isAnimation = true;
        }, 10);
      }
      prevTabId = value.environmentId;
    }
  });
</script>

<Splitpanes
  class="splitter-sidebar"
  on:resize={(e) => {
    environmentLeftPanelWidth.set(e.detail[0].size);
    environmentRightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane
    class="sidebar-left-panel"
    minSize={20}
    size={$environmentLeftPanelWidth}
  >
    <EnvironmentList
      loggedUserRoleInWorkspace={$userWorkspaceLevelRole}
      onCreateEnvironment={_viewModel.onCreateEnvironment}
      onOpenGlobalEnvironment={_viewModel.onOpenGlobalEnvironment}
      onDeleteEnvironment={_viewModel.onDeleteEnvironment}
      onUpdateEnvironment={_viewModel.onUpdateEnvironment}
      onOpenEnvironment={_viewModel.onOpenEnvironment}
      onSelectEnvironment={_viewModel.onSelectEnvironment}
      currentWorkspace={$activeWorkspace}
      environments={$environments}
      currentEnvironment={$activeEnvironment}
    />
  </Pane>
  <Pane
    class="sidebar-right-panel"
    minSize={60}
    size={$environmentRightPanelWidth}
  >
    <Route>
      {#if isAnimation}
        {#if $activeEnvironment}
          <Motion {...scaleMotionProps} let:motion>
            <div use:motion>
              <EnvironmentExplorerPage tab={$activeEnvironment} />
            </div>
          </Motion>
        {/if}
      {/if}
    </Route>
  </Pane>
</Splitpanes>

<style>
  :global(.splitter-sidebar.splitpanes) {
    width: calc(100vw - 72px);
  }
</style>
