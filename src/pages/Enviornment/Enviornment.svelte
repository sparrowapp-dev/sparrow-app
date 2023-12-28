<script lang="ts">
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { EnvironmentList, EnvironmentPanel } from "$lib/components";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import { EnvironmentListViewModel } from "$lib/components/enviornments/environments-list/EnvironmentList.ViewModel";
  import { EnvironmentViewModel } from "./Environment.ViewModel";
  import { EnvironmentPanelViewModel } from "$lib/components/enviornments/enviroments-panel/EnvironmentPanel.ViewModel";
  import type { Observable } from "rxjs";
  import type { EnvironmentDocument } from "$lib/database/app.database";
  const _viewModel = new EnvironmentViewModel();
  const _environmentListViewModel = new EnvironmentListViewModel();
  const _environmentPanelViewModel = new EnvironmentPanelViewModel();
  const activeEnvironment: Observable<EnvironmentDocument> =
    _viewModel.activeEnvironment;
  const environmentRepositoryMethods: EnvironmentRepositoryMethods = {
    bulkInsert: _environmentListViewModel.bulkInsert,
    addEnvironment: _viewModel.addEnvironment,
    getActiveWorkspace: _viewModel.getActiveWorkspace,
    getEnvironmentDocument: _environmentListViewModel.getEnvironmentDocument,
    updateEnvironment: _viewModel.updateEnvironment,
    getParticularEnvironment:
      _environmentPanelViewModel.getParticularEnvironment,
  };
  const environmentServiceMethods: EnvironmentServiceMethods = {
    getAllEnvironments: _environmentListViewModel.getAllEnvironments,
    getEnvironment: _environmentPanelViewModel.getEnvironment,
  };
  let currentEnvironment: any = {};
  const activeEnvironmentSubscribe = activeEnvironment.subscribe(
    (value: EnvironmentDocument) => {
      console.log("value: ", value);
      if (value) {
        currentEnvironment = value;
        return value;
      }
    },
  );
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="d-flex" use:motion>
    <EnvironmentList
      {environmentRepositoryMethods}
      {environmentServiceMethods}
      {currentEnvironment}
    />
    <EnvironmentPanel
      {environmentRepositoryMethods}
      {environmentServiceMethods}
      {currentEnvironment}
    />
  </div>
</Motion>
