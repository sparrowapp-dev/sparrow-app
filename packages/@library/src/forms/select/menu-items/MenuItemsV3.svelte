<script lang="ts">
  export let list: {
    name: string;
    id: string;
    color?:
      | "primary"
      | "danger"
      | "dark"
      | "light"
      | "success"
      | "warning"
      | "secondary"
      | "patch";
    description?: string;
    default?: boolean;
    hide?: boolean;
    logo?: string;
  };
  export let selectedRequest: {
    id: string;
  };
  export let tickIcon: string;
  export let getTextColor: (color: string) => {};

  let isMenuItemHover = false;
</script>

<div
  class="d-flex px-2 py-2 justify-content-between highlight rounded"
  on:mouseenter={() => {
    isMenuItemHover = true;
  }}
  on:mouseleave={() => {
    isMenuItemHover = false;
  }}
>
  <div class="d-flex">
    <div
      class="img-logo-container me-2 overflow-hidden w-10"
      style="min-width: 20px;"
    >
      {#if list.logo == "" || list.logo == undefined}
        <div
          class={`m-0 text-defaultColor me-2 text-center align-items-center justify-content-center bg-transparent border-defaultColor`}
          style={`font-size: 15px; padding-top: 2px; width: 20px !important; height: 20px !important; display: flex; border: 1px solid #45494D; border-radius: 50%;`}
        >
          {list.name[0] ? list.name[0].toUpperCase() : ""}
        </div>
      {:else}
        <img class="w-100" src={list.logo} alt="sparrow-dropdown-img" />
      {/if}
    </div>
    <p
      class="m-0 p-0 {getTextColor(list?.color)} ellipsis {isMenuItemHover &&
      !list?.color
        ? 'highlight-menu-item'
        : ''}"
      style="font-size: 12px;"
    >
      {list.name}<br />
      {#if list.description}
        <small class="text-textColor">{list.description}</small>
      {/if}
    </p>
  </div>
  {#if selectedRequest?.id === list.id}
    <img src={tickIcon} alt="" />
  {/if}
</div>

<style>
  .highlight:hover {
    background-color: var(--dull-background-color);
  }
  .highlight-menu-item {
    color: var(--send-button) !important;
  }
  .highlight {
    cursor: pointer;
  }
  .img-logo-container {
    width: 20px !important;
    height: 20px !important;
  }
</style>
