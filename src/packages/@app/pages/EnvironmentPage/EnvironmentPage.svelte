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
  // onMount(() => {
  //   splitter = document.querySelector(
  //     ".splitter-sidebar .splitpanes__splitter",
  //   );
  //   splitter.style.width = "2px";
  // });

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
  class="environment-splitter"
  style="width: calc(100vw - 54px);"
  on:resize={(e) => {
    environmentLeftPanelWidth.set(e.detail[0].size);
    environmentRightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane
    minSize={20}
    size={$environmentLeftPanelWidth}
    class="bg-secondary-900-important"
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
    minSize={60}
    size={$environmentRightPanelWidth}
    class="bg-secondary-800-important"
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
  :global(.environment-splitter .splitpanes__splitter) {
    width: 10.5px !important;
    height: 100% !important;
    background-color: var(--bg-secondary-500) !important;
    border-left: 5px solid var(--border-secondary-900) !important;
    border-right: 5px solid var(--border-secondary-800) !important;
    border-top: 0 !important;
    border-bottom: 0 !important;
  }
  :global(
      .environment-splitter .splitpanes__splitter:active,
      .environment-splitter .splitpanes__splitter:hover
    ) {
    background-color: var(--bg-primary-200) !important;
  }
</style>
