<script lang="ts">
  import plusIcon from "$lib/assets/actionicon-normal.svg";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import angleRight from "$lib/assets/angle-right.svg";
  import {
    collapsibleState,
    isApiCreatedFirstTime,
    tabs,
  } from "$lib/store/request-response-section";
  import Tab from "./Tab.svelte";
  import { v4 as uuidv4 } from "uuid";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import type { TabDocument, WorkspaceDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { onDestroy } from "svelte";
  import SaveRequest from "../save-request/SaveRequest.svelte";
  import ClosePopup from "../close-popup/ClosePopup.svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import type { WorkspaceRole } from "$lib/utils/enums";
    import type { Observable } from "rxjs";

  export let collectionsMethods: CollectionsMethods;
  export let onTabsSwitched: () => void;
  export let tabList: TabDocument[];
  export let _tabId: string;
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  let removeTab;
  let movedTabStartIndex: number;
  let movedTabEndIndex: number;
  let closePopup: boolean = false;

  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();
  let activeWorkspaceId:string;

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        activeWorkspaceId = activeWorkspaceRxDoc.get("_id");
      }
    },
  );

  $: {
    if (tabList) {
      if (tabList.length >= 0 && tabList.length <= 5) {
        tabWidth = 196;
      } else if (tabList.length >= 6 && tabList.length <= 10) {
        tabWidth = 140;
      } else {
        tabWidth = 100;
      }
    }
  }

  let saveAsVisibility: boolean = false;
  const handleSaveAsBackdrop = (flag) => {
    saveAsVisibility = flag;
  };

  let tabWidth: number = 196;
  let scrollerParent: number;
  let scrollerWidth: number;
  let tabId: string;

  const handleClosePopupBackdrop = (flag) => {
    closePopup = flag;
  };
  const closeTab = (id, tab: NewTab) => {
    if (
      tab?.property?.request &&
      (!tab?.property?.request?.save?.api ||
        !tab?.property?.request?.save?.description)
    ) {
      tabId = id;
      removeTab = tab;
      closePopup = true;
    } else {
      collectionsMethods.handleRemoveTab(id);
    }
  };
  const onDropOver = (event: Event) => {
    event.preventDefault();
  };
  const onDropEvent = (event: Event) => {
    event.preventDefault();
    const element = tabList.splice(movedTabStartIndex, 1);
    tabList.splice(movedTabEndIndex, 0, element[0]);
    tabList = tabList.map((tab, index) => {
      tab.index = index;
      return tab;
    });
    const newTabList: NewTab[] = tabList as NewTab[];
    tabs.set(newTabList);
    onTabsSwitched();
  };

  const handleDropOnStart = (index: number) => {
    movedTabStartIndex = index;
  };
  const handleDropOnEnd = (index: number) => {
    movedTabEndIndex = index;
  };
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<div
  class="tab"
  on:drop={(event) => {
    onDropEvent(event);
  }}
>
  <div
    style="width:{$collapsibleState ? '100%' : '100%'}"
    class="tabbar d-flex"
    bind:offsetWidth={scrollerParent}
  >
    {#if scrollerParent <= scrollerWidth + 105}
      <div class="d-inline-block" style="height:35px; width:35px;">
        <button
          class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100"
          on:click={() => {
            moveNavigation("left");
          }}
        >
          <img src={angleLeft} alt="" />
        </button>
      </div>
    {/if}
    <div
      on:dragover={(event) => {
        onDropOver(event);
      }}
      class=" d-inline-block tab-scroller"
      bind:offsetWidth={scrollerWidth}
      id="tab-scroller"
      style="overflow-x: auto; white-space: nowrap; max-width: calc(100% - 105px);"
    >
      {#if tabList}
        {#each tabList as tab, index}
        {#if activeWorkspaceId === tab.path.workspaceId}
          <Tab
            {tab}
            handleTabRemove={collectionsMethods.handleRemoveTab}
            updateCurrentTab={collectionsMethods.handleActiveTab}
            {closeTab}
            {index}
            {tabWidth}
            {handleDropOnStart}
            {handleDropOnEnd}
          />
      {/if}
        {/each}
      {/if}
    </div>
    {#if scrollerParent <= scrollerWidth + 105}
      <div class="d-inline-block" style="height:35px; width:35px;">
        <button
          class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100"
          on:click={() => {
            moveNavigation("right");
          }}
        >
          <img src={angleRight} alt="" />
        </button>
      </div>
    {/if}
    <div class="d-inline-block" style="height:35px; width:35px;">
      <button
        class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100"
        on:click={() => {
          isApiCreatedFirstTime.set(true);
          collectionsMethods.handleCreateTab(
            generateSampleRequest(
              "UNTRACKED-" + uuidv4(),
              new Date().toString(),
            ),
          );
          moveNavigation("right");
          MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "TabBar" });
        }}
      >
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>
</div>

<ModalWrapperV1
  title={"Save Request"}
  type={"dark"}
  width={"55%"}
  zIndex={10000}
  isOpen={saveAsVisibility}
  handleModalState={handleSaveAsBackdrop}
>
  <SaveRequest
    {collectionsMethods}
    {_tabId}
    componentData={removeTab}
    onFinish={(_id) => {
      collectionsMethods.handleRemoveTab(_id);
    }}
    onClick={handleSaveAsBackdrop}
  />
</ModalWrapperV1>

<ModalWrapperV1
  title={"Save Changes"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={closePopup}
  handleModalState={handleClosePopupBackdrop}
>
  <ClosePopup
    {collectionsMethods}
    onFinish={(_id) => {
      collectionsMethods.handleRemoveTab(_id);
    }}
    componentData={removeTab}
    {handleSaveAsBackdrop}
    closeCallback={handleClosePopupBackdrop}
    {loggedUserRoleInWorkspace}
  />
</ModalWrapperV1>

<style>
  .tabbar {
    height: 36px;
    background-color: var(--background-light);
  }

  .tab-scroller::-webkit-scrollbar {
    display: none;
  }
</style>
