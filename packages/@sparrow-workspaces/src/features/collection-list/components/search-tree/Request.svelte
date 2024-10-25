<script lang="ts">
  import { replaceSlashWithGreaterThanSymbol } from "@sparrow/common/utils/common.helper";
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";
  export let explorer: any;
  export let workspaceId: string;
  export let onItemOpened: (entityType: string, args: any) => void;
  export let searchData: string = "";
  export let getIndex: (text: string, searchData: string) => number;
  export let folderDetails: { id: string; name: string };
  export let request: any;
</script>

<button
  class="d-flex align-items-center api-request p-1 bg-transparent border-0"
  style="height: {explorer.path !== '' ? '40px' : '32px'}; text-align: left;"
  on:click={() => {
    onItemOpened("request", {
      workspaceId: workspaceId,
      collection: {
        id: explorer.collectionId,
      },
      folder: folderDetails,
      request,
    });
  }}
>
  <div class="api-method text-{getMethodStyle(request.request.method)}">
    {request.request.method.toUpperCase()}
  </div>
  <div class="api-name" style="width:80%;">
    <div>
      <p class="mb-0 ellipsis" style="color:#999999;">
        {request.name.substring(0, getIndex(request.name, searchData))}<span
          class="highlight"
          >{request.name.substring(
            getIndex(request.name, searchData),
            getIndex(request.name, searchData) + searchData.length,
          )}</span
        >{request.name.substring(
          getIndex(request.name, searchData) + searchData.length,
        )}
      </p>
    </div>
    {#if explorer.path !== ""}
      <div style="width: 100%;">
        <p class="mb-0 ellipsis" style="font-size:10px;width:100%">
          {replaceSlashWithGreaterThanSymbol(explorer.path)}
        </p>
      </div>
    {/if}
  </div>
</button>

<style>
  .red-api {
    color: var(--request-delete);
  }
  .green-api {
    color: var(--icon-success-100);
  }
  .yellow-api {
    color: var(--request-post);
  }
  .blue-api {
    color: var(--request-put);
  }
  .grey-api {
    color: var(--request-arc);
  }
  .api-method {
    font-size: 12px;
    font-weight: 500;
    margin-right: 8px;
    text-align: left;
    width: 40px;
  }
  .api-name p {
    font-size: 12px;
    font-weight: 400;
  }
  .highlight {
    color: var(--white-color);
  }
  .api-request {
    width: 100%;
    height: 60px;
  }
</style>
