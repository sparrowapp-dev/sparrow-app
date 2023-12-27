<script lang="ts">
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { EnvironmentList, EnvironmentPanel } from "$lib/components";
  import type { EnvironmentMethods } from "$lib/utils/interfaces/environment.interface";
  import { EnvironmentListViewModel } from "$lib/components/enviornments/enviornments-list/EnvironmentList.ViewModel";
  import { EnvironmentViewModel } from "./Environment.ViewModel";
  const _viewModel = new EnvironmentViewModel();
  const _environmentListViewModel = new EnvironmentListViewModel();
  const environmentMethods: EnvironmentMethods = {
    getAllEnvironments: _environmentListViewModel.getAllEnvironments,
    bulkInsert: _environmentListViewModel.bulkInsert,
    getActiveWorkspace: _viewModel.getActiveWorkspace,
  };
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="d-flex" use:motion>
    <EnvironmentList {environmentMethods} />
    <EnvironmentPanel />
  </div>
</Motion>
