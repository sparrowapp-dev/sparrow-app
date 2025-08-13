<script lang="ts">
  import { HttpRequestDefaultNameBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  // Exports
  /**
   * Callback to update description
   */
  export let onUpdateDescription;
  /**
   * Callback to create api request
   */
  export let onCreateAPIRequest: (collection: any) => void;
  /**
   * Callback to sync collection from current branch
   */
  // export let onCollectionSynced: (
  //   collection: CollectionDocument,
  // ) => Promise<boolean | undefined>;
  /**
   * Callback to get last updated and total number of folders and requests in collection
   */
  export let getLastUpdatedAndCount: (collection: any) => Promise<any>;
  /**
   * Callback to refetch collection from local
   */
  // export let onCollectionRefetched: (collection: CollectionDocument) => void;
  /**
   * Callback to change the branch
   */
  // export let onBranchChanged: (
  //   collection: CollectionDocument,
  //   newBranch: string,
  // ) => void;
  /**
   * Callback to rename collection
   */
  export let isCollectionEditable;
  export let onRename;
  /**
   * The tab of the collection explorer
   */
  export let tab;
  /**
   * The collection
   */
  export let collection;

  export let onUpdateCollectionAuth;
  export let onUpdateCollectionState;
  export let onUpdateEnvironment;
  export let onSyncCollection;
  export let isSharedWorkspace = false;
  export let globalEnvInUse = null;
  export let isGuestUser = false;

  import { captureEvent } from "@app/utils/posthog/posthogConfig";

  /**
   * Icons and images
   */
  // import { GitBranchIcon } from "@sparrow/library/assets";
  // import { refreshIcon } from "@sparrow/library/assets";

  /**
   * Components
   */
  // import { Modal } from "@sparrow/library/ui";
  // import { Button } from "@sparrow/library/ui";
  // import { Tooltip } from "@sparrow/library/ui";
  // import { Select } from "@sparrow/library/forms";

  /**
   * Enums
   */
  // import { PERMISSION_NOT_FOUND_TEXT } from "@sparrow/common/constants/permissions.constant";
  // import type { CollectionDocument, TabDocument } from "@app/database/database";
  // import { WorkspaceRole } from "@sparrow/common/enums";
  import {
    CollectionAuth,
    CollectionAuthProfiles,
    CollectionNavigator,
  } from "../components";
  import { CollectionNavigationTabEnum } from "@sparrow/common/types/workspace/collection";
  import {
    Button,
    Dropdown,
    notifications,
    Options,
    Tag,
    Tooltip,
  } from "@sparrow/library/ui";
  import {
    AddRegular,
    ArrowRightRegular,
    ArrowSwapRegular,
    ArrowSyncRegular,
    BotRegular,
    CaretDownFilled,
    CaretUpFilled,
    CopyRegular,
    FolderAddRegular,
    FolderIcon,
    GraphIcon,
    HistoryRegular,
    OpenRegular,
    PlayCircleRegular,
    RecordStopRegular,
    SaveRegular,
    SocketIcon,
    SocketIoIcon,
    SyncIcon,
  } from "@sparrow/library/icons";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import { Input } from "@sparrow/library/forms";
  import { onDestroy, onMount } from "svelte";
  import {
    CollectionTypeBaseEnum,
    type CollectionAuthProifleBaseInterface as AuthProfileDto,
    type CollectionAuthProifleBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";
  import { getMethodStyle } from "@sparrow/common/utils";
  import { WorkspaceRole, WorkspaceType } from "@sparrow/common/enums";
  import { SparkleFilled } from "@sparrow/common/icons";

  /**
   * Role of user in active workspace
   */
  export let isWebApp = false;
  export let environmentVariables;
  export let onSaveCollection;
  export let onItemCreated;
  export let onUpdateRunningState;
  export let userRole;
  export let onCreateAuthProfile;
  export let onUpdateAuthProfile;
  export let onDeleteAuthProfile;
  export let onGenerateVariables;
  export let globalEnvironment;

  /**
   * Local variables
   */
  // let isBranchSwitchPopupOpen: boolean = false;
  // let branchSwitchLoader: boolean = false;
  // let newBranch: string = "";
  // let refreshCollectionLoader: boolean = false;
  let isSynced: boolean = false;
  let lastUpdated: string = "";
  let totalFolders: number = 0;
  let totalRequests: number = 0;
  let totalAiRequests: number = 0;
  let totalWebSocket: number = 0;
  let totalSocketIo: number = 0;
  let totalGraphQl: number = 0;
  let totalMockRequests: number = 0;
  let showAddItemMenu = false;
  let collectionTabButtonWrapper: HTMLElement;
  let noOfColumns = 180;
  let isCollectionSyncing = false;
  let authProfilesList: CollectionAuthProifleBaseInterface[] = [];
  $: authProfilesList = collection?.authProfiles || [];

  /**
   * Function to update isSynced, totalRequests and totalFolders, and lastUpdated
   */
  const updateLastUpdateAndCount = async () => {
    const res = await getLastUpdatedAndCount(collection);

    if (res) {
      isSynced = res.isSynced;
      lastUpdated = res.lastUpdated;
      totalFolders = res.totalFolders;
      totalRequests = res.totalRequests;
      totalAiRequests = res.totalAiRequests;
      totalWebSocket = res.totalWebSocket;
      totalSocketIo = res.totalSocketIo;
      totalGraphQl = res.totalGraphQl;
      totalMockRequests = res.totalMockRequests;
    }
  };

  /**
   * Check if collection is changed from other components
   */
  $: {
    if (collection) {
      updateLastUpdateAndCount();
    }
  }

  const handlecollection_collection_saved = ({ name }: { name: string }) => {
    captureEvent("collection_saved", {
      component: "CollectionExplorer",
      button_text: name,
      destination: name,
    });
  };

  const handleInputDescription = (event: Event) => {
    const target = event.target as HTMLInputElement;
    onUpdateDescription(target.value);
  };

  const handleInputName = (event: Event) => {
    // const target = event.target as HTMLInputElement;
    // onRename(target.value, "");
    onRename(event.detail, "");
  };
  const handleBlurName = (event: Event) => {
    // const target = event.target as HTMLInputElement;
    // onRename(target.value, "blur");
    onRename(event.detail, "blur");
  };
  const handleSelectClick = (event: MouseEvent) => {
    const selectElement = document.getElementById(
      `add-item-collection-${collection.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showAddItemMenu = false;
    }
  };
  const addButtonData = [
    {
      onclick: () => {
        onItemCreated("folder", {
          collection: collection,
        });
      },
      name: "Add Folder",
      icon: FolderAddRegular,
      iconColor: "var(--icon-ds-neutral-50)",
      iconSize: "14px",
    },
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
    {
      onclick: () => {
        onItemCreated("aiRequestCollection", {
          collection: collection,
        });
      },
      name: `Add AI Request`,
      icon: BotRegular,
      iconColor: "var(--icon-ds-neutral-50)",
      iconSize: "14px",
    },
  ];

  const addButtonDataMock = [
    {
      onclick: () => {
        onItemCreated("folder", {
          collection: collection,
        });
      },
      name: "Add Folder",
      icon: FolderAddRegular,
      iconColor: "var(--icon-ds-neutral-50)",
      iconSize: "14px",
    },
    {
      onclick: () => {
        onItemCreated("requestMockCollection", {
          collection: collection,
        });
      },
      name: `Add Mock ${HttpRequestDefaultNameBaseEnum.NAME}`,
      icon: ArrowSwapRegular,
      iconColor: "var(--icon-ds-neutral-50)",
      iconSize: "14px",
    },
  ];

  let isBackgroundClickable = true;

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();

      if (isCollectionEditable && $tab && !$tab.isSaved) {
        onSaveCollection();
      }
    }
  };

  const syncedTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);
    const months = Math.floor(days / 30); // Approximation

    if (seconds < 60) {
      return "just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days < 30) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (months) {
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      return ``;
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  export let onMockCollectionModelOpen;
  let isMockRunning = false;
  const mockRunningStatus = () => {
    onUpdateRunningState(collection.id, collection.workspaceId, {
      isMockCollectionRunning: !collection.isMockCollectionRunning,
    });
    isMockRunning = !isMockRunning;
  };
  export let currentWorkspace;

  // Auth Profile wrapper functions/handlers
  const handleOnCreateAuthProfile = async (authProfileData: AuthProfileDto) => {
    const response = await onCreateAuthProfile(collection, authProfileData);
    return response;
  };
  const handleOnUpdateAuthProfile = async (
    authId: string,
    updatedAuthProfileData: AuthProfileDto,
    isRequestForDefaultKey: boolean,
  ) => {
    const response = await onUpdateAuthProfile(
      collection,
      authId,
      updatedAuthProfileData,
      isRequestForDefaultKey,
    );
    return response;
  };
  const handleOnDeleteAuthProfile = async (authId: string) => {
    const response = await onDeleteAuthProfile(collection, authId);
    return response;
  };
</script>

<div class="main-container d-flex h-100">
  <!-- <Modal
    title={"Switch Branch?"}
    type={"danger"}
    width={"35%"}
    zIndex={1000}
    isOpen={isBranchSwitchPopupOpen}
    handleModalState={() => (isBranchSwitchPopupOpen = false)}
  >
    <div class="text-lightGray mb-1 sparrow-fs-14">
      <p>
        Switching branch will close all the open tabs! Do you really want to
        switch branch?
      </p>
    </div>
    <div
      class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    >
      <Button
        disable={branchSwitchLoader}
        title={"Cancel"}
        textStyleProp={"font-size: var(--base-text)"}
        type={"secondary"}
        loader={false}
        onClick={() => (isBranchSwitchPopupOpen = false)}
      />

      <Button
        disable={branchSwitchLoader}
        title={"Switch"}
        textStyleProp={"font-size: var(--base-text)"}
        loaderSize={18}
        type={"danger"}
        loader={branchSwitchLoader}
        onClick={() => {
          onBranchChanged(collection, newBranch);
        }}
      />
    </div>
  </Modal> -->
  <div
    class="my-collection d-flex flex-column w-100 p-3 h-100"
    style=" min-width: 450px"
  >
    <div class="d-flex gap-2 pb-4">
      <div class="d-flex flex-column flex-grow-1">
        <!-- <input
          type="text"
          required
          maxlength={100}
          id="renameInputFieldCollection"
          value={$tab?.name || ""}
          class="bg-transparent input-outline text-fs-18 border-0 text-left w-100 ps-2 py-0"
          disabled={!isCollectionEditable}
          on:input={handleInputName}
          on:blur={handleBlurName}
        /> -->

        <Input
          type={"text"}
          size={"medium"}
          maxlength={500}
          width={"398px"}
          id={"renameInputFieldCollection"}
          value={$tab?.name || ""}
          variant={"inline"}
          placeholder={""}
          disabled={!isCollectionEditable}
          on:input={handleInputName}
          on:blur={handleBlurName}
        />

        <!-- {#if tab?.activeSync}
          <div class="d-flex">
            <Select
              isError={false}
              iconRequired={true}
              icon={GitBranchIcon}
              borderRounded={true}
              search={true}
              borderType={"none"}
              borderActiveType={"all"}
              headerTheme={"transparent"}
              bodyTheme={"dark"}
              headerHighlight={"hover-active"}
              borderHighlight={"hover-active"}
              searchText={"Search Branch"}
              searchErrorMessage={"No result found."}
              id={"git-branch-select"}
              data={[
                ...(collection?.branches ? collection.branches : []).map(
                  (elem) => {
                    elem.id = elem.name;
                    return elem;
                  },
                ),
                {
                  name: collection?.primaryBranch,
                  id: collection?.primaryBranch,
                },
              ].filter(
                (value, index, self) =>
                  index === self.findIndex((t) => t.id === value.id),
              )}
              titleId={collection?.currentBranch
                ? collection?.currentBranch
                : collection?.primaryBranch}
              onclick={(value) => onBranchChanged(collection, value)}
              maxBodyHeight={"150px"}
              minHeaderWidth={"190px"}
              maxHeaderWidth={"250px"}
            >
              <div slot="pre-select">
                <div class="d-flex justify-content-between p-2">
                  <small class="text-textColor fw-normal">Switch branches</small
                  >
                  <small class="text-textColor fw-normal"
                    >{[
                      ...(collection.branches ? collection.branches : []).map(
                        (elem) => {
                          elem.id = elem.name;
                          return elem;
                        },
                      ),
                      {
                        name: collection?.primaryBranch,
                        id: collection?.primaryBranch,
                      },
                    ].filter(
                      (value, index, self) =>
                        index === self.findIndex((t) => t.id === value.id),
                    ).length} branches</small
                  >
                </div>
              </div>
              <div slot="post-select" class="d-none">
                <hr class="mb-2 mt-2" />
                <p class="sparrow-fs-12 text-textColor mb-2 ps-2 pe-2">
                  View all Branches
                </p>
              </div>
            </Select>
            <button
              class="ms-2 p-1 border-0 rounded d-flex justify-content-center align-items-center btn btn-dark"
              on:click={() => {
                onCollectionRefetched(collection);
              }}
            >
              <img src={refreshIcon} alt="refetch" />
            </button>
          </div>
          <div class="pt-2 ps-2 d-flex align-items-center">
            {#if currentWorkspace?.users}
                <div class="d-flex">
                  <UserProfileList
                    width={25}
                    height={25}
                    borderRadius={24}
                    users={currentWorkspace.users}
                    maxProfiles={3}
                    classProp="position-absolute"
                  />
                </div>
              {/if}
            <div class="ps-2">
              <p class="sparrow-fs-12 mb-0">
                <span class="text-textColor"> Last updated on: </span>
                {lastUpdated}
                <span class="text-textColor">by:</span>
                {collection?.updatedBy?.name}
              </p>
            </div>
          </div>
        {/if} -->
      </div>
      {#if !(isSharedWorkspace && currentWorkspace?.workspaceType === WorkspaceType.PUBLIC)}
        <div class="d-flex flex-row">
          <!-- {#if collection?.activeSync}
          <div class="d-flex flex-column justify-content-center">
            <Button
              disable={!isCollectionEditable || refreshCollectionLoader}
              title={`Sync Collection`}
              type={"secondary"}
              loader={refreshCollectionLoader}
              buttonClassProp={`me-2`}
              onClick={async () => {
                refreshCollectionLoader = true;
                if (await onCollectionSynced(collection)) {
                  isSynced = true;
                } else {
                  isSynced = false;
                }
                refreshCollectionLoader = false;
              }}
            />
          </div>
        {/if} -->
          {#if collection?.activeSync}
            <div class="me-2">
              <Button
                id={`sync-collection`}
                disable={!isCollectionEditable || isCollectionSyncing}
                loader={isCollectionSyncing}
                title={"Sync Collection"}
                type={"secondary"}
                onClick={async () => {
                  isCollectionSyncing = true;
                  await onSyncCollection(collection.id);
                  isCollectionSyncing = false;
                }}
                size="medium"
                startIcon={ArrowSyncRegular}
              />
            </div>
          {/if}

          <!-- Show save button only for overview tab, not for collection auth -->
          <div style="margin-right: 8px;">
            {#if $tab?.property?.collection?.state?.collectionNavigation !== CollectionNavigationTabEnum.AUTH_PROFILES}
              <Button
                disable={$tab?.isSaved || !isCollectionEditable
                  ? true
                  : false || isSharedWorkspace}
                startIcon={SaveRegular}
                type={"secondary"}
                size="medium"
                onClick={() => {
                  onSaveCollection();
                  handlecollection_collection_saved({
                    name: "Collection Saved",
                  });
                }}
              />
            {/if}
          </div>

          {#if !isGuestUser}
            <div style="margin-right: 8px;">
              <Tooltip
                title={"Generate Variables"}
                subtext={globalEnvInUse?.collectionName
                  ? `You're already generating variables for "${globalEnvInUse?.collectionName}"  collection. Please finish or close that task before starting another.`
                  : "Use AI to quickly generate env variables by analyzing every API request in your collection."}
                placement={"bottom-center"}
                size="medium"
              >
                <div
                  style={`${globalEnvInUse?.collectionName ? "" : "border: 2px solid var(--border-ds-primary-400); border-radius:8.5px;"} `}
                >
                  <Button
                    disable={globalEnvInUse?.collectionName ? true : false}
                    startIcon={SparkleFilled}
                    title={"Generate Variables"}
                    size="medium"
                    type={"secondary"}
                    onClick={async () => {
                      onGenerateVariables(
                        collection?.id,
                        globalEnvironment,
                        collection?.name,
                      );
                    }}
                  />
                </div>
              </Tooltip>
            </div>
          {/if}

          <div
            class="d-flex me-2 flex-column justify-content-center"
            bind:this={collectionTabButtonWrapper}
          >
            <Dropdown
              zIndex={600}
              buttonId={`add-item-collection`}
              bind:isMenuOpen={showAddItemMenu}
              bind:isBackgroundClickable
              options={collection?.collectionType ===
              CollectionTypeBaseEnum.MOCK
                ? addButtonDataMock
                : addButtonData}
              horizontalPosition="left"
            >
              <Button
                id={`add-item-collection`}
                disable={!isCollectionEditable ||
                  collection?.activeSync ||
                  isSharedWorkspace}
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
        </div>
      {/if}
    </div>
    <!-- {#if collection?.activeSync && !isSynced}
      <div
        class={`"d-flex"
          } flex-column align-items-center flex-grow-1 justify-content-center pt-5`}
      >
        <div class="d-flex flex-column align-items-center">
          <div class="text-secondary pb-3 sparrow-fs-16">
            Branch Information Unavailable
          </div>
          <div class="text-secondary pb-3 sparrow-fs-12">
            the current branch {collection?.currentBranch
              ? collection?.currentBranch
              : collection?.currentBranch} is not available
          </div>
          <div class="text-secondary sparrow-fs-12">
            To resolve this issue, please follow these steps:
          </div>
          <ol type="1">
            <li class="text-secondary sparrow-fs-12">
              Run the project to initialize the development environment.
            </li>
            <li class="text-secondary sparrow-fs-12">
              Click on ‘Sync Collection’ button to synchronize the branch
              information.
            </li>
          </ol>
          <Button
            disable={!isCollectionEditable || refreshCollectionLoader}
            title={`Sync Collection`}
            type="primary"
            loader={refreshCollectionLoader}
            buttonClassProp={`me-2`}
            onClick={async () => {
              refreshCollectionLoader = true;
              onCollectionSynced(collection);
              refreshCollectionLoader = false;
            }}
          />
        </div>
      </div>
    {/if} -->
    {#if collection?.collectionType === CollectionTypeBaseEnum.MOCK}
      <div class="mock-url-section d-flex flex-column">
        <div
          class="d-flex align-items-center justify-content-between"
          style="width: 100%;"
        >
          <div class="">
            <p class="text-ds-font-size-16" style="margin-bottom: 0px;">
              Mock URL
            </p>
            <p
              class="text-ds-font-size-12"
              style="color:var(--text-ds-neutral-300); margin-bottom: 0px;"
            >
              Use this mock URL to test your requests without hitting the real
              API.
            </p>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <div class="d-flex justify-content-center">
              <Tag
                size="medium"
                type={collection?.isMockCollectionRunning ? "green" : "grey"}
                text={collection?.isMockCollectionRunning
                  ? "Running"
                  : "Inactive"}
              />
            </div>
            <Button
              size="small"
              type={collection?.isMockCollectionRunning ? "danger" : "primary"}
              title={collection?.isMockCollectionRunning
                ? "Stop Mock"
                : "Run Mock"}
              onClick={() => {
                mockRunningStatus();
              }}
              startIcon={collection?.isMockCollectionRunning
                ? RecordStopRegular
                : PlayCircleRegular}
              disable={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
                isSharedWorkspace}
            />
          </div>
        </div>
        <div class="d-flex">
          <div
            class="d-flex justify-content-center align-items-center px-2 py-1 text-ds-font-size-14"
            style="
background-color: var(--bg-ds-surface-600);
border-radius: 4px;
gap: 16px;
margin-right: 8px;

"
          >
            <span
              class="d-inline-block text-truncate"
              style="max-width: 400px;"
            >
              {collection?.mockCollectionUrl}
            </span>
          </div>
          <Button
            size="small"
            type={"outline-secondary"}
            title="Copy"
            onClick={() => {
              navigator.clipboard.writeText(collection?.mockCollectionUrl);
              notifications.success("Link copied to clipboard.");
            }}
            startIcon={CopyRegular}
          />
          <Button
            size="small"
            type={"link-primary"}
            title="Learn how to use mock URL"
            onClick={() => {
              onMockCollectionModelOpen(collection?.mockCollectionUrl);
            }}
            endIcon={OpenRegular}
          />
        </div>
      </div>
      <br />
      <!-- WRAPPER -->
      <div class="d-flex flex-column gap-3 h-100" style="overflow:auto;">
        <div
          class="mock-url-section d-flex flex-column"
          style="flex-basis:50%; overflow:auto;"
        >
          <div class="d-flex align-items-center justify-content-between">
            <p class="text-ds-font-size-16" style="margin-bottom: 0px;">
              Overview
            </p>
          </div>
          <div
            class={`d-block
        align-items-center`}
            style="width: 100%;"
          >
            <div class="d-flex gap-4">
              <div class="d-flex align-items-center gap-2">
                <span class="fs-4 highlighted-number">{totalFolders}</span>
                <p style="font-size: 12px;" class="mb-0">Folders</p>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="fs-4 highlighted-number">{totalMockRequests}</span>
                <p style="font-size: 12px;" class="mb-0">
                  {HttpRequestDefaultNameBaseEnum.NAME}
                </p>
              </div>
            </div>
            <hr style="margin: 0.5rem 0;" />
          </div>
          <div
            class="d-flex w-100 align-items-start ps-0 h-100 z-0 flex-1"
            style="overflow:auto;"
          >
            <textarea
              disabled={!isCollectionEditable}
              id="updateCollectionDescField"
              value={$tab?.description || ""}
              class=" border-0 text-fs-12 collection-area {!isSharedWorkspace
                ? 'input-outline'
                : ''} w-100 p-2"
              placeholder={isSharedWorkspace
                ? "No description added."
                : "Add Description"}
              on:input={handleInputDescription}
              style="background-color: {isSharedWorkspace
                ? 'var(--bg-ds-surface-900)'
                : 'var(--bg-ds-surface-600)'};"
            />
          </div>
        </div>
        {#if !(isSharedWorkspace && currentWorkspace?.workspaceType === WorkspaceType.PUBLIC)}
          <div
            class="d-flex gap-3"
            style="width: 100%; flex-basis:50%;  overflow:auto;"
          >
            <div class="mock-url-section d-flex flex-column" style="flex: 1;">
              <div
                class="d-flex align-items-center justify-content-between"
                style="width: 100%;"
              >
                <div class="text-ds-font-size-16" style="margin-bottom: 0px;">
                  Details
                </div>
                <div class="d-flex gap-2 align-items-center">
                  <Tooltip title={"Coming Soon"} placement={"top-center"}>
                    <Button
                      size="small"
                      type={"link-primary"}
                      title="Edit Configuration"
                      disable={true}
                      onClick={() => {}}
                      endIcon={ArrowRightRegular}
                    />
                  </Tooltip>
                </div>
              </div>
              <div
                class="d-flex align-items-center justify-content-center text-ds-font-size-12"
                style="color: var(--text-ds-neutral-300); margin:auto;"
              >
                Coming Soon
              </div>
            </div>
            <div
              class="mock-url-section d-flex flex-column"
              style="flex: 1; height: 100%; display: flex; flex-direction: column;"
            >
              <div
                class="d-flex align-items-center justify-content-between"
                style="width: 100%;"
              >
                <div class="text-ds-font-size-16" style="margin-bottom: 0px;">
                  Recent Requests
                </div>
                <div class="d-flex gap-2 align-items-center">
                  <Button
                    size="small"
                    type={"link-primary"}
                    title="View All"
                    disable={false}
                    onClick={() => {
                      onItemCreated("mockHistory", {
                        collection: collection,
                      });
                    }}
                    endIcon={ArrowRightRegular}
                  />
                </div>
              </div>
              <div
                class="d-flex flex-column flex-1"
                style="height: 100%; margin:auto; width: 100%; overflow:auto;"
              >
                <div class="recent-requests-list custom-scrollbar">
                  {#if collection?.mockRequestHistory && collection.mockRequestHistory.length > 0}
                    {#each collection.mockRequestHistory
                      .slice()
                      .reverse()
                      .slice(0, 5) as request}
                      <div
                        class="request-item d-flex justify-content-between align-items-center py-2 mb-2"
                      >
                        <div class="d-flex align-items-center overflow-hidden">
                          <span
                            class="method-label text-{getMethodStyle(
                              request?.method,
                            )} me-2"
                            >{request?.method?.toUpperCase() === "DELETE"
                              ? "DEL"
                              : request?.method?.toUpperCase()}</span
                          >
                          <span class="request-title">{request.name}</span>
                          <span
                            class="request-url text-ds-font-size-12 ms-2"
                            style="color: var(--text-ds-neutral-300);"
                            >{request.url}</span
                          >
                        </div>
                        <span
                          class="request-time text-ds-font-size-12"
                          style="color: var(--text-ds-neutral-100);"
                          >{syncedTimeAgo(request.timestamp)}</span
                        >
                      </div>
                    {/each}
                  {:else}
                    <div
                      class="d-flex flex-column align-items-center justify-content-center text-ds-font-size-12 py-3"
                      style="color: var(--text-ds-neutral-300); height: 100%; width: 100%;"
                    >
                      <HistoryRegular
                        size={"32px"}
                        color={"var(--text-ds-neutral-500)"}
                      />
                      <div class="text-center">
                        No recent requests yet. Run a request in this collection
                        to see it here.
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="d-flex pb-3" style="justify-content: space-between;">
        <CollectionNavigator
          collectionNavigation={$tab?.property?.collection?.state
            ?.collectionNavigation}
          {onUpdateCollectionState}
        />
        {#if collection?.activeSync}
          <div class="d-flex" style="align-items: center;">
            <ArrowSyncRegular size="12px" />
            <p
              style="margin-bottom: 0px; margin-left:4px; color:var(--text-ds-neutral-200)"
              class="text-ds-font-size-12"
            >
              Synced {syncedTimeAgo(collection?.syncedAt)}
            </p>
          </div>
        {/if}
      </div>
      {#if $tab?.property?.collection?.state?.collectionNavigation === CollectionNavigationTabEnum.OVERVIEW}
        <div
          class={`d-block
        align-items-center`}
        >
          <div class="d-flex gap-4 ps-2">
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4 highlighted-number">{totalFolders}</span>
              <p style="font-size: 12px;" class="mb-0">Folders</p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4 highlighted-number">{totalRequests}</span>
              <p style="font-size: 12px;" class="mb-0">
                {HttpRequestDefaultNameBaseEnum.NAME}
              </p>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="fs-4 highlighted-number">{totalGraphQl}</span>
                <p style="font-size: 12px;" class="mb-0">GraphQL</p>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4 highlighted-number">{totalWebSocket}</span>
              <p style="font-size: 12px;" class="mb-0">WebSocket</p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4 highlighted-number">{totalSocketIo}</span>
              <p style="font-size: 12px;" class="mb-0">Socket.IO</p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4 highlighted-number">{totalAiRequests}</span>
              <p style="font-size: 12px;" class="mb-0">AI Requests</p>
            </div>
          </div>
          <hr style="margin-bottom: 12px;" />
          <div class="d-flex align-items-start ps-0 h-100 z-0">
            <textarea
              disabled={!isCollectionEditable}
              id="updateCollectionDescField"
              value={$tab?.description || ""}
              class=" border-0 text-fs-12 collection-area {!isSharedWorkspace
                ? 'input-outline'
                : ''} w-100 p-2"
              placeholder={isSharedWorkspace
                ? "No description added."
                : "Describe this collection and share code examples or usage tips for the APIs."}
              on:input={handleInputDescription}
              style="background-color: {isSharedWorkspace
                ? 'var(--bg-ds-surface-900)'
                : 'var(--bg-ds-surface-600)'};"
            />
          </div>
        </div>
      {:else if $tab?.property?.collection?.state?.collectionNavigation === CollectionNavigationTabEnum.AUTH}
        <CollectionAuth
          auth={$tab?.property?.collection?.auth}
          requestStateAuth={$tab?.property?.collection?.state
            ?.collectionAuthNavigation}
          onUpdateRequestAuth={onUpdateCollectionAuth}
          onUpdateRequestState={onUpdateCollectionState}
          {onUpdateEnvironment}
          {environmentVariables}
        />
      {:else}
        <CollectionAuthProfiles
          {authProfilesList}
          onCreateAuthProfile={handleOnCreateAuthProfile}
          onUpdateAuthProfile={handleOnUpdateAuthProfile}
          onDeleteAuthProfile={handleOnDeleteAuthProfile}
          onUpdateRequestState={onUpdateCollectionState}
        />
      {/if}
    {/if}
  </div>
  <!-- <div
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
  </div> -->
</div>

<style>
  .input-outline {
    border-radius: 0%;
  }
  textarea {
    outline-color: var(--text-primary-600);
    border: none;
    border-radius: 4px !important;
    color: var(--text-secondary-1000);
    height: 100%;
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

  .highlighted-number {
    color: var(--text-primary-300);
  }
  .text-plusButton {
    color: var(--text-primary-600) !important;
  }

  .mock-url-section {
    align-items: flex-start;
    padding: 12px;
    gap: 12px;
    border: 1px solid var(--border-ds-surface-100);
    border-radius: 8px;
  }
  .recent-requests-list {
    width: 100%;
    overflow-y: auto;
    padding-right: 4px;
  }

  .request-item {
    padding: 4px 8px;
    border-radius: 4px;
    background-color: var(--bg-ds-surface-600);
  }
  .method-label {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    min-width: 45px;
    text-align: center;
  }

  .request-title {
    font-size: 12px;
    white-space: nowrap;
    color: var(--text-ds-neutral-50);
    text-overflow: ellipsis;
    max-width: 170px;
    overflow: hidden;
  }

  .request-url {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
</style>
