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
  import { onDestroy } from "svelte";
  const _viewModel = new EnvironmentViewModel();
  const environments = _viewModel.environments;
  let activeEnvironment = _viewModel.getactiveEnvironmentTab("");

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
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="environment" use:motion>
    <EnvironmentList
      {environmentRepositoryMethods}
      {environmentServiceMethods}
      currentWorkspace={$activeWorkspace}
      environments={$environments}
      currentEnvironment={$activeEnvironment}
    />
    <EnvironmentPanel
      {environmentRepositoryMethods}
      {environmentServiceMethods}
      currentEnvironment={$activeEnvironment
        ? createDeepCopy($activeEnvironment)
        : $activeEnvironment}
      activeWorkspace={$activeWorkspace}
    />
  </div>
</Motion>

<style>
  .environment {
    display: flex;
    height: calc(100vh - 44px);
    overflow: hidden;
  }
</style>
