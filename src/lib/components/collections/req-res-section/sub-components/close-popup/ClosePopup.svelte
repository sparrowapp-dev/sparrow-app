<script lang="ts">
  import crossAsset from "$lib/assets/close.svg";
  import CoverButton from "$lib/components/buttons/CoverButton.svelte";
  import { updateCollectionRequest } from "$lib/services/collection";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { NewTab, RequestBody } from "$lib/utils/interfaces/request.interface";
  export let collectionsMethods: CollectionsMethods;
  export let closeCallback;
  export let componentData : NewTab;
  export let handleSaveAsBackdrop;
  export let onFinish = (_id) => {};

  let loader : boolean = false;

  const handleSaveRequest = async () => {
    loader = true;
    collectionsMethods.updateTab(true, "saveInProgress");
    const { folderId, folderName, collectionId, workspaceId } =
      componentData.path;

    const expectedRequest: RequestBody = {
      method: componentData.property.request.method,
      url: componentData.property.request.url,
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      queryParams: componentData.property.request.queryParams,
    };

    if (!folderId && !folderName) {
      let res = await updateCollectionRequest(componentData.id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        items: {
          id: componentData.id,
          name: componentData.name,
          type: ItemType.REQUEST,
          request: expectedRequest,
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestOrFolderInCollection(
          collectionId,
          componentData.id,
          res.data.data,
        );
        loader = false;
        collectionsMethods.updateTab(false, "saveInProgress");
        collectionsMethods.updateTab(true, "save");
        onFinish(componentData.id);
        closeCallback(false);
      } else {
        loader = false;
        collectionsMethods.updateTab(false, "saveInProgress");
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
            name: componentData.name,
            type: ItemType.REQUEST,
            request: expectedRequest,
          },
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestInFolder(
          collectionId,
          folderId,
          componentData.id,
          res.data.data,
        );
        loader = false;
        collectionsMethods.updateTab(false, "saveInProgress");
        collectionsMethods.updateTab(true, "save");
        onFinish(componentData.id); 
        closeCallback(false);
      } else {
        loader = false;
        collectionsMethods.updateTab(false, "saveInProgress");
      }
    }
  };
</script>

<div
  class="save-request-backdrop d-block"
  on:click={() => {
    closeCallback(false);
  }}
/>
<div class="save-request d-block">
  <div class="contain">
    <div class="d-flex justify-content-between">
      <div class="pb-2">
        <h4>Save Changes?</h4>
      </div>
      <button
        class="btn"
        on:click={() => {
          closeCallback(false);
        }}><img src={crossAsset} alt="" /></button
      >
    </div>
    <p>
      You have unsaved changes. Do you want to save them before closing the
      file?
    </p>
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
        <CoverButton
          text={"Discard Changes"}
          size={16}
          type={"dark"}
          onClick={() => {
            collectionsMethods.handleRemoveTab(componentData.id);
            closeCallback(false);
          }}
        />
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
  .save-request-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 99999;
  }
  .save-request {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    padding: 24px;
    background-color: var(--background-color);
    width: 540px;
    height: 183px;
    z-index: 999999;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .api-url {
    word-break: break-all;
    font-size: 12px;
    color: #999999;
    font-family: monospace;
  }
  .save-request input:focus,
  .save-request textarea:focus {
    outline: none;
    padding: 6px 12px;
  }
  .tabname-error-text {
    font-size: 12px;
  }
</style>
