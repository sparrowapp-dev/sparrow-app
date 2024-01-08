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
  import { onDestroy } from "svelte";
  import { createDeepCopy } from "$lib/utils/helpers/conversion.helper";
  const _viewModel = new EnvironmentViewModel();
  const environments = _viewModel.environments;
  const activeEnvironment = _viewModel.activeEnvironment;
  let activeWorkspaceRxDoc: WorkspaceDocument;
  let trackWorkspaceId: string;

  const environmentRepositoryMethods: EnvironmentRepositoryMethods = {
    createEnvironment: _viewModel.createEnvironment,
    getActiveWorkspace: _viewModel.getActiveWorkspace,
    activateEnvironment: _viewModel.activateEnvironment,
    removeEnvironment: _viewModel.deleteEnvironment,
    updateEnvironment: _viewModel.updateEnvironment,
    refeshEnvironment: _viewModel.refreshEnvironment,
    initActiveEnvironmentToWorkspace:
      _viewModel.initActiveEnvironmentToWorkspace,
  };

  const environmentServiceMethods: EnvironmentServiceMethods = {
    getEnvironments: _viewModel.getServerEnvironments,
    createEnvironment: _viewModel.createServerEnvironment,
    deleteEnvironment: _viewModel.deleteServerEnvironment,
    updateEnvironment: _viewModel.updateServerEnvironment,
  };

  const activeWorkspace: Observable<WorkspaceDocument> =
    environmentRepositoryMethods.getActiveWorkspace();

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        const workspaceId = activeWorkspaceRxDoc.get("_id");
        if (trackWorkspaceId !== workspaceId) {
          const response = await _viewModel.getServerEnvironments(workspaceId);
          if (response.isSuccessful && response.data.data) {
            const environments = response.data.data;
            _viewModel.refreshEnvironment(environments);
          }
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
  <div class="d-flex" use:motion>
    <EnvironmentList
      {environmentRepositoryMethods}
      {environmentServiceMethods}
      currentWorkspace={$activeWorkspace}
      environments={$environments}
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
