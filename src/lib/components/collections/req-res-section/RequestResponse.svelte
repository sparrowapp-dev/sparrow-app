<script lang="ts">
  import type { TabDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Observable } from "rxjs";
  import RequestParam from "./sub-components/request-body-section/RequestParam.svelte";
  import ApiSendRequestPage from "./sub-components/sub-components-header/ApiSendRequestPage.svelte";
  import PageHeader from "./sub-components/sub-components-header/PageHeader.svelte";
  import SidebarRight from "./SidebarRight.svelte";
  import type { WorkspaceRole } from "$lib/utils/enums";
  export let activeTab: Observable<TabDocument>;
  export let collectionsMethods: CollectionsMethods;
  export let environmentVariables;
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  export let _collectionListViewModel;
</script>

<div class="d-flex">
  <div class="request-response w-100">
    <PageHeader
      {activeTab}
      {collectionsMethods}
      {loggedUserRoleInWorkspace}
      {_collectionListViewModel}
    />
    <ApiSendRequestPage
      {activeTab}
      {collectionsMethods}
      {environmentVariables}
    />
    <RequestParam {activeTab} {collectionsMethods} {environmentVariables} />
  </div>
  <div>
    <SidebarRight
      {activeTab}
      {collectionsMethods}
      {loggedUserRoleInWorkspace}
      {_collectionListViewModel}
    />
  </div>
</div>

<style>
</style>
