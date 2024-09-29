<script lang="ts">
  import doubleangleLeft from "@deprecate/assets/doubleangleLeft.svg";
  import FilterIcon from "@deprecate/assets/filter.svelte";
  import plusIcon from "@deprecate/assets/plus-white.svg";
  import CreateRequest from "@deprecate/assets/create_request.svg";
  import CreateCollection from "@deprecate/assets/collections-faded.svg";

  import { Events, WorkspaceRole } from "@deprecate/utils/enums";
  import { Dropdown } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import type {
    Folder,
    Request as RequestType,
  } from "@deprecate/utils/interfaces/request.interface";

  import { onDestroy } from "svelte";
  import {
    CollectionIcon,
    DoubleArrowIcon,
    GithubIcon,
    SocketIcon,
    TreeIcon,
    VectorIcon,
    BubbleIcon,
  } from "@sparrow/library/icons";
  import { WithButton } from "@sparrow/workspaces/common/hoc";
  import { createDeepCopy } from "@deprecate/utils/helpers";
  import { Input } from "@sparrow/library/forms";
  import { open } from "@tauri-apps/plugin-shell";
  import constants from "@app/constants/constants";
  import { Tooltip } from "@sparrow/library/ui";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import {
    CollectionList,
    EnvironmentList,
  } from "@sparrow/workspaces/features";
  import { TestflowList } from "../../testflow-list";
  import { TFDefaultEnum } from "@sparrow/common/types/workspace/testflow";
  export let appVersion;

  export let collectionList: Observable<CollectionDocument[]>;
  export let showImportCollectionPopup: () => void;
  export let showImportCurlPopup: () => void;
  export let onItemCreated: (entityType: string, args: any) => void;
  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
  export let onItemOpened: (entityType: string, args: any) => void;

  export let onBranchSwitched: (collection: CollectionDocument) => void;
  export let onRefetchCollection: (
    workspaceId: string,
    collection: CollectionDocument,
  ) => void;
  /**
   * path of the active tab - collection id, folder id, workspace id
   */
  export let activeTabPath;
  /**
   * id of the active tab
   */
  export let activeTabId;
  export let userRoleInWorkspace;
  export let currentWorkspace: Observable<WorkspaceDocument>;
  export let leftPanelController: {
    leftPanelCollapse: boolean;
    handleCollapseCollectionList: () => void;
  };
  export let githubRepo;
  /**
   * Flag to show app version
   */
  export let isAppVersionVisible = true;

  /**
   * Flag to check is user iu guest user
   */
  export let isGuestUser = false;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  export let scrollList;

  export let environments;

  export let onCreateEnvironment;

  export let onOpenGlobalEnvironment;

  export let onDeleteEnvironment;

  export let onUpdateEnvironment;

  export let onOpenEnvironment;

  export let onSelectEnvironment;

  export let onCreateTestflow;

  export let testflows;

  export let onDeleteTestflow;
  export let onUpdateTestflow;
  export let onOpenTestflow;

  let runAnimation: boolean = true;
  let showfilterDropdown: boolean = false;
  let collectionListDocument: CollectionDocument[];
  let searchData: string = "";
  let addButtonMenu: boolean = false;
  let activeWorkspace: WorkspaceDocument;
  let currentWorkspaceId;
  currentWorkspace.subscribe((value) => {
    if (value?._data) {
      currentWorkspaceId = value._data._id;
    }
  });

  export let isExpandCollection = false;
  export let isExpandEnvironment = false;
  export let isExpandTestflow = false;

  let isGithubStarHover = false;
  const externalSparrowGithub = constants.SPARROW_GITHUB;

  let collectionFilter: any = [];
  /**
   * @description - performs searching on a single collection
   */
  const searchCollectionHelper: (searchText: string, tree: any) => any = (
    searchText,
    tree,
  ) => {
    if (tree.name.toLowerCase().includes(searchText.toLowerCase())) {
      return tree;
    }

    // Recursively search through the collection
    if (tree && tree?.items?.length) {
      let response = [];
      for (let j = 0; j < tree.items.length; j++) {
        const res = searchCollectionHelper(searchText, tree.items[j]);
        if (res) {
          response.push(res);
        }
      }
      if (response.length) {
        let item = createDeepCopy(tree);
        item.items = response;
        return item;
      } else {
        return 0;
      }
    }
    return 0;
  };

  /**
   * @description - searches data from the list of collections
   */
  const searchCollection: (
    searchText: string,
    collectionData: any[],
  ) => void = (searchText, collectionData) => {
    let response = [];
    for (let i = 0; i < collectionData.length; i++) {
      const res = searchCollectionHelper(searchText, collectionData[i]);
      if (res) {
        response.push(res);
      }
    }
    return response;
  };

  /**
   * Handle searching and filtering
   */
  const handleSearch = () => {
    collectionFilter = searchCollection(searchData, collectionListDocument);
  };
  $: {
    if (currentWorkspace) {
      currentWorkspace.subscribe((value) => {
        activeWorkspace = value;
        collectionListDocument = collectionListDocument?.filter(
          (value) => value.workspaceId === activeWorkspace?._id,
        );
      });
    }
  }
  $: {
    if (collectionList) {
      collectionList.subscribe((value) => {
        collectionListDocument = value;
        collectionListDocument = collectionListDocument?.filter(
          (value) => value.workspaceId === activeWorkspace?._id,
        );
        collectionFilter = searchCollection(searchData, collectionListDocument);
      });
    }
  }

  onDestroy(() => {});

  const addButtonData = isGuestUser
    ? [
        {
          name: "Add New API",
          icon: VectorIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "12px",
          onclick: () => onItemCreated("request", {}),
        },
        {
          name: "Add Collection",
          icon: CollectionIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "13px",
          onclick: () => {
            onItemCreated("collection", {
              workspaceId: currentWorkspaceId,
              collection: collectionList,
            });
            isExpandCollection = true;
          },
        },
        {
          name: "Import cURL",
          icon: BubbleIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            MixpanelEvent(Events.IMPORT_CURL, {
              source: "curl import popup",
            });
            showImportCurlPopup();
          },
        },
        {
          name: "Add WebSocket",
          icon: SocketIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            onItemCreated("web-socket", {});
            MixpanelEvent(Events.Add_WebSocket);
          },
        },
        {
          name: `Add ${TFDefaultEnum.FULL_NAME}`,
          icon: TreeIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            onCreateTestflow();
            MixpanelEvent(Events.LeftPanel_Plus_Icon);
          },
        },
      ]
    : [
        {
          name: "Add New API",
          icon: VectorIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "12px",
          onclick: () => onItemCreated("request", {}),
        },
        {
          name: "Add Collection",
          icon: CollectionIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "13px",
          onclick: () => {
            showImportCollectionPopup();
            isExpandCollection = true;
          },
        },
        {
          name: "Import cURL",
          icon: BubbleIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            MixpanelEvent(Events.IMPORT_CURL, {
              source: "curl import popup",
            });
            showImportCurlPopup();
          },
        },
        {
          name: "Add WebSocket",
          icon: SocketIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => onItemCreated("web-socket", {}),
        },
        {
          name: `Add ${TFDefaultEnum.FULL_NAME}`,
          icon: TreeIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            onCreateTestflow();
            MixpanelEvent(Events.LeftPanel_Plus_Icon);
          },
        },
      ];

  const toggleExpandCollection = () => {
    isExpandCollection = !isExpandCollection;
  };

  const toggleExpandEnvironment = () => {
    isExpandEnvironment = !isExpandEnvironment;
  };
  const toggleExpandTestflow = () => {
    isExpandTestflow = !isExpandTestflow;
  };
