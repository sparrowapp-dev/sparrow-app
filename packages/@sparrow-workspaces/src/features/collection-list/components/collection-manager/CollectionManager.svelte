<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Tooltip } from "@sparrow/library/ui";
  import {
    SocketIcon,
    SocketIoIcon,
    GraphIcon,
    FolderAddRegular,
    ArrowSwapRegular,
    BotRegular,
  } from "@sparrow/library/icons";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
  import type { CollectionBaseInterface } from "@sparrow/common/types/workspace/collection-base";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  export let onItemCreated: (entityType: string, args: any) => void;
  export let collection: CollectionBaseInterface;

  /**
   * Role of user in active workspace
   */
  export let userRole;
  export let isSharedWorkspace = false;
  export let isMockCollection = false;
</script>

<div class="d-flex gap-2 ms-2" style="padding-left: 26px;">
  {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER && !isSharedWorkspace}
    <Tooltip
      title={collection?.activeSync
        ? "Adding folders is disabled for active sync collections."
        : "Add Folder"}
      placement={collection?.activeSync ? "top-left" : "bottom-center"}
      distance={12}
      zIndex={1000}
    >
      <div
        class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
        style="height: 24px; width: 24px; "
        role="button"
        tabindex="0"
        on:keydown={() => {}}
        on:click={() => {
          if (!collection?.activeSync) {
            onItemCreated("folder", {
              workspaceId: collection.workspaceId,
              collection,
            });
          }
        }}
      >
        <FolderAddRegular size="16px" color="var(--bg-ds-neutral-300)" />
      </div>
    </Tooltip>

    <Tooltip
      title={isMockCollection
        ? "Add Mock REST API"
        : collection?.activeSync
          ? "Adding requests is disabled for active sync collections."
          : "Add REST API"}
      placement={isMockCollection
        ? "top-center"
        : collection?.activeSync
          ? "top-left"
          : "bottom-center"}
      distance={12}
      zIndex={1000}
    >
      <div
        class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
        style="height: 24px; width: 24px;"
        role="button"
        on:click={() => {
          if (isMockCollection) {
            onItemCreated("mockRequestCollection", {
              workspaceId: collection.workspaceId,
              collection,
            });
          } else if (!collection?.activeSync) {
            onItemCreated("requestCollection", {
              workspaceId: collection.workspaceId,
              collection,
            });
          }
        }}
      >
        <ArrowSwapRegular size="16px" color="var(--bg-ds-neutral-300)" />
      </div>
    </Tooltip>

    {#if !isMockCollection}
      <Tooltip
        title={collection?.activeSync
          ? "Adding requests is disabled for active sync collections."
          : `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`}
        placement={collection?.activeSync ? "top-left" : "bottom-center"}
        distance={12}
        zIndex={1000}
      >
        <div
          class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
          style="height: 24px; width: 24px;"
          role="button"
          on:click={() => {
            if (!collection?.activeSync) {
              onItemCreated("socketioCollection", {
                workspaceId: collection.workspaceId,
                collection,
              });
              MixpanelEvent(Events.Collection_SocketIO, {
                description: "Created Socket.IO inside collection.",
              });
            }
          }}
        >
          <SocketIoIcon
            height={"13px"}
            width={"13px"}
            color={"var(--request-arc)"}
          />
        </div>
      </Tooltip>
      <Tooltip
        title={collection?.activeSync
          ? "Adding requests is disabled for active sync collections."
          : "Add WebSocket"}
        placement={collection?.activeSync ? "top-left" : "bottom-center"}
        distance={12}
        zIndex={1000}
      >
        <div
          class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
          style="height: 24px; width: 24px;"
          role="button"
          on:click={() => {
            if (!collection?.activeSync) {
              onItemCreated("websocketCollection", {
                workspaceId: collection.workspaceId,
                collection,
              });
              MixpanelEvent(Events.Collection_WebSocket);
            }
          }}
        >
          <SocketIcon height="12px" width="16px" color="var(--request-arc)" />
        </div>
      </Tooltip>

      <Tooltip
        title={collection?.activeSync
          ? "Adding requests is disabled for active sync collections."
          : `Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`}
        placement={collection?.activeSync ? "top-left" : "bottom-center"}
        distance={12}
        zIndex={1000}
      >
        <div
          class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
          style="height: 24px; width: 24px;"
          role="button"
          on:click={() => {
            if (!collection?.activeSync) {
              onItemCreated("graphqlCollection", {
                workspaceId: collection.workspaceId,
                collection,
              });
              MixpanelEvent(Events.Collection_GraphQL, {
                description: "Created GraphQL inside collection.",
              });
            }
          }}
        >
          <GraphIcon
            height={"13px"}
            width={"13px"}
            color={"var(--request-arc)"}
          />
        </div>
      </Tooltip>

      <Tooltip
        title={collection?.activeSync
          ? "Adding requests is disabled for active sync collections."
          : `Add AI Request`}
        placement={collection?.activeSync ? "top-left" : "bottom-center"}
        distance={12}
        zIndex={1000}
      >
        <div
          class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
          style="height: 24px; width: 24px;"
          role="button"
          on:click={() => {
            if (!collection?.activeSync) {
              onItemCreated("aiRequestCollection", {
                workspaceId: collection.workspaceId,
                collection,
              });
              // MixpanelEvent(Events.Collection_GraphQL, {
              //   description: "Created GraphQL inside collection.",
              // });
            }
          }}
        >
          <BotRegular
            height={"13px"}
            width={"13px"}
            color={"var(--request-arc)"}
          />
        </div>
      </Tooltip>
    {/if}
  {/if}
</div>

<style>
  .box-line {
    visibility: none;
  }

  .sync-button {
    background-color: transparent;
  }
  .sync-button:active {
    background-color: var(--editor-angle-bracket);
  }
  .my-button:hover .threedot-icon-container {
    visibility: visible;
  }
  .my-button:hover .add-icon-container {
    visibility: visible;
  }

  .main-file {
    width: calc(100% - 28px);
  }

  .api-method {
    font-size: 10px;
    font-weight: 400;
    width: 30px !important;
    height: 24px;

    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 4px;
  }
  .api-name {
    font-weight: 500;
    width: calc(100% - 58px);
    text-align: left;
    font-size: 12px;
    line-height: 18px;
    padding: 2px 4px;
  }

  .active-history-tab {
    background-color: var(--bg-ds-surface-500) !important;
    border-radius: 4px;
  }

  .list-icons {
    width: 16px;
    height: 16px;
    margin-right: 10px;
  }
  .list-icons:hover {
    filter: invert(78%) sepia(86%) saturate(3113%) hue-rotate(177deg)
      brightness(100%) contrast(100%);
  }
  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }
  .threedot-icon-container:active {
    background-color: var(--bg-secondary-420) !important;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
  }
  .add-icon-container {
    visibility: hidden;
    display: flex;
  }
  .add-icon-container:hover {
  }

  .add-icon-container:active {
    /* background-color: var(--bg-secondary-420) !important; */
  }
  .add-item-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
  }
  .refresh-collection-loader-active {
    visibility: visible;
  }
  .threedot-icon-container:hover {
    background-color: var(--bg-tertiary-500);
  }

  .btn-primary {
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    padding-right: 5px;
    border-radius: 2px;
  }

  .btn-primary:hover {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
  }
  .btn-primary:hover .add-icon-container {
    visibility: visible;
  }
  .btn-primary:hover .box-line {
    visibility: visible;
  }

  .box-line {
    position: absolute;
    top: 0;
    bottom: 0%;
    left: 27.5px;
    width: 1px;

    z-index: 1;
  }

  .btn-primary:focus-visible {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    outline: none;
    border-radius: 4px;
    border: 2px solid var(--bg-ds-primary-300) !important;
  }
  .btn-primary:active {
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-50);
    outline: none;
    border-radius: 4px;
  }
  .btn-primary:focus-visible .add-icon-container {
    visibility: visible;
  }

  .renameInputFieldCollection {
    border: none;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    height: 24px;
    outline: none;
    border-radius: 4px !important;
    padding: 4px 2px;
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldCollection:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .main-collection {
    width: calc(100% - 55px);
  }
  .main-collection-mock {
    width: calc(100% - 100px);
  }
  .main-collection-sync {
    width: calc(100% - 119px);
  }
  .active-collection-tab {
    background-color: var(--bg-ds-surface-500) !important;
    border-radius: 4px;
  }
  .collection-collection-name {
    width: calc(100% - 10px);
    text-align: left;
  }
  .refresh-collection-loader {
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

  .shortcutIcon:hover {
    background: var(--right-border);
  }
  .sub-folders {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 40px;
    width: 1px;
    background-color: var(--bg-ds-surface-100);
  }
</style>
