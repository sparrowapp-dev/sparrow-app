<script lang="ts">
  import crossAsset from "$lib/assets/close.svg";
  import CoverButton from "$lib/components/buttons/CoverButton.svelte";
  import { updateCollectionRequest } from "$lib/services/collection";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import { fade, fly } from "svelte/transition";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type {
    NewTab,
    RequestBody,
  } from "$lib/utils/interfaces/request.interface";
  import { RequestDataset } from "$lib/utils/enums/request.enum";
  import { setContentTypeHeader } from "$lib/utils/helpers/auth.helper";
  export let collectionsMethods: CollectionsMethods;
  export let closeCallback;
  export let componentData: NewTab;
  export let handleSaveAsBackdrop;
  export let onFinish = (_id) => {};

  let loader: boolean = false;

  const handleSaveRequest = async () => {
    const _id = componentData.id;
    loader = true;
    const { folderId, folderName, collectionId, workspaceId } =
      componentData.path;
    const bodyType =
      componentData.property.request.state.dataset === RequestDataset.RAW
        ? componentData.property.request.state.raw
        : componentData.property.request.state.dataset;
    const expectedRequest: RequestBody = {
      method: componentData.property.request.method,
      url: componentData.property.request.url,
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      queryParams: componentData.property.request.queryParams,
      selectedRequestBodyType: setContentTypeHeader(bodyType),
    };

    if (!folderId) {
      let res = await updateCollectionRequest(_id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        items: {
          id: _id,
          name: componentData.name,
          description: componentData.description,
          type: ItemType.REQUEST,
          request: expectedRequest,
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          res.data.data,
        );
        loader = false;
        onFinish(_id);
        closeCallback(false);
      } else {
        loader = false;
      }
    } else {
      let res = await updateCollectionRequest(_id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        folderId: folderId,
        items: {
          name: folderName,
          type: ItemType.FOLDER,
          items: {
            id: _id,
            name: componentData.name,
            description: componentData.description,
            type: ItemType.REQUEST,
            request: expectedRequest,
          },
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          res.data.data,
        );
        loader = false;
        onFinish(_id);
        closeCallback(false);
      } else {
        loader = false;
      }
    }
  };
</script>

<div
  class="close-request-backdrop d-block"
  on:click={() => {
    closeCallback(false);
  }}
  transition:fade={{ delay: 0, duration: 100 }}
/>
<div
  class="close-request d-block"
  transition:fly={{ y: 50, delay: 0, duration: 100 }}
  on:introstart
  on:outroend
>
  <div class="contain">
    <div class="d-flex justify-content-between">
      <div class="pb-2">
        <h4 class="close-request__title">Save Changes?</h4>
      </div>
      <button
        class="btn pt-0 p-0 pe-0"
        on:click={() => {
          closeCallback(false);
        }}><img src={crossAsset} alt="" /></button
      >
    </div>
    <div class="pb-3">
      <small class="">
        You have unsaved changes. Do you want to save them before closing the
        file?
      </small>
    </div>
    <div class="d-flex justify-content-between">
      <div>
        <CoverButton
          text={"Cancel"}
          size={16}
          type={"dark"}
          onClick={() => {
            closeCallback(false);
          }}
        />
      </div>
      <div class="d-flex">
        <span style="margin-right: 15px;">
          <CoverButton
            text={"Discard Changes"}
            size={16}
            type={"dark"}
            onClick={() => {
              collectionsMethods.handleRemoveTab(componentData.id);
              closeCallback(false);
            }}
          />
        </span>
        <CoverButton
          text={"Save Changes"}
          size={16}
          type={"primary"}
          {loader}
          onClick={() => {
            if (
              componentData?.path.collectionId &&
              componentData?.path.workspaceId
            ) {
              handleSaveRequest();
            } else {
              closeCallback(false);
              handleSaveAsBackdrop(true);
            }
          }}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .close-request-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 9;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }
  .close-request {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    padding: 24px;
    background-color: var(--background-color);
    width: 540px;
    height: 183px;
    z-index: 10;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .close-request__title {
    font-size: 20px;
  }
</style>
