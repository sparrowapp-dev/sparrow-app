<script lang="ts">
  // Exports
  /**
   * The tab of the folder
   */
  import { HttpRequestDefaultNameBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  export let tab: TabDocument;
  /**
   * The folder data from repository
   */
  export let folder: Folder;
  /**
   * The collection of the folder
   */
  export let collection: CollectionDocument;
  /**
   * Callback to rename folder
   */
  export let onUpdateName;
  /**
   * Callback to create new api request
   */
  export let onCreateAPIRequest: (
    collection: CollectionDocument,
    folder: Folder,
  ) => Promise<void>;
  /**
   * Callback to update description
   */
  export let onUpdateDescription;
  /**
   * Callback to get total number of requests in folder
   */
  export let onItemCreated;

  export let getTotalRequests: (
    collection: CollectionDocument,
    tab: TabDocument,
  ) => Promise<{
    totalRequests: number;
    totalGraphQl: number;
    totalSocketIo: number;
    totalWebSocket: number;
  }>;
  /**
   * Role of user in active workspace
   */
  export let userRole;

  export let onSaveFolder;

  /**
   * Components
   */
  import { Button, Dropdown, Tooltip } from "@sparrow/library/ui";

  /**
   * Constants
   */
  import { PERMISSION_NOT_FOUND_TEXT } from "@sparrow/common/constants/permissions.constant";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Input } from "@sparrow/library/forms";
  import {
    AddRegular,
    ArrowSwapRegular,
    CaretDownFilled,
    CaretUpFilled,
    FolderAddRegular,
    GraphIcon,
    SaveRegular,
    SocketIcon,
    SocketIoIcon,
  } from "@sparrow/library/icons";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";

  /**
   * Local variables
   */
  let totalRequests: number = 0;
  let totalGraphQl: number = 0;
  let totalSocketIo: number = 0;
  let totalWebSocket: number = 0;
  let showAddItemMenu = false;

  const addButtonData = [
    {
      onclick: () => {
        onItemCreated("requestFolder", {
          workspaceId: collection.workspaceId,
          collection: collection,
          folder: folder,
        });
      },
      name: `Add ${HttpRequestDefaultNameBaseEnum.NAME}`,
      icon: ArrowSwapRegular,
      iconColor: "var(--icon-ds-neutral-50)",
      iconSize: "14px",
    },
    {
      onclick: () => {
        onItemCreated("socketioFolder", {
          workspaceId: collection.workspaceId,
          collection: collection,
          folder: folder,
        });
      },
      name: `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
      icon: SocketIoIcon,
      iconColor: "var(--icon-ds-neutral-50)",
      iconSize: "14px",
    },
    {
      onclick: () => {
        onItemCreated("websocketFolder", {
          workspaceId: collection.workspaceId,
          collection: collection,
          folder: folder,
        });
      },
      name: "Add WebSocket",
      icon: SocketIcon,
      iconColor: "var(--icon-ds-neutral-50)",
      iconSize: "14px",
    },
    {
      onclick: () => {
        onItemCreated("graphqlFolder", {
          workspaceId: collection.workspaceId,
          collection: collection,
          folder: folder,
        });
      },
      name: `Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
      icon: GraphIcon,
      iconColor: "var(--icon-ds-neutral-50)",
      iconSize: "14px",
    },
  ];

  /**
   * Funciton to update total requests
   */
  const updateTotalRequests = async () => {
    let res = await getTotalRequests(collection, tab);
    if (res) {
      totalRequests = res.totalRequests;
      totalGraphQl = res.totalGraphQl;
      totalSocketIo = res.totalSocketIo;
      totalWebSocket = res.totalWebSocket;
    }
  };

  /**
   * Check if the tab or collection updates
   */
  $: {
    if (tab && collection) {
      updateTotalRequests();
    }
  }

  const handleInputName = (event: Event) => {
    // const target = event.target as HTMLInputElement;
    // onRename(target.value, "");
    onUpdateName(event.detail, "");
  };

  const handleBlurName = (event: Event) => {
    onUpdateName(event.detail, "blur");
  };

  const handleInputDescription = (event: Event) => {
    const target = event.target as HTMLInputElement;
    onUpdateDescription(target.value);
  };
