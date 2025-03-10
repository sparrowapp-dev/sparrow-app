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
  import { CollectionAuth, CollectionNavigator } from "../components";
  import { CollectionNavigationTabEnum } from "@sparrow/common/types/workspace/collection";
  import { Button, Options } from "@sparrow/library/ui";
  import {
    AddRegular,
    ArrowSwapRegular,
    CaretDownFilled,
    CaretUpFilled,
    FolderAddRegular,
    FolderIcon,
    GraphIcon,
    SaveRegular,
    SocketIcon,
    SocketIoIcon,
    SyncIcon,
  } from "@sparrow/library/icons";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";

  /**
   * Role of user in active workspace
   */
  export let isWebApp = false;
  export let environmentVariables;
  export let onSaveCollection;
  export let onItemCreated;

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
  let totalWebSocket: number = 0;
  let totalSocketIo: number = 0;
  let totalGraphQl: number = 0;
  let showAddItemMenu = false;
  let collectionTabButtonWrapper: HTMLElement;
  let noOfColumns = 180;

  const rightClickContextMenu = () => {
    setTimeout(() => {
      showAddItemMenu = !showAddItemMenu;
    }, 100);
  };

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
      totalWebSocket = res.totalWebSocket;
      totalSocketIo = res.totalSocketIo;
      totalGraphQl = res.totalGraphQl;
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

  const handleInputDescription = (event: Event) => {
    const target = event.target as HTMLInputElement;
    onUpdateDescription(target.value);
  };

  const handleInputName = (event: Event) => {
    const target = event.target as HTMLInputElement;
    onRename(target.value, "");
  };
  const handleBlurName = (event: Event) => {
    const target = event.target as HTMLInputElement;
    onRename(target.value, "blur");
  };
  const handleSelectClick = (event: MouseEvent) => {
    const selectElement = document.getElementById(
      `add-item-collection-${collection.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showAddItemMenu = false;
    }
  };
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>
{#if showAddItemMenu}
  <Options
    xAxis={collectionTabButtonWrapper.getBoundingClientRect().right}
    yAxis={[
      collectionTabButtonWrapper.getBoundingClientRect().top - 0,
      collectionTabButtonWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={700}
    menuItems={[
      {
        onClick: () => {
          onItemCreated("folder", {
            collection: collection,
          });
        },
        displayText: "Add Folder",
        disabled: false,
        hidden: false,
        icon: FolderAddRegular,
        iconColor: "var(--icon-ds-neutral-50)",
      },
      {
        onClick: () => {
          onItemCreated("requestCollection", {
            collection: collection,
          });
        },
        displayText: `Add ${HttpRequestDefaultNameBaseEnum.NAME}`,
        disabled: false,
        hidden: false,
        icon: ArrowSwapRegular,
        iconColor: "var(--icon-ds-neutral-50)",
      },
      {
        onClick: () => {
          onItemCreated("socketioCollection", {
            collection: collection,
          });
        },
        displayText: `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden: false,
        icon: SocketIoIcon,
        iconColor: "var(--icon-ds-neutral-50)",
      },
      {
        onClick: () => {
          onItemCreated("websocketCollection", {
            collection: collection,
          });
        },
        displayText: "Add WebSocket",
        disabled: false,
        hidden: false,
        icon: SocketIcon,
        iconColor: "var(--icon-ds-neutral-50)",
      },

      {
        onClick: () => {
          onItemCreated("graphqlCollection", {
            collection: collection,
          });
        },
        displayText: `Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden: isWebApp ? true : false,
        icon: GraphIcon,
        iconColor: "var(--icon-ds-neutral-50)",
      },
    ]}
    {noOfColumns}
  />
{/if}
<div class="main-container d-flex h-100" style="overflow:auto;">
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
    class="my-collection d-flex flex-column w-100 z-3"
    style=" min-width: 450px"
  >
    <div class="d-flex gap-2 mb-4">
      <div class="d-flex flex-column flex-grow-1">
        <input
          type="text"
          required
          maxlength={100}
          id="renameInputFieldCollection"
          value={$tab?.name || ""}
          class="bg-transparent input-outline text-fs-18 border-0 text-left w-100 ps-2 py-0"
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

        <div
          class="d-flex me-2 flex-column justify-content-center"
          bind:this={collectionTabButtonWrapper}
        >
          <Button
            id={`add-item-collection-${collection?.id}`}
            disable={!isCollectionEditable}
            title={"New"}
            type={"primary"}
            onClick={() => {
              rightClickContextMenu();
            }}
            size="medium"
            startIcon={AddRegular}
            endIcon={showAddItemMenu ? CaretUpFilled : CaretDownFilled}
          />
        </div>
        <Button
          disable={$tab?.isSaved || !isCollectionEditable ? true : false}
          startIcon={SaveRegular}
          type={"secondary"}
          onClick={() => {
            onSaveCollection();
          }}
        />
      </div>
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
    <div class="d-flex pb-3">
      <CollectionNavigator
        collectionNavigation={$tab?.property?.collection?.state
          ?.collectionNavigation}
        {onUpdateCollectionState}
      />
    </div>
    {#if $tab?.property?.collection?.state?.collectionNavigation === CollectionNavigationTabEnum.OVERVIEW}
      <div
        class={`${
          !isSynced && collection?.activeSync ? "d-none" : "d-block"
        } align-items-center`}
      >
        <div class="d-flex gap-4 mb-4 ps-2">
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
          {#if !isWebApp}
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="fs-4 highlighted-number">{totalGraphQl}</span>
                <p style="font-size: 12px;" class="mb-0">GraphQL</p>
              </div>
            </div>
          {/if}
          <div class="d-flex align-items-center gap-2">
            <span class="fs-4 highlighted-number">{totalWebSocket}</span>
            <p style="font-size: 12px;" class="mb-0">WebSocket</p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="fs-4 highlighted-number">{totalSocketIo}</span>
            <p style="font-size: 12px;" class="mb-0">Socket.IO</p>
          </div>
        </div>
        <div class="d-flex align-items-start ps-0 h-100 z-0">
          <textarea
            disabled={!isCollectionEditable}
            id="updateCollectionDescField"
            value={$tab?.description || ""}
            class="bg-transparent border-0 text-fs-12 collection-area input-outline w-100 p-2"
            placeholder="Describe the collection. Add code examples and tips for your team to effectively use the APIs."
            on:input={handleInputDescription}
          />
        </div>
      </div>
    {:else}
      <CollectionAuth
        auth={$tab?.property?.collection?.auth}
        requestStateAuth={$tab?.property?.collection?.state
          ?.collectionAuthNavigation}
        onUpdateRequestAuth={onUpdateCollectionAuth}
        onUpdateRequestState={onUpdateCollectionState}
        {onUpdateEnvironment}
        {environmentVariables}
      />
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
  .collection-area {
    height: 300px;
  }

  .highlighted-number {
    color: var(--text-primary-300);
  }
  .text-plusButton {
    color: var(--text-primary-600) !important;
  }
</style>
