<script lang="ts">
  import angleDown from "$lib/assets/angle-down.svg";
  import {
    collapsibleState,
    currentTab,
    handleTabUpdate,
    tabs,
  } from "$lib/store/request-response-section";
  import floppyDisk from "$lib/assets/floppy-disk.svg";
  import ApiSendRequestPage from "./ApiSendRequestPage.svelte";
  import SaveRequest from "$lib/components/collections/req-res-section/sub-components/save-request/SaveRequest.svelte";
  import { onDestroy } from "svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { updateCollectionRequest } from "$lib/services/collection";
  import { path } from "@tauri-apps/api";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import type { RequestBody } from "$lib/utils/interfaces/request.interface";
  import { collectionList, useCollectionTree } from "$lib/store/collection";
  import spin from "$lib/assets/spin.svg";
  import { PageHeaderViewModel } from "./PageHeader.ViewModel";
    import type { TabDocument } from "$lib/database/app.database";

  const _viewModel = new PageHeaderViewModel();
  const tab = _viewModel.tab;

  
  let isCollaps: boolean;
  let display: boolean = false;
  collapsibleState.subscribe((value) => (isCollaps = value));
  
  window.addEventListener("click", () => {
    display = false;
  });
  let visibility: boolean = false;
  const handleBackdrop = (flag) => {
    visibility = flag;
  };
  interface Workspace {
    name: string;
    id: string;
  }
  let currentTabId = null;
  let tabList = [];
  let tabName: string = "";
  let componentData: NewTab;
  let workspace: Workspace;
  let collection;

  let loader = false;
  
  const { updateNodeData } = useCollectionTree();

  const tabSubscribe = tab.subscribe((event: TabDocument) => {
    tabName = event?.get("name");
  });
  
  // const fetchComponentData = (id, list) => {
  //   list.forEach((elem) => {
  //     if (elem.id === id) {
  //       tabName = elem.name;
  //       componentData = elem;
  //     }
  //   });
  // };

  // const tabsUnsubscribe = tabs.subscribe((value) => {
  //   tabList = value;
  //   if (currentTabId && tabList) {
  //     fetchComponentData(currentTabId, tabList);
  //   }
  // });

  // const currentTabUnsubscribe = currentTab.subscribe((value) => {
  //   if (value && value.id) {
  //     currentTabId = value.id;
  //     if (currentTabId && tabList) {
  //       fetchComponentData(currentTabId, tabList);
  //     }
  //   }
  // });
  // const currentWorkspaceUnsubscribe = currentWorkspace.subscribe((value) => {
  //   if (value.id !== "") {
  //     workspace = value;
  //   }
  // });
  const collectionListUnsubscribe = collectionList.subscribe((value) => {
    collection = value;
  });

  const handleSaveRequest = async () => {
    if (componentData?.id && componentData?.path) {
      const { folderId, folderName, collectionId, workspaceId } =
        componentData.path;
      if (componentData.path) {
        const expectedRequest: RequestBody = {
          method: componentData.request.method,
          url: componentData.request.url,
          body: componentData.request.body,
          headers: componentData.request.headers,
          queryParams: componentData.request.queryParams,
        };

        if (!folderId && !folderName) {
          let res = await updateCollectionRequest(componentData.id, {
            collectionId: collectionId,
            workspaceId: workspaceId,
            items: {
              id: componentData.id,
              name: tabName,
              type: ItemType.REQUEST,
              request: expectedRequest,
            },
          });
          if (res.isSuccessful) {
            updateNodeData(
              JSON.parse(JSON.stringify(collection)),
              componentData.id,
              {
                name: tabName,
                request: expectedRequest,
              },
            );
            handleTabUpdate({ save: true }, componentData.id);
          }
        } else {
          let res = await updateCollectionRequest(componentData.id, {
            collectionId: collectionId,
            workspaceId: workspaceId,
            folderId: folderId,
            items: {
              name: folderName,
              type: ItemType.FOLDER,
              items: {
                id: componentData.id,
                name: tabName,
                type: ItemType.REQUEST,
                request: expectedRequest,
              },
            },
          });
          if (res.isSuccessful) {
            updateNodeData(
              JSON.parse(JSON.stringify(collection)),
              componentData.id,
              {
                name: tabName,
                request: expectedRequest,
              },
            );
            handleTabUpdate({ save: true }, componentData.id);
          }
        }
      }
    }
  };

  onDestroy(() => {
    // tabsUnsubscribe();
    // currentTabUnsubscribe();
    // currentWorkspaceUnsubscribe();
    collectionListUnsubscribe();
    tabSubscribe.unsubscribe()
  });
</script>

<div
  class="d-flex flex-column"
  style="margin-right: 32px;"
  data-tauri-drag-region
>
  <div
    class="pageheader d-flex align-items-center justify-content-between {isCollaps
      ? 'ps-5 pt-4 pe-3'
      : 'pt-4 px-3'}"
    data-tauri-drag-region
  >
    <div>
      <p class="mb-0 text-whiteColor" style="font-size: 18px; font-weight:400">
        {tabName}
      </p>
    </div>

    <div class="d-flex gap-3">
      <div class="d-flex gap-1">
        <button
          class="btn btn-primary d-flex align-items-center py-1.6 justify-content-center gap-2 ps-3 pe-4 rounded border-0"
          on:click={() => {
            if (!componentData?.path) {
              visibility = true;
            } else {
              handleSaveRequest();
            }
          }}
        >
          <!-- <img src={spin} class="loader-anim" alt="" style="width:14px; height:14px;"> -->
          <img src={floppyDisk} alt="" style="height: 20px; width:20px;" />
          <p
            class="mb-0 text-whiteColor"
            style="font-size: 14px; font-weight:400;"
          >
            Save
          </p>
        </button>
        <span class="position-relative">
          <button
            on:click={() => {
              setTimeout(() => {
                display = true;
              }, 100);
            }}
            class="px-2 py-2 btn btn-primary d-flex align-items-center justify-content-center rounded border-0"
          >
            <img src={angleDown} alt="" class="w-100 h-100" />
          </button>
          <div class="rounded save-options {display ? 'd-block' : 'd-none'}">
            <p
              style="width:120px;"
              class="bg-black m-0 py-1 px-3 cursor-pointer"
              on:click={() => {
                display = false;
                visibility = true;
              }}
            >
              Save As
            </p>
          </div>
          <SaveRequest {visibility} onClick={handleBackdrop} />
        </span>
      </div>
      <div>
        <button
          class="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-3 py-1.3 rounded border-0"
        >
          <p
            class="mb-0 text-whiteColor"
            style="font-size: 14px; font-weight:400"
          >
            Share
          </p>
        </button>
      </div>
    </div>
  </div>
  <div>
    <ApiSendRequestPage />
  </div>
</div>

<style>
  .btn-primary {
    background-color: #313233;
  }

  .btn-primary:hover {
    background-color: #616364;
  }
  .save-options {
    position: absolute;
    top: 40px;
    right: 0;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .loader-anim {
    animation: loader-animation 1s linear infinite;
  }
  @keyframes loader-animation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
