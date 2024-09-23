<script>
  import { ArrowSplit, VectorIcon } from "@library/icons";

  export let selectedNode;

  export let selectedTab = "response";
</script>

<div
  style="min-width:187px; width:187px; background-color: var(--bg-tertiary-400);  border-radius:2px; "
  class="h-100"
>
  <div class="d-flex align-items-center gap-2 p-1 ms-1">
    <p
      class="text-fs-10 mb-0 pb-0"
      style="color:var(--text-secondary-270); margin-bottom:0px; padding-bottom:0px;"
    >
      {selectedNode?.request?.property?.request?.method}
    </p>

    <p
      class="text-fs-12 mb-0 pb-0 ellipsis pe-3"
      style="color:var(--text-secondary-270); margin-bottom:0px; padding-bottom:0px;"
    >
      {selectedNode?.request?.name}
    </p>
  </div>

  <div style="cursor: pointer;">
    <div
      class="sidebar-buttons m-1 d-flex align-items-center justify-content-start gap-2 px-3 mb-2 {selectedTab ===
      'response'
        ? 'active'
        : ''}"
      style=" height:25px; border-radius:2px;"
      on:click={() => {
        selectedTab = "response";
      }}
    >
      <ArrowSplit
        height={"10"}
        width={"10"}
        color={"var(--icon-secondary-100)"}
      />
      <p class="mb-0 pb-0 text-fs-10">Response</p>
    </div>
    <div
      class="sidebar-buttons m-1 d-flex align-items-center justify-content-start gap-2 px-3 mb-2 {selectedTab ===
      'request'
        ? 'active'
        : ''} "
      style=" height:25px; border-radius:2px;"
      on:click={() => {
        selectedTab = "request";
      }}
    >
      <VectorIcon
        height={"10"}
        width={"10"}
        color={"var(--icon-secondary-100)"}
      />
      <p class="mb-0 pb-0 text-fs-10">Request</p>
    </div>
  </div>
</div>

<style>
  .sidebar-buttons:hover {
    background-color: var(--bg-tertiary-630);
  }

  .sidebar-buttons.active {
    background-color: var(--bg-tertiary-630);
  }
</style>
