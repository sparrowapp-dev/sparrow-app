<script lang="ts">
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { EnvironmentList, EnvironmentPanel } from "$lib/components";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import { EnvironmentListViewModel } from "$lib/components/environments/environments-list/EnvironmentList.ViewModel";
  import { EnvironmentViewModel } from "./Environment.ViewModel";
  import { EnvironmentPanelViewModel } from "$lib/components/environments/enviroments-panel/EnvironmentPanel.ViewModel";
  import type { Observable } from "rxjs";
  import type { EnvironmentDocument } from "$lib/database/app.database";
  import { onDestroy } from "svelte";
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
    updateEnvironment: _environmentPanelViewModel.updateEnvironment,
  };
  let activeEnvironmentRxDoc: EnvironmentDocument;
  let currentEnvironment: any = {
    id: "",
    name: "",
    variable: [{ variable: "", value: "", checked: true }],
    isActive: true,
  };
  const activeEnvironmentSubscribe = activeEnvironment.subscribe(
    (value: EnvironmentDocument) => {
      if (value) {
        activeEnvironmentRxDoc = value;
        if (activeEnvironmentRxDoc) {
          currentEnvironment.name = activeEnvironmentRxDoc.get("name");
          currentEnvironment.id = activeEnvironmentRxDoc.get("id");
          currentEnvironment.variable = activeEnvironmentRxDoc.get("variable");
          currentEnvironment.isActive = activeEnvironmentRxDoc.get("isActive");
        }
        return;
      }
    },
  );
  onDestroy(() => {
    activeEnvironmentSubscribe.unsubscribe();
  });
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
