<script lang="ts">
    import { getPathFromUrl, replaceSlashWithGreaterThanSymbol } from "$lib/utils/helpers/common.helper";

  export let name: string;
  export let method: string;
    export let path : string = "";
  export let searchData: string = "";
  export let getIndex;
  let apiClass = "red-api";
  if (method === "DELETE") apiClass = "red-api";
  else if (method === "GET") apiClass = "green-api";
  else if (method === "POST") apiClass = "yellow-api";
  else if (method === "PUT") apiClass = "blue-api";
  else if (method === "ARC") apiClass = "grey-api";
</script>

<div
  class="d-flex align-items-center api-request"
  style="height: {path !== '' ? '40px' : '32px'};"
>
  <div class="api-method {apiClass}">
    {method.toUpperCase()}
  </div>
  <div class="api-name">
    <div>
      <p class="mb-0" style="color:#999999">
        {name.substring(0, getIndex(name, searchData))}
        <span class="highlight"
          >{name.substring(
            getIndex(name, searchData),
            getIndex(name, searchData) + searchData.length,
          )}</span
        >{name.substring(getIndex(name, searchData) + searchData.length)}
      </p>
    </div>
    {#if path !== ""}
      <div>
        <p class="mb-0" style="font-size:10px;">{replaceSlashWithGreaterThanSymbol(path)}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .red-api {
    color: var(--request-delete);
  }
  .green-api {
    color: var(--request-get);
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
  }
  .api-name p{
    font-size: 12px;
    font-weight: 400;
  }
  .highlight {
    color: var(--white-color);
  }
  .api-request{
    width:328px;
    height:60px;
    padding: 4px 12px 4px 12px;

  }
  .api-request:hover{
    background-color:var(--border-color);
  }
</style>