</script>

<div class="main-container d-flex h-100" style="overflow:auto;">
  <div class="my-collection d-flex flex-column w-100 z-3">
    <div class="d-flex gap-2 mb-4">
      <div class="d-flex flex-column flex-grow-1">
        <Input
          type={"text"}
          size={"medium"}
          width={"398px"}
          maxlength={500}
          id={"renameInputFieldCollection"}
          value={$tab?.name || ""}
          variant={"inline"}
          placeholder={""}
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
          on:input={handleInputName}
          on:blur={handleBlurName}
        />
      </div>
      <div class="d-flex flex-row">
        <!-- <button
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
            tab?.source === "SPEC"}
          class="btn add-button rounded mx-1 border-0 text-align-right py-1"
          style="max-height:60px; width:200px; margin-top: -2px;"
          on:click={() => {
            onCreateAPIRequest(collection, folder);
          }}>New Request</button
        > -->
        <Dropdown
          zIndex={600}
          buttonId={`add-item-collection`}
          bind:isMenuOpen={showAddItemMenu}
          options={addButtonData}
          horizontalPosition="left"
        >
          <Button
            id={`add-item-collection`}
            disable={userRole === WorkspaceRole.WORKSPACE_VIEWER}
            title={"New"}
            type={"primary"}
            onClick={() => {
              showAddItemMenu = !showAddItemMenu;
            }}
            size="medium"
            startIcon={AddRegular}
            endIcon={showAddItemMenu ? CaretUpFilled : CaretDownFilled}
          />
        </Dropdown>
      </div>
      <Button
        disable={$tab?.isSaved || userRole === WorkspaceRole.WORKSPACE_VIEWER
          ? true
          : false}
        startIcon={SaveRegular}
        type={"secondary"}
        onClick={() => {
          onSaveFolder();
        }}
      />
    </div>

    <div class="d-flex gap-4 ps-2">
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-primary-300">{totalRequests}</span>
        <p style="font-size: 12px;" class="mb-0">
          {HttpRequestDefaultNameBaseEnum.NAME}
        </p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-primary-300">{totalGraphQl}</span>
        <p style="font-size: 12px;" class="mb-0">GraphQL</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-primary-300">{totalWebSocket}</span>
        <p style="font-size: 12px;" class="mb-0">WebSocket</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-primary-300">{totalSocketIo}</span>
        <p style="font-size: 12px;" class="mb-0">Socket.IO</p>
      </div>
    </div>
    <hr />
    <div class="d-flex align-items-start ps-0 h-100">
      <textarea
        disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
          tab?.source === "SPEC"}
        id="updateFolderDescField"
        style="margin-top: -2px;"
        class="border-0 text-fs-12 input-outline shadow-none w-100 p-2"
        value={$tab?.description || ""}
        placeholder="Describe this folder and share code examples or usage tips for the APIs."
        on:input={handleInputDescription}
      />
    </div>
  </div>
  <div
    class="d-flex flex-column align-items-left justify-content-start d-none"
    style="width: 280px;border-left:2px solid #313233"
  >
    <div
      style="text-align:left;font-size:16px; font-weigh:400;"
      class="mt-5 ps-3 text-whiteColor"
    >
      <p>Index</p>
    </div>
    <div class="mt-2 ps-3" style="font-size:12px; font-weight:400">
      <p class="text-textColor">
        Begin adding content, and the Index will automatically populate here.
        This will help you easily navigate and organize your documentation as it
        grows.
      </p>
    </div>
  </div>
</div>

<style>
  .my-collection {
    padding: 24px;
  }

  .input-outline {
    border-radius: 0%;
  }
  textarea {
    outline-color: var(--text-primary-600);
    border: none;
    border-radius: 4px !important;
    color: var(--text-secondary-1000);
    background-color: var(--bg-ds-surface-600);
    height: 168px;
  }
  textarea::placeholder {
    color: var(--text-secondary-550);
  }

  .input-outline:focus,
  .input-outline:hover {
    outline: 1px solid var(--text-primary-600);
  }

  .add-button {
    background-color: var(--dropdown-button);
  }

  .add-button:hover {
    background-color: var(--dropdown-hover);
  }
</style>
