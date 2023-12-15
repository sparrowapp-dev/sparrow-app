<script lang="ts">
  export let api: any;
  export let data: any;
  export let collectionList;

  console.log(api);
  console.log(collectionList);

  let apiClass = "api-yellow";
  if (api?.property?.request?.method === "DEL") apiClass = "red-api";
  if (api?.property?.request?.method === "GET") apiClass = "green-api";
  if (api?.property?.request?.method === "POST") apiClass = "yellow-api";
  if (api?.property?.request?.method === "PUT") apiClass = "blue-api";
  if (api?.property?.request?.method === "ARC") apiClass = "grey-api";
</script>

<div class="d-flex flex-start pb-2" style=" overflow: auto;">
  <div
    class="api-type rounded d-flex align-items-center justify-content-center"
  >
    <span class={apiClass}>{api?.property?.request?.method}</span>
  </div>
  <div class="api-desc" style="font-size: 12px;">
    <p class="mb-0 api-type__title text-whiteColor">{api.name}</p>
    <div class="d-flex">
      {#if $data}
        {#each $data.slice().reverse() as list}
          {#if list}
            {#if list?._id === api?.path?.workspaceId}
              <p class="mb-0 api-type__endpoint">
                {list.name}
              </p>
            {/if}
          {/if}
        {/each}
      {/if}
      <p class="mb-0 api-type__endpoint">:</p>

      {#if api?.path?.collectionId}
        <p class="mb-0 api-type__endpoint">/</p>
      {/if}

      {#if collectionList}
        {#each collectionList.slice().reverse() as list}
          {#if list}
            {#if list?.id === api?.path?.collectionId}
              <p class="mb-0 api-type__endpoint">{list.name}</p>
              {#if api.path.folderId}
                <p class="mb-0 api-type__endpoint">/</p>
              {/if}

              {#each list.items as item}
                {#if list.items && item}
                  {#if item.id === api.path.folderId}
                    <p class="mb-0 api-type__endpoint">{item.name}</p>
                  {/if}
                {/if}
              {/each}
            {/if}
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .api-type {
    height: 34px;
    width: 56px;
    border: 1px solid #313233;
    margin-right: 5px;
    font-size: 12px;
  }
  .api-type span {
    font-weight: 500;
  }
  .api-desc {
    width: calc(100% - 61px);
  }
  .api-type__title {
    font-size: 12px;
    font-weight: 400;
  }
  .api-type__endpoint {
    font-family: Roboto Mono;
    font-size: 12px;
    font-weight: 400;
    color: var(--recentApiText);
  }
  .api-type__title,
  .api-type__endpoint {
    white-space: nowrap;
    overflow: hidden;
    /* text-overflow: ellipsis; */
  }
  .red-api {
    color: #ff7878;
  }
  .green-api {
    color: #69d696;
  }
  .yellow-api {
    color: #ffe47e;
  }
  .blue-api {
    color: #9685ff;
  }
  .grey-api {
    color: #8a9299;
  }
</style>
