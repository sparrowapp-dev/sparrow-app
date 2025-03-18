<script lang="ts">
  // Exports
  /**
   * The tab of the folder
   */
  import { HttpRequestDefaultNameBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import {
    AddRegular,
    CaretDownFilled,
    CaretUpFilled,
    SaveRegular,
    FolderAddRegular,
    ArrowSwapRegular,
    SocketIoIcon,
    SocketIcon,
    GraphIcon,
  } from "@sparrow/library/icons";
  import { Dropdown, Button } from "@sparrow/library/ui";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";

  import { Input } from "@sparrow/library/forms";
  export let tab: TabDocument;
  /**
   * The folder data from repository
   */
  export let folder: Folder;
  export let onItemCreated;
  export let isCollectionEditable;

  /**
   * The collection of the folder
   */
  export let collection: CollectionDocument;
  /**
   * Callback to rename folder
   */
  export let onRename: (
    collection: CollectionDocument,
    folder: Folder,
    newName: string,
  ) => Promise<void>;
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
  export let onUpdateDescription: (
    tab: TabDocument,
    newDescription: string,
  ) => Promise<void>;
  /**
   * Callback to get total number of requests in folder
   */

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
  export let isWebApp = false;

  /**
   * Components
   */
  import { Tooltip } from "@sparrow/library/ui";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";

  /**
   * Types
   */
  import type { CollectionDocument, TabDocument } from "@app/database/database";
  import type { Folder } from "@sparrow/common/types/workspace";

  /**
   * Constants
   */
  import { PERMISSION_NOT_FOUND_TEXT } from "@sparrow/common/constants/permissions.constant";
  import { WorkspaceRole } from "@sparrow/common/enums";

  /**
   * Local variables
   */
  let totalRequests: number = 0;
  let totalGraphQl: number = 0;
  let totalSocketIo: number = 0;
  let totalWebSocket: number = 0;
  let showAddItemMenu = false;
  let currentDescription = folder?.description || "";
  /**
   * Funciton to update total requests
   */
  $: {
    if (folder) {
      currentDescription = folder?.description || "";
    }
  }
  const addButtonData = isWebApp
    ? [
        {
          onclick: () => {
            onItemCreated("requestCollection", {
              collection: collection,
            });
          },
          name: `Add ${HttpRequestDefaultNameBaseEnum.NAME}`,
          icon: ArrowSwapRegular,
          iconColor: "var(--icon-ds-neutral-50)",
          iconSize: "14px",
        },
        {
          onclick: () => {
            onItemCreated("socketioCollection", {
              collection: collection,
            });
          },
          name: `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
          icon: SocketIoIcon,
          iconColor: "var(--icon-ds-neutral-50)",
          iconSize: "14px",
        },
        {
          onclick: () => {
            onItemCreated("websocketCollection", {
              collection: collection,
            });
          },
          name: "Add WebSocket",
          icon: SocketIcon,
          iconColor: "var(--icon-ds-neutral-50)",
          iconSize: "14px",
        },
      ]
    : [
        {
          onclick: () => {
            onItemCreated("requestCollection", {
              collection: collection,
            });
          },
          name: `Add ${HttpRequestDefaultNameBaseEnum.NAME}`,
          icon: ArrowSwapRegular,
          iconColor: "var(--icon-ds-neutral-50)",
          iconSize: "14px",
        },
        {
          onclick: () => {
            onItemCreated("socketioCollection", {
              collection: collection,
            });
          },
          name: `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
          icon: SocketIoIcon,
          iconColor: "var(--icon-ds-neutral-50)",
          iconSize: "14px",
        },
        {
          onclick: () => {
            onItemCreated("websocketCollection", {
              collection: collection,
            });
          },
          name: "Add WebSocket",
          icon: SocketIcon,
          iconColor: "var(--icon-ds-neutral-50)",
          iconSize: "14px",
        },

        {
          onclick: () => {
            onItemCreated("graphqlCollection", {
              collection: collection,
            });
          },
          name: `Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
          icon: GraphIcon,
          iconColor: "var(--icon-ds-neutral-50)",
          iconSize: "14px",
        },
      ];
  const handleSelectClick = (event: MouseEvent) => {
    const selectElement = document.getElementById(
      `add-item-collection-${collection.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showAddItemMenu = false;
    }
  };
  let isBackgroundClickable = true;
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

  const onRenameInputKeyPress = () => {
    const inputField = document.getElementById(
      "renameInputFieldFolder",
    ) as HTMLInputElement;
    inputField.blur();
  };

  const resetInputField = () => {
    const inputField = document.getElementById(
      "renameInputFieldFolder",
    ) as HTMLInputElement;
    inputField.value = folder?.name;
  };
</script>

<div class="main-container d-flex h-100" style="overflow:auto;">
  <div class="my-collection d-flex flex-column w-100 z-3">
    <div class="d-flex gap-2 mb-4">
      <div class="d-flex flex-column flex-grow-1">
        <Input
          placeholder={"Enter name"}
          type={"text"}
          size={"medium"}
          maxlength={100}
          value={folder?.name || ""}
          id={"renameInputFieldFolder"}
          variant={"inline"}
          width={"398px"}
          disabled={tab?.source === "SPEC" ||
            userRole === WorkspaceRole.WORKSPACE_VIEWER}
          on:blur={(event) => {
            const newValue = event.target.value.trim();
            const previousValue = folder.name;
            if (newValue === "") {
              resetInputField();
            } else if (newValue !== previousValue) {
              onRename(collection, folder, newValue, tab);
            }
          }}
          on:keydown={(event) => {
            if (event.key === "Enter") {
              onRenameInputKeyPress();
            }
          }}
        />
      </div>
      <div class="d-flex flex-row" style="gap:8px">
        <Dropdown
          zIndex={600}
          buttonId={`add-item-collection`}
          bind:isMenuOpen={showAddItemMenu}
          bind:isBackgroundClickable
          options={addButtonData}
          horizontalPosition="left"
        >
          <Button
            id={`add-item-collection`}
            title={"New Request"}
            type={"primary"}
            onClick={() => {
              showAddItemMenu = !showAddItemMenu;
            }}
            size="medium"
            startIcon={AddRegular}
            endIcon={showAddItemMenu ? CaretUpFilled : CaretDownFilled}
          />
        </Dropdown>
        <Button
          type={"secondary"}
          startIcon={SaveRegular}
          onClick={() => {
            if (folder?.description !== currentDescription) {
              onUpdateDescription(tab, currentDescription);
            }
          }}
        />
      </div>
    </div>

    <div class="d-flex gap-4 mb-4 ps-2">
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-primary-300">{totalRequests}</span>
        <p style="font-size: 12px;" class="mb-0">
          {HttpRequestDefaultNameBaseEnum.NAME}
        </p>
      </div>
      {#if !isWebApp}
        <div class="d-flex align-items-center gap-2">
          <span class="fs-4 text-primary-300">{totalGraphQl}</span>
          <p style="font-size: 12px;" class="mb-0">GraphQL</p>
        </div>
      {/if}
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-primary-300">{totalWebSocket}</span>
        <p style="font-size: 12px;" class="mb-0">WebSocket</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-primary-300">{totalSocketIo}</span>
        <p style="font-size: 12px;" class="mb-0">Socket.IO</p>
      </div>
    </div>
    <div class="d-flex align-items-start ps-0 h-100">
      <textarea
        disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
          tab?.source === "SPEC"}
        id="updateFolderDescField"
        style="margin-top: -2px;"
        class="border-0 text-fs-12 h-50 input-outline shadow-none w-100 p-2"
        value={folder?.description || ""}
        placeholder="Describe this folder and share code examples or usage tips for the APIs."
        on:input={(event) => {
          currentDescription = event.target.value;
        }}
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
    background-color: var(--bg-ds-surface-600);
  }
  textarea {
    border-radius: 4px !important;
    color: var(--text-secondary-1000);
  }
  textarea::placeholder {
    color: var(--text-secondary-550);
  }

  .input-outline:hover {
    outline: 1px solid var(--sparrow-blue);
  }
  .input-outline:focus {
    outline: 1px solid var(--sparrow-blue);
  }
  .add-button {
    background-color: var(--dropdown-button);
  }

  .add-button:hover {
    background-color: var(--dropdown-hover);
  }
</style>
