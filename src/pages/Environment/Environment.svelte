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
  import type { WorkspaceDocument } from "$lib/database/app.database";
  import { onDestroy } from "svelte";
  const _viewModel = new EnvironmentViewModel();
  const _environmentListViewModel = new EnvironmentListViewModel();
  const _environmentPanelViewModel = new EnvironmentPanelViewModel();
  let activeWorkspaceRxDoc: WorkspaceDocument;
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
  const activeWorkspace: Observable<WorkspaceDocument> =
    environmentRepositoryMethods.getActiveWorkspace();
  let currentEnvironment: any = {
    id: "",
    name: "",
    type: "",
    variable: [{ key: "", value: "", checked: true }],
    isActive: true,
  };

  let currentWorkspace: any = {
    id: "",
    name: "",
    currentEnvironmentId: "",
  };

  let environmentChanged = {
    name: false,
    variable: false,
  };
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currentWorkspace.name = activeWorkspaceRxDoc.get("name");
        currentWorkspace.id = activeWorkspaceRxDoc.get("_id");
        currentWorkspace.currentEnvironmentId = activeWorkspaceRxDoc.get(
          "currentEnvironmentId",
        );
        const workspaceId = activeWorkspaceRxDoc.get("_id");
        const response =
          await environmentServiceMethods.getAllEnvironments(workspaceId);
        let data = await _viewModel.currentEnvironment(
          currentWorkspace.currentEnvironmentId,
        );
        currentEnvironment.id = data?.get("id");
        currentEnvironment.name = data?.get("name");
        currentEnvironment.type = data?.get("type");
        currentEnvironment.isActive = data?.get("isActive");
        currentEnvironment.variable = data?.get("variable");
        if (response.isSuccessful && response.data.data) {
          const environments = response.data.data;
          environmentRepositoryMethods.bulkInsert(environments);
          return;
        }

        // debugger;
      }
    },
  );

  // const currEnvironmentSubscribe = currEnvironment.subscribe(
  //   (value: EnvironmentDocument) => {
  //     if (value) {
  //       currEnvironmentRxDoc = value;
  //       if (currEnvironmentRxDoc) {
  //         currentEnvironment.name = currEnvironmentRxDoc.get("name");
  //         currentEnvironment.id = currEnvironmentRxDoc.get("id");
  //         currentEnvironment.variable =
  //           activeEnvironmentRxDoc.get("variable").length > 0
  //             ? createDeepCopy(currEnvironmentRxDoc.get("variable"))
  //             : [{ key: "", value: "", checked: true }];
  //         currentEnvironment.isActive = currEnvironmentRxDoc.get("isActive");
  //         currentEnvironment.type = currEnvironmentRxDoc.get("type");
  //         environmentChanged = {
  //           name: false,
  //           variable: false,
  //         };
  //       }
  //       return;
  //     }
  //   },
  // );
  // const activeEnvironmentSubscribe = activeEnvironment.subscribe(
  //   (value: EnvironmentDocument) => {
  //     if (value) {
  //       activeEnvironmentRxDoc = value;
  //       if (activeEnvironmentRxDoc) {
  //         currentEnvironment.name = activeEnvironmentRxDoc.get("name");
  //         currentEnvironment.id = activeEnvironmentRxDoc.get("id");
  //         currentEnvironment.variable =
  //           activeEnvironmentRxDoc.get("variable").length > 0
  //             ? createDeepCopy(activeEnvironmentRxDoc.get("variable"))
  //             : [{ key: "", value: "", checked: true }];
  //         currentEnvironment.isActive = activeEnvironmentRxDoc.get("isActive");
  //         currentEnvironment.type = activeEnvironmentRxDoc.get("type");
  //         environmentChanged = {
  //           name: false,
  //           variable: false,
  //         };
  //       }
  //       return;
  //     }
  //   },
  // );
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="d-flex" use:motion>
    <EnvironmentList
      {environmentRepositoryMethods}
      {environmentServiceMethods}
      {currentEnvironment}
      {currentWorkspace}
    />
    <EnvironmentPanel
      {environmentRepositoryMethods}
      {environmentServiceMethods}
      {currentEnvironment}
      {currentWorkspace}
      {environmentChanged}
    />
  </div>
</Motion>
