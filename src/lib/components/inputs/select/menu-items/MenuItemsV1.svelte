<script lang="ts">
  export let list: {
    name: string;
    id: string;
    color: "primary" | "danger" | "dark" | "light";
    description: string;
    hide: boolean;
  };
  export let selectedRequest: {
    id: string;
  };
  export let checkIcon: string;
  export let getTextColor: (color: string) => {};
</script>

<div class="d-flex px-2 py-2 justify-content-between highlight rounded">
  <p
    class="m-0 p-0 {getTextColor(list?.color)} ellipsis"
    style="font-size: 12px;"
    class:selected-request={list.id === selectedRequest?.id}
  >
    {list.name}<br />
    {#if list.description}
      <small class="text-textColor">{list.description}</small>
    {/if}
  </p>
  {#if selectedRequest?.id === list.id}
    <img src={checkIcon} alt="" />
  {/if}
</div>

<style>
  .highlight:hover {
    background-color: var(--dull-background-color);
  }
  .highlight:hover p {
    color: var(--send-button) !important;
  }
  .highlight {
    cursor: pointer;
  }
</style>