</script>

{#if leftPanelController.leftPanelCollapse}
  <div>
    <button
      class="d-flex align-items-center justify-content-center border-0 angleRight w-16 position-absolute {leftPanelController.leftPanelCollapse
        ? 'd-block'
        : 'd-none'}"
      style="left:52px; bottom: 15px; width: 20px; height:20px; z-index: {leftPanelController.leftPanelCollapse
        ? '2'
        : '0'}"
      on:click={() => {
        leftPanelController.leftPanelCollapse =
          !leftPanelController.leftPanelCollapse;
        leftPanelController.handleCollapseCollectionList();
      }}
    >
      <span
        style="transform: rotate(180deg);"
        class="position-relative d-flex align-items-center justify-content-center"
      >
        <DoubleArrowIcon
          height={"10px"}
          width={"10px"}
          color={"var(--text-primary-200)"}
        />
      </span>
    </button>
  </div>
{/if}
{#if !leftPanelController.leftPanelCollapse}
  <div
    style="overflow-x: auto; overflow-y: auto"
    class={`sidebar h-100 d-flex flex-column bg-secondary-900 scroll`}
  >
    <div
      class="d-flex justify-content-between align-items-center align-self-stretch px-0 pt-3 d-none"
    >
      <p class="mb-0 text-whiteColor ellipsis text-fs-16">
        {$currentWorkspace?.name || ""}
      </p>
      <button
        class=" border-0 rounded px-2 angleButton"
        on:click={() => {
          leftPanelController.leftPanelCollapse =
            !leftPanelController.leftPanelCollapse;
          leftPanelController.handleCollapseCollectionList();
        }}
        id="doubleAngleButton"
      >
        <img src={doubleangleLeft} alt="" class="filter-green" />
      </button>
    </div>

    <div
      class="d-flex align-items-center justify-content-between ps-2 pt-3 pe-1 gap-1"
    >
      <Input
        id="collection-list-search"
        width={"100%"}
        height={"33px"}
        type="search"
        searchIconColor={"var(--icon-secondary-170 )"}
        bind:value={searchData}
        on:input={(e) => {
          handleSearch();
          isExpandCollection = true;
          isExpandEnvironment = true;
        }}
        defaultBorderColor="transparent"
        hoveredBorderColor="var(--border-primary-300)"
        focusedBorderColor={"var(--border-primary-300)"}
        class="text-fs-12 bg-tertiary-400 border-radius-2 ellipsis fw-normal px-2"
        style="outline:none;"
        placeholder="Search"
      />
      <div class="d-flex align-items-center justify-content-center d-none">
        <button
          id="filter-btn"
          class="filter-btn btn bg-backgroundDark d-flex align-items-center justify-content-center p-2 d-none
          {showfilterDropdown ? 'filter-active' : ''}"
          style="width: 32px; height:32px; position:relative"
          on:click={() => (showfilterDropdown = !showfilterDropdown)}
        >
          <FilterIcon width={300} height={30} color="gray" />
          {#if showfilterDropdown}
            <span
              class="position-absolute"
              style="right:4px; top:5px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
            />
          {/if}
        </button>
      </div>
      <!--  
        New dropdown button for adding new api, collection and import Curl
      -->
      {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
        <Dropdown
          zIndex={600}
          buttonId="addButton"
          bind:isMenuOpen={addButtonMenu}
          options={addButtonData}
        >
          <Tooltip
            title={"Add Options"}
            placement={"bottom"}
            distance={12}
            show={!addButtonMenu}
            zIndex={10}
          >
            <button
              id="addButton"
              class="border-0 p-1 border-radius-2 add-button"
              on:click={() => {
                addButtonMenu = !addButtonMenu;
              }}
            >
              <img src={plusIcon} alt="" />
            </button>
          </Tooltip>
        </Dropdown>
      {/if}
    </div>

    <!-- LHS Side of Collection Enivironment & Test Flows -->
    <div
      class="d-flex flex-column collections-list"
      style="overflow:hidden; margin-top:5px;  flex:1; "
    >
      <!-----Collection Section------>
      <div
        class="ps-1"
        style=" overflow:auto; {isExpandCollection ? 'flex:1;' : ''}"
      >
        <CollectionList
          bind:scrollList
          bind:userRole
          {onRefetchCollection}
          {showImportCurlPopup}
          {collectionList}
          {isGuestUser}
          {currentWorkspace}
          {userRoleInWorkspace}
          {activeTabPath}
          {activeTabId}
          {showImportCollectionPopup}
          {onItemCreated}
          {onItemDeleted}
          {onItemRenamed}
          {onItemOpened}
          {onBranchSwitched}
          {searchData}
          {toggleExpandCollection}
          bind:isExpandCollection
        />
      </div>

      <hr class="my-1 ms-1 me-0" />

      <!-- Environment Section -->

      <div
        class="ps-1"
        style=" overflow:auto; {isExpandEnvironment ? 'flex:1;' : ''}"
      >
        <EnvironmentList
          loggedUserRoleInWorkspace={userRole}
          {onCreateEnvironment}
          {onOpenGlobalEnvironment}
          {onDeleteEnvironment}
          {onUpdateEnvironment}
          {onOpenEnvironment}
          {onSelectEnvironment}
          currentWorkspace={activeWorkspace}
          environments={$environments}
          {searchData}
          {activeTabId}
          {toggleExpandEnvironment}
          bind:isExpandEnvironment
        />
      </div>

      <hr class="my-1 ms-1 me-0" />

      <!-- Testflow Section -->

      <div
        class="ps-1"
        style=" overflow:auto; {isExpandTestflow ? 'flex:1;' : ''}"
      >
        <TestflowList
          testflows={$testflows}
          loggedUserRoleInWorkspace={userRole}
          {onCreateTestflow}
          {onDeleteTestflow}
          {onUpdateTestflow}
          {onOpenTestflow}
          currentWorkspace={activeWorkspace}
          {searchData}
          {activeTabId}
          {toggleExpandTestflow}
          bind:isExpandTestflow
        />
      </div>
      <hr class="my-1 ms-1 me-0" />
      <!-- <hr class="mt-1 mb-0 ms-1 me-0" /> -->
    </div>

    <!-- Github Data footer -->

    <!-- <hr class="ms-2 me-2 mb-0 mt-0" /> -->
    <div
      class="p-2 d-flex align-items-center justify-content-between"
      style="z-index: 4;"
    >
      <Tooltip title={"Star Us On GitHub"} placement={"top"}>
        <div
          class="px-2 py-1 border-radius-2 d-flex align-items-center {isGithubStarHover
            ? 'bg-secondary-600'
            : ''}"
          role="button"
          on:mouseenter={() => {
            isGithubStarHover = true;
          }}
          on:mouseleave={() => {
            isGithubStarHover = false;
          }}
          on:click={async () => {
            await open(externalSparrowGithub);
          }}
        >
          <GithubIcon
            height={"18px"}
            width={"18px"}
            color={isGithubStarHover
              ? "var(--bg-secondary-100)"
              : "var(--bg-secondary-200)"}
          />
          <span
            class="ps-2 text-fs-14 {isGithubStarHover
              ? 'text-secondary-100'
              : 'text-secondary-200'}"
          >
            {githubRepo?.stargazers_count || ""}
          </span>
        </div>
      </Tooltip>

      <div class="d-flex align-items-center">
        <!--Disabling the version feature switch as it was just for testing purpose, can be used for implementation example-->
        <!-- {#if isAppVersionVisible} -->
        <span class="text-fs-14 text-secondary-200 pe-2">v{appVersion}</span>
        <!-- {/if} -->
        <WithButton
          icon={DoubleArrowIcon}
          onClick={() => {
            leftPanelController.leftPanelCollapse =
              !leftPanelController.leftPanelCollapse;
            leftPanelController.handleCollapseCollectionList();
          }}
          disable={false}
          loader={false}
        />
      </div>
    </div>
  </div>
{/if}

<style>
  .not-opened-any {
    height: 40px;
  }
  .full-height {
    height: calc(100% - 80px);
  }

  .half-height {
    height: 33%;
  }
  .half-height2 {
    height: calc((100% - 40px) / 2);
  }

  .add-button {
    background-color: var(--dropdown-button);
  }

  .add-button:hover {
    background-color: var(--dropdown-hover);
  }

  .view-active {
    filter: invert(98%) sepia(99%) saturate(24%) hue-rotate(160deg)
      brightness(107%) contrast(100%);
  }

  .view-active:hover {
    filter: invert(100%) sepia(100%) saturate(14%) hue-rotate(212deg)
      brightness(104%) contrast(104%);
  }

  .angleRight {
    background-color: var(--blackColor);
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  .angleRight:hover {
    color: var(--blackColor);
    font-weight: 600;
  }

  .angleRight:active {
    color: var(--white-color);
    /* background-color: var(--button-pressed); */
  }
  .angleButton {
    background-color: var(--background-color);
    cursor: pointer;
  }

  .angleButton:hover {
    background-color: var(--workspace-hover-color);
  }

  .angleButton:active {
    background-color: var(--button-pressed);
  }

  /* 
  @keyframes increaseWidth {
    0% {
      width: 0;
    }

    100% {
      width: 280px;
    }
  }
  @keyframes decreaseWidth {
    0% {
      width: 280px;
    }
    100% {
      width: 0px;
    }
  } */

  .decrease-width {
    animation: decreaseWidth 0.3s;
    /* width: 0; */
    /* max-width: 280px; */
  }
  .increase-width {
    animation: increaseWidth 0.3s;
    /* max-width: 280px; */
  }
  .spinner {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .searchField {
  }
  .filter-btn {
    /* border: 1px solid var(--border-color) !important; */
  }
  .filter-active {
    background-color: var(--send-button) !important;
  }
</style>
