<script lang="ts">
  import crossAsset from "$lib/assets/close.svg";
  import { updateCollectionRequest } from "$lib/services/collection";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import { fade, fly } from "svelte/transition";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type {
    NewTab,
    RequestBody,
  } from "$lib/utils/interfaces/request.interface";
  import { RequestDataset } from "$lib/utils/enums/request.enum";
  import {
    setAuthType,
    setContentTypeHeader,
  } from "$lib/utils/helpers/auth.helper";
  import Button from "$lib/components/buttons/Button.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import type { WorkspaceRole } from "$lib/utils/enums";
  export let collectionsMethods: CollectionsMethods;
  export let closeCallback;
  export let componentData: NewTab;
  export let handleSaveAsBackdrop;
  export let onFinish = (_id) => {};
  export let loggedUserRoleInWorkspace: WorkspaceRole;

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
    const authType = componentData.property.request.state?.auth;
    const expectedRequest: RequestBody = {
      method: componentData.property.request.method,
      url: componentData.property.request.url,
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      queryParams: componentData.property.request.queryParams,
      auth: componentData.property.request.auth,
      selectedRequestBodyType: setContentTypeHeader(bodyType),
      selectedRequestAuthType: authType,
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

<div class="pb-3">
  <small class="">
    You have unsaved changes. Do you want to save them before closing the file?
  </small>
</div>
<div class="d-flex justify-content-between">
  <div>
    <Button
      title={"Cancel"}
      textClassProp={"fs-6"}
      type={"dark"}
      onClick={() => {
        closeCallback(false);
      }}
    />
  </div>
  <div class="d-flex">
    <span style="margin-right: 15px;">
      <Button
        title={"Discard Changes"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
          collectionsMethods.handleRemoveTab(componentData.id);
          closeCallback(false);
        }}
      />
    </span>
    <Button
      disable={!hasWorkpaceLevelPermission(
        loggedUserRoleInWorkspace,
        workspaceLevelPermissions.SAVE_REQUEST,
      )}
      title={"Save Changes"}
      textClassProp={"fs-6"}
      type={"primary"}
      loaderSize={18}
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
