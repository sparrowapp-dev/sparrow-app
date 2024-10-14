<script lang="ts">
  // import CodeMirror from "@sparrow/library/forms/editor/Editor.svelte";

  class RequestParamTab {
    tabName: string = "";
    parametersCount?: number = 0;
  }

  let tabs: RequestParamTab[] = [
    { tabName: "Headers", parametersCount: 0 },
    { tabName: "Parameters", parametersCount: 0 },
    { tabName: "Body" },
  ];

  let activeTab = tabs[0].tabName; // Set the first tab as the active tab by default

  // Headers
  // let headers: TableRow[] = [
  //   { id: "1", Key: "Accept", Value: "*/*" },
  //   { id: "2", Key: "Connection", Value: "keep-alive" },
  //   { id: "3", Key: "", Value: "" },
  // ];

  // // Parameters
  // let parameters: TableRow[] = [
  //   { id: "1", Key: "name", Value: "John Doe" },
  //   { id: "2", Key: "", Value: "" },
  // ];
</script>

<div class="py-2 px-3">
  <!-- Tabs -->
  <div class="d-flex mb-3">
    {#each tabs as tab, index (tab)}
      <button
        class="me-2 request-tab {tab.tabName === activeTab ? 'tab-active' : ''}"
        role="tab"
        on:click={() => (activeTab = tab.tabName)}
      >
        <span class="">{tab.tabName}</span>
        {#if tab.parametersCount !== undefined && tab.parametersCount > 0}
          <span class="text-labelColor">({tab.parametersCount})</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Routes according to tabs -->
  {#if activeTab === "Headers"}
    <!-- Render Headers content -->
    <!-- <TabularInput
      bind:rows={headers}
      class="w-100"
      columns={["Key", "Value"]}
    /> -->
  {:else if activeTab === "Parameters"}
    <!-- Render Parameters content -->
    <!-- <TabularInput
      bind:rows={parameters}
      class="w-100"
      columns={["Key", "Value"]}
    /> -->
  {:else if activeTab === "Body"}
    <!-- Render Body content -->
    <!-- TODO: add support for request body -->
  {/if}
</div>

<style>
  .request-tab {
    font-size: 12px;
    font-weight: 500;
    background: transparent;
    border: none;
  }
  .tab-active {
    color: white;
    border-bottom: 3px solid var(--send-button);
  }
  .request-tab:hover {
    cursor: pointer;
  }
</style>
