<script lang="ts">
  import type { TabDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Observable } from "rxjs";
  import RequestParam from "./sub-components/request-body-section/RequestParam.svelte";
  import ApiSendRequestPage from "./sub-components/sub-components-header/ApiSendRequestPage.svelte";
  import PageHeader from "./sub-components/sub-components-header/PageHeader.svelte";
    import SidebarRight from "./SidebarRight.svelte";

  export let activeTab: Observable<TabDocument>;
  export let collectionsMethods: CollectionsMethods;
</script>

<div class="d-flex">
  <div class="request-response w-100">
    <PageHeader {activeTab} {collectionsMethods} />
    <ApiSendRequestPage {activeTab} {collectionsMethods} />
    <RequestParam {activeTab} {collectionsMethods} />
  </div>
  <div> 
    <SidebarRight {activeTab} {collectionsMethods} />
  </div>

</div>

<style>
</style>
