<script lang="ts">
  // Exports
  /**
   * Callback to update description
   */
  export let onUpdateDescription: (
    collection: CollectionDocument,
    newDescription: string,
  ) => void;
  /**
   * Callback to create api request
   */
  export let onCreateAPIRequest: (collection: CollectionDocument) => void;
  /**
   * Callback to sync collection from current branch
   */
  export let onCollectionSynced: (
    collection: CollectionDocument,
  ) => Promise<boolean | undefined>;
  /**
   * Callback to get last updated and total number of folders and requests in collection
   */
  export let getLastUpdatedAndCount: (collection: CollectionDto) => Promise<{
    isSynced: boolean;
    totalFolders: number;
    totalRequests: number;
    lastUpdated: string;
  }>;
  /**
   * Callback to refetch collection from local
   */
  export let onCollectionRefetched: (collection: CollectionDocument) => void;
  /**
   * Callback to change the branch
   */
  export let onBranchChanged: (
    collection: CollectionDocument,
    newBranch: string,
  ) => void;
  /**
   * Callback to rename collection
   */
  export let onRename: (
    collection: CollectionDocument,
    newBranch: string,
  ) => void;
  /**
   * The tab of the collection explorer
   */
  export let tab: TabDocument;
  /**
   * The collection
   */
  export let collection: CollectionDocument;

  /**
   * Icons and images
   */
  import { GitBranchIcon } from "@sparrow/library/assets";
  import {refreshIcon} from "@sparrow/library/assets";

  /**
   * Components
   */
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";
  import { Select } from "@sparrow/library/forms";

  /**
   * Enums
   */
  import { PERMISSION_NOT_FOUND_TEXT } from "@sparrow/common/constants/permissions.constant";
  import type { CollectionDocument, TabDocument } from "@app/database/database";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import type { CollectionDto } from "@sparrow/common/types/workspace";

  /**
   * Role of user in active workspace
   */
  export let userRole;

  /**
   * Local variables
   */
  let isBranchSwitchPopupOpen: boolean = false;
  let branchSwitchLoader: boolean = false;
  let newBranch: string = "";
  let refreshCollectionLoader: boolean = false;
  let isSynced: boolean = false;
  let lastUpdated: string = "";
  let totalFolders: number = 0;
  let totalRequests: number = 0;

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

  const onRenameInputKeyPress = () => {
    const inputField = document.getElementById(
      "renameInputFieldCollection",
    ) as HTMLInputElement;
    inputField.blur();
  };

  const resetInputField = () => {
    const inputField = document.getElementById(
      "renameInputFieldCollection",
    ) as HTMLInputElement;
    inputField.value = collection?.name;
  };
</script>

<div class="main-container d-flex h-100" style="overflow:auto;">
  <Modal
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
        type={"dark"}
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
  </Modal>
  <div
    class="my-collection d-flex flex-column w-100 z-3"
    style=" min-width: 450px"
  >
    <Tooltip
      title={PERMISSION_NOT_FOUND_TEXT}
      show={userRole === WorkspaceRole.WORKSPACE_VIEWER}
    >
      <div class="d-flex gap-2 mb-4">
        <div class="d-flex flex-column flex-grow-1">
          <input
            type="text"
            required
            maxlength={100}
            id="renameInputFieldCollection"
            value={collection?.name || "Collection Doesn't Exist."}
            class="bg-transparent input-outline text-fs-18 border-0 text-left w-100 ps-2 py-0"
            disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
              tab?.activeSync}
            on:blur={(event) => {
              const newValue = event?.target?.value?.trim();
              const previousValue = tab.name;
              if (newValue === "") {
                resetInputField();
              } else if (newValue !== previousValue) {
                onRename(collection, newValue);
              }
            }}
            on:keydown={(event) => {
              if (event.key === "Enter") {
                onRenameInputKeyPress();
              }
            }}
          />
          {#if tab?.activeSync}
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
                    <small class="text-textColor fw-normal"
                      >Switch branches</small
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
              <!-- {#if currentWorkspace?.users}
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
              {/if} -->
              <div class="ps-2">
                <p class="sparrow-fs-12 mb-0">
                  <span class="text-textColor"> Last updated on: </span>
                  {lastUpdated}
                  <span class="text-textColor">by:</span>
                  {collection?.updatedBy?.name}
                </p>
              </div>
            </div>
          {/if}
        </div>
        <div class="d-flex flex-row">
          {#if collection?.activeSync}
            <div class="d-flex flex-column justify-content-center">
              <Button
                disable={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
                  refreshCollectionLoader}
                title={`Sync Collection`}
                type="dark"
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
          {/if}

          <div class="d-flex flex-column justify-content-center">
            {#if !collection?.activeSync || isSynced}
              <button
                disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
                class="btn add-button rounded mx-1 border-0 text-align-right py-1"
                style="max-height:60px; width:200px; margin-top: -2px;"
                on:click={() => onCreateAPIRequest(collection)}
                >New Request</button
              >
            {/if}
          </div>
        </div>
      </div>
    </Tooltip>
    {#if collection?.activeSync && !isSynced}
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
            disable={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
              refreshCollectionLoader}
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
    {/if}
    <div
      class={`${
        !isSynced && collection?.activeSync ? "d-none" : "d-block"
      } align-items-center`}
    >
      <div class="d-flex gap-4 mb-4 ps-2">
        <div class="d-flex align-items-center gap-2">
          <span class="fs-4 highlighted-number">{totalRequests}</span>
          <p style="font-size: 12px;" class="mb-0">API Requests</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="fs-4 highlighted-number">{totalFolders}</span>
          <p style="font-size: 12px;" class="mb-0">Folder</p>
        </div>
      </div>
      <div class="d-flex align-items-start ps-0 h-100">
        <textarea
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
            collection?.activeSync}
          id="updateCollectionDescField"
          value={collection?.description || ""}
          class="bg-transparent border-0 text-textColor text-fs-12 collection-area input-outline w-100 p-2"
          placeholder="Describe the collection. Add code examples and tips for your team to effectively use the APIs."
          on:blur={(event) => {
            if (collection?.description !== event.target.value) {
              onUpdateDescription(collection, event.target.value);
            }
          }}
        />
      </div>
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
    border-radius: 8px !important;
  }
  textarea::placeholder {
    color: var(--text-color);
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
