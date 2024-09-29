<script>
  import { ArrowSplit, VectorIcon } from "@sparrow/library/icons";
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";

  export let selectedNode;

  export let selectedTab = "response";
</script>

<div
  style="min-width:187px; width:187px; background-color: var(--bg-tertiary-400);  border-radius:2px; "
  class="h-100"
>
  <div class="d-flex align-items-center gap-2 p-1">
    <div
      class="d-flex align-items-center border-radius-4 text-fs-10 mb-0 px-2 method-container text-{getMethodStyle(
        selectedNode?.request?.property?.request?.method,
      )}"
      style="margin-bottom:0px; padding-top:2px; padding-bottom:2px;"
    >
      <span>
        {selectedNode?.request?.property?.request?.method}
      </span>
    </div>

    <p
      class="text-fs-10 mb-0 pb-0 ellipsis pe-3"
      style="color:var(--text-secondary-270); margin-bottom:0px; padding-bottom:0px;"
    >
      {selectedNode?.request?.name}
    </p>
  </div>

  <div style="cursor: pointer;">
    <div
      class="sidebar-buttons m-1 d-flex align-items-center justify-content-start gap-2 px-3 mb-1 {selectedTab ===
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
        color={selectedTab === "response"
          ? "var(--icon-secondary-100)"
          : "var(--text-secondary-200)"}
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
        color={selectedTab === "request"
          ? "var(--icon-secondary-100)"
          : "var(--text-secondary-200)"}
      />
      <p class="mb-0 pb-0 text-fs-10">Request</p>
    </div>
  </div>
</div>

<style>
  .sidebar-buttons {
    color: var(--text-secondary-200);
  }
  .sidebar-buttons:hover {
    /* color: var(--text-secondary-100); */
    background-color: var(--bg-tertiary-630);
  }

  .sidebar-buttons.active {
    color: var(--text-secondary-100);
    background-color: var(--bg-tertiary-630);
  }
  .method-container {
    border: 1px solid var(--border-tertiary-300);
  }
</style>
