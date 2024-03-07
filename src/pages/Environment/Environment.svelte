<script lang="ts">
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { EnvironmentList, EnvironmentPanel } from "$lib/components";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import { EnvironmentViewModel } from "./Environment.ViewModel";
  import type { Observable } from "rxjs";
  import type { WorkspaceDocument } from "$lib/database/app.database";

  import { createDeepCopy } from "$lib/utils/helpers/conversion.helper";
  import { onDestroy, onMount } from "svelte";
  import type { WorkspaceRole } from "$lib/utils/enums/team.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums";
  import {
    environmentLeftPanelWidth,
    environmentRightPanelWidth,
  } from "$lib/store/environment";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  const _viewModel = new EnvironmentViewModel();
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  const environments = _viewModel.environments;
  let activeEnvironment = _viewModel.getactiveEnvironmentTab("");
  onMount(() => {
    MixpanelEvent(Events.ENVIRONMENT_SIDE_PANEL);
  });

  const environmentRepositoryMethods: EnvironmentRepositoryMethods = {
    createEnvironment: _viewModel.createEnvironment,
    getActiveWorkspace: _viewModel.getActiveWorkspace,
    removeEnvironment: _viewModel.deleteEnvironment,
    updateEnvironment: _viewModel.updateEnvironment,
    initActiveEnvironmentToWorkspace:
      _viewModel.initActiveEnvironmentToWorkspace,
    createEnvironmentTab: _viewModel.createEnvironmentTab,
    setEnvironmentTabProperty: _viewModel.setEnvironmentTabProperty,
    deleteEnvironmentTab: _viewModel.deleteEnvironmentTab,
  };

  const environmentServiceMethods: EnvironmentServiceMethods = {
    getEnvironments: _viewModel.getServerEnvironments,
    createEnvironment: _viewModel.createServerEnvironment,
    deleteEnvironment: _viewModel.deleteServerEnvironment,
    updateEnvironment: _viewModel.updateServerEnvironment,
  };
  let trackWorkspaceId;
  const activeWorkspace: Observable<WorkspaceDocument> =
    environmentRepositoryMethods.getActiveWorkspace();

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        const workspaceId = activeWorkspaceRxDoc.get("_id");
        if (trackWorkspaceId !== workspaceId) {
          activeEnvironment = _viewModel.getactiveEnvironmentTab(workspaceId);
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
</script>

<Splitpanes
  class="splitter-sidebar"
  direction="vertical"
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
      {loggedUserRoleInWorkspace}
      {environmentRepositoryMethods}
      {environmentServiceMethods}
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
    <EnvironmentPanel
      {loggedUserRoleInWorkspace}
      {environmentRepositoryMethods}
      {environmentServiceMethods}
      currentEnvironment={$activeEnvironment
        ? createDeepCopy($activeEnvironment)
        : $activeEnvironment}
      activeWorkspace={$activeWorkspace}
    />
  </Pane>
</Splitpanes>

<style>
  :global(.splitpanes) {
    width: calc(100vw - 72px);
  }
</style>
