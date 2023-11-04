<script>
  import crossIcon from "$lib/assets/cross.svg";
  export let tab;
  export let updateCurrentTab;
  export let handleTabRemove;
  export let tabWidth;
  export let currentTabId;
  export let index;
  export let method;
</script>

<div
  class="d-inline-block position-relative pt-1"
  on:click={() => {
    updateCurrentTab({id : tab.id});
  }}
  style="width: {tabWidth}px; height:35px; margin-left:{index === 0
    ? '10px'
    : ''}"
>
  <div
    class="w-100 d-flex justify-content-between ps-2 border-upper-radius"
    style="margin-left: -3px; background-color: {currentTabId === tab.id
      ? 'var(--background-color)'
      : 'transparent'}"
  >
    <button
      class="position-relative border-0"
      style="    width: 80%;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden; text-align: left; background-color:transparent;"
    >
      <span
        class={method === "GET"
          ? "green-api"
          : method === "DEL"
          ? "red-api"
          : method === "PUT"
          ? "blue-api"
          : method === "TRAC"
          ? "orange-api"
          : method === "HEAD"
          ? "light-green-api"
          : method === "CON"
          ? "navy-green-api"
          : method === "PATC"
          ? "purple-api"
          : method === "OPT"
          ? "pink-api"
          : method === "POST"
          ? "yellow-api"
          : ""}
        style="font-size: 12px; height: 31px; ">{tab.method}</span
      >
      <span
        class="text-muted font-weight-normal"
        style="font-size: 12px; font-family: Roboto; color: #8A9299;"
      >
        {tab.name}
      </span>
      {#if !tab.save}
        <span
          class="position-absolute"
          style="right:0; top:6px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
        />
      {/if}
    </button>

    <button
      class="btn border-0 d-flex align-items-center"
      on:click={() => {
        handleTabRemove(tab.id);
      }}
      style="overflow:hidden; height:31px;"
    >
      <img src={crossIcon} alt="cross" />
    </button>
  </div>
  {#if currentTabId !== tab.id}
    <div
      class="position-absolute"
      style="height:23px; width: 0.5px; background-color: grey; top:7px; right: 0;"
    />
  {/if}
</div>

<style>
  .border-upper-radius {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: hidden;
  }
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
  .orange-api {
    color: var(--request-trac);
  }
  .light-green-api {
    color: var(--request-head);
  }
  .navy-green-api {
    color: var(--request-con);
  }
  .purple-api {
    color: var(--request-patc);
  }
  .pink-api {
    color: var(--request-opt);
  }
</style>
