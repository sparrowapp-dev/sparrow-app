<script lang="ts">
  import angleDown from "$lib/assets/angle-down.svg";
  import {
    collapsibleState,
    handleTabUpdate,
  } from "$lib/store/request-response-section";
  import floppyDisk from "$lib/assets/floppy-disk.svg";
  import SaveRequest from "$lib/components/collections/req-res-section/sub-components/save-request/SaveRequest.svelte";
  import { onDestroy } from "svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { updateCollectionRequest } from "$lib/services/collection";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import type { RequestBody } from "$lib/utils/interfaces/request.interface";
  import { collectionList, useCollectionTree } from "$lib/store/collection";
  import type { TabDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Observable } from "rxjs";

  export let activeTab: Observable<TabDocument>;
  export let collectionsMethods: CollectionsMethods;

  let display: boolean = false;
  window.addEventListener("click", () => {
    display = false;
  });
  let visibility: boolean = false;
  const handleBackdrop = (flag) => {
    visibility = flag;
  };

  let tabName: string = "";
  let componentData: NewTab;
  let collection;
  let selectedTab: Partial<NewTab> = {};

  const { updateNodeData } = useCollectionTree();

  const tabSubscribe = activeTab.subscribe((event: TabDocument) => {
    tabName = event?.get("name");
  });

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

  let handleInputValue = () => {
    collectionsMethods.updateTab(tabName, "name");
  };

  onDestroy(() => {
    collectionListUnsubscribe();
    tabSubscribe.unsubscribe();
  });
</script>

<div class="d-flex flex-column" data-tauri-drag-region>
  <div
    class="pageheader d-flex align-items-center justify-content-between {$collapsibleState
      ? 'ps-5 pt-4 pe-3'
      : 'pt-4 px-3'}"
    data-tauri-drag-region
  >
    <div>
      <input
        placeholder="Enter API Request Name"
        bind:value={tabName}
        on:input={handleInputValue}
        class="tabbar-tabName"
      />
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
  .tabbar-tabName {
    background-color: transparent;
    border: none;
    outline: none;
    font-size: 18px;
    font-weight: 400;
  }
</style>
