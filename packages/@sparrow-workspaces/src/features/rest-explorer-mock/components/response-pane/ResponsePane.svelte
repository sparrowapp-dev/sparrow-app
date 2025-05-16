<script lang="ts">
  // TODO: Change location for default page component
  import { RequestDataType, ResponseFormatter } from "@sparrow/common/enums";
  import type { Response } from "@sparrow/common/interfaces/request.interface";

  export let response: Response | undefined = undefined;
  class ResponseParamTab {
    tabName: string = "";
    parametersCount?: number = 0;
  }

  let tabs: ResponseParamTab[] = [
    { tabName: "Body" },
    { tabName: "Headers", parametersCount: 0 },
  ];

  let activeTab = tabs[0].tabName; // Set the first tab as the active tab by default
</script>

{#if response == undefined}
  <!-- <DefaultPage /> -->
{/if}

{#if response != undefined}
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
  {#if activeTab === "Body"}
    <!-- Render Body content -->
    <!-- <CodeMirrorResponse
      rawValue={response.body}
      rawTab={RequestDataType.JSON}
      formatter={ResponseFormatter.PRETTY}
      currentTabId=""
    /> -->
  {:else if activeTab === "Headers"}
    <!-- Render Headers content -->
    <!-- <TabularInput
      rows={response.headers.map((header, index) => ({
        id: index.toString(),
        Key: header.key,
        Value: header.value,
      }))}
      class="w-100"
      columns={["Key", "Value"]}
    /> -->
  {/if}
{/if}
