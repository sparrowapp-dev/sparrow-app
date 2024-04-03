<script lang="ts">
  import type {
    EnvironmentDocument,
    TabDocument,
  } from "$lib/database/app.database";
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
  export let currentWorkspace;
</script>

<div class="d-flex">
  <div class="request-response w-100">
    <PageHeader
      {activeTab}
      collectionsMethods={{
        getActiveWorkspace: collectionsMethods.getActiveWorkspace,
        getCollectionList: collectionsMethods.getCollectionList,
        readRequestOrFolderInCollection:
          collectionsMethods.readRequestOrFolderInCollection,
        readRequestInFolder: collectionsMethods.readRequestInFolder,
        addRequestOrFolderInCollection:
          collectionsMethods.addRequestOrFolderInCollection,
        addRequestInFolder: collectionsMethods.addRequestInFolder,
        updateTab: collectionsMethods.updateTab,
        updateRequestOrFolderInCollection:
          collectionsMethods.updateRequestOrFolderInCollection,
        updateRequestInFolder: collectionsMethods.updateRequestInFolder,
        setRequestSave: collectionsMethods.setRequestSave,
        handleCreateTab: collectionsMethods.handleCreateTab,
        addCollection: collectionsMethods.addCollection,
        collection: collectionsMethods.collection,
        deleteApiRequest: collectionsMethods.deleteApiRequest,
      }}
      {loggedUserRoleInWorkspace}
      {currentWorkspace}
    />
    <ApiSendRequestPage
      {activeTab}
      collectionsMethods={{
        getActiveWorkspace: collectionsMethods.getActiveWorkspace,
        updateRequestProperty: collectionsMethods.updateRequestProperty,
        getGlobalEnvironment: collectionsMethods.getGlobalEnvironment,
        currentEnvironment: collectionsMethods.currentEnvironment,
        updateEnvironment: collectionsMethods.updateEnvironment,
        updateRequestState: collectionsMethods.updateRequestState,
      }}
      {environmentVariables}
    />
    <RequestParam {activeTab} {collectionsMethods} {environmentVariables} />
  </div>
  <div>
    <SidebarRight
      {activeTab}
      {collectionsMethods}
      {loggedUserRoleInWorkspace}
    />
  </div>
</div>

<style>
</style>
