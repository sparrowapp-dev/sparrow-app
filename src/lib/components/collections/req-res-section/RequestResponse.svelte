<script lang="ts">
  import type { TabDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Observable } from "rxjs";
  import RequestParam from "./sub-components/request-body-section/RequestParam.svelte";
  import ApiSendRequestPage from "./sub-components/sub-components-header/ApiSendRequestPage.svelte";
  import PageHeader from "./sub-components/sub-components-header/PageHeader.svelte";

  export let activeTab: Observable<TabDocument>;
  export let collectionsMethods: CollectionsMethods;
</script>

<div class="request-response">
  <PageHeader {activeTab} {collectionsMethods} />
  <ApiSendRequestPage {activeTab} {collectionsMethods} />
  <RequestParam {activeTab} {collectionsMethods} />
</div>
