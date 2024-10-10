<script lang="ts">
  import crossAsset from "$lib/assets/close.svg";
  import { updateCollectionRequest } from "@app/services/collection";
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
  import Button from "@library/ui/button/Button.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import type { WorkspaceRole } from "$lib/utils/enums";
  import type { Observable } from "rxjs";
  import type { CollectionDocument } from "@app/database/database";
  import { onDestroy } from "svelte";
  import { notifications } from "@library/ui/toast/Toast";
  export let collectionsMethods: CollectionsMethods;
  export let closeCallback;
  export let componentData: NewTab;
  export let handleSaveAsBackdrop;
  export let onFinish = (_id) => {};
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  const collections: Observable<CollectionDocument[]> =
    collectionsMethods.collection;
  let collectionCountArr = [];
  let currentCollection;
  const refreshCount = async () => {
    if (collectionCountArr && componentData?.path?.collectionId) {
      for (const collection of collectionCountArr) {
        if (collection._data.id === componentData?.path?.collectionId) {
          currentCollection = collection;
        }
      }
    }
  };
  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value) {
        collectionCountArr = value;
        refreshCount();
      }
    },
  );
  $: {
    if (componentData?.path?.collectionId) {
      refreshCount();
    }
  }
  let loader: boolean = false;
  const handleSaveRequest = async () => {
    const id = componentData?.id;
    loader = true;
    const res = await collectionsMethods.saveApiRequest(componentData);
    if (res) {
      loader = false;
      onFinish(id);
      closeCallback(false);
      notifications.success("API request saved successfully.");
    }
    loader = false;
  };
  onDestroy(() => {
    collectionSubscribe.unsubscribe();
  });
</script>

<div class="pt-2 pb-4">
  <small class="">
    You have unsaved changes. Do you want to save them before closing the file?
  </small>
</div>
<div class="d-flex justify-content-between">
  <div style="margin-right: 15px;">
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
