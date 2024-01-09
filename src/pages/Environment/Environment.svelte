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
  const _viewModel = new EnvironmentViewModel();
  const environments = _viewModel.environments;
  const activeEnvironment = _viewModel.activeEnvironment;

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
