<script lang="ts">
  import commetIcon from "$lib/assets/comment-fill.svg";
  import codeIcon from "$lib/assets/code.svg";
  import bookIcon from "$lib/assets/book.svg";
  import { currentTab, tabs } from "$lib/store/request-response-section";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import WorkspaceSidebar from "$lib/components/workspace/workspaceSidebar.svelte";
    let tabList = [];
    let currentTabId:string;
    let selectedTab:Partial<NewTab>={}
  const tabsUnsubscribe = tabs.subscribe((value) => {
    tabList = value;
  });

  const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      currentTabId = value.id;
      if (currentTabId && tabList) {
        selectedTab=tabList.filter((tab:NewTab)=>{
          return tab.id===currentTabId
        })[0]
      }
    }else{
      selectedTab={};
    }
  });
</script>

{#if selectedTab.type === ItemType.WORKSPACE}
<WorkspaceSidebar></WorkspaceSidebar>
{:else}
<div class="sidebar-right bg-backgroundColor">
  <div class="d-flex flex-column">
    <button class="bg-backgroundColor border-0 mb-4 mt-3">
      <img src={commetIcon} alt="" />
    </button>
    <button class="bg-backgroundColor border-0 mb-4">
      <img src={bookIcon} alt="" />
    </button>
    <button class="bg-backgroundColor border-0">
      <img src={codeIcon} alt="" />
    </button>
  </div>
</div>
{/if}
<style>
  .sidebar-right {
    width: 32px;
    border-left: 1px solid var(--border-color);
    height: calc(100vh - 80px);
  }
</style>
