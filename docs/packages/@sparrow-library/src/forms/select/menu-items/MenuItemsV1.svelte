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
</style>
