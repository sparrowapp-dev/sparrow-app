<script lang="ts">
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { EnvironmentList, EnvironmentPanel } from "$lib/components";
  import type {
    EnvironmentRepositoryMethods,
    EnvironmentServiceMethods,
  } from "$lib/utils/interfaces/environment.interface";
  import { createDeepCopy } from "$lib/utils/helpers/conversion.helper";
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
    removeEnvironment: _environmentListViewModel.removeEnvironment,
  };
  const environmentServiceMethods: EnvironmentServiceMethods = {
    getAllEnvironments: _environmentListViewModel.getAllEnvironments,
    getEnvironment: _environmentPanelViewModel.getEnvironment,
    updateEnvironment: _environmentPanelViewModel.updateEnvironment,
    deleteEnvironment: _environmentListViewModel.deleteEnvironment,
  };
  let activeEnvironmentRxDoc: EnvironmentDocument;
  let currentEnvironment: any = {
    id: "",
    name: "",
    type: "",
    variable: [{ key: "", value: "", checked: true }],
    isActive: true,
  };
  let environmentChanged = {
    name: false,
    variable: false,
  };
  const activeEnvironmentSubscribe = activeEnvironment.subscribe(
    (value: EnvironmentDocument) => {
      if (value) {
        activeEnvironmentRxDoc = value;
        if (activeEnvironmentRxDoc) {
          currentEnvironment.name = activeEnvironmentRxDoc.get("name");
          currentEnvironment.id = activeEnvironmentRxDoc.get("id");
          currentEnvironment.variable =
            activeEnvironmentRxDoc.get("variable").length > 0
              ? createDeepCopy(activeEnvironmentRxDoc.get("variable"))
              : [{ key: "", value: "", checked: true }];
          currentEnvironment.isActive = activeEnvironmentRxDoc.get("isActive");
          currentEnvironment.type = activeEnvironmentRxDoc.get("type");
          environmentChanged = {
            name: false,
            variable: false,
          };
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
      {environmentChanged}
    />
  </div>
</Motion>
