<script lang="ts">
  import { Select } from "@sparrow/library/forms";
  import {
    SparrowEdgeIcon,
    StackIcon,
    CheckCircle,
    ArrowRightRegular,
    AddRegular,
    QuestionCirlceReqular,
    DocumentRegular,
    GiftReqular,
  } from "@sparrow/library/icons";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { environmentType } from "@sparrow/common/enums";
  import { SparrowIcon } from "@sparrow/library/icons";
  import { ArrowRightIcon } from "@sparrow/library/icons";
  import type { WorkspaceDocument } from "@app/database/database";
  import { PlusIcon } from "@sparrow/library/icons";
  import { navigate } from "svelte-navigator";
  import { WorkspaceRegular } from "@sparrow/library/icons";
  import UserProfileModal, {
    type UserProfileObj,
  } from "./sub-component/UserProfileModal.svelte";
  import { Button, Dropdown, Tooltip } from "@sparrow/library/ui";
  import { SparrowFilledLogo } from "./images/index";
  // import { GlobalSearch } from "../../components/popup/global-search";
  /**
   * environment list
   */
  export let environments;
  export let onMarketingRedirect = () => {};
  /**
   * selected environment
   */
  export let currentEnvironment;
  /**
   * updates the selected environment
   */
  export let onInitActiveEnvironmentToWorkspace;
  /**
   * current workspace id
   */
  export let currentWorkspaceId;

  export let currentWorkspaceName;

  export let isGuestUser = false;
  export let isLoginBannerActive = false;

  export let onLoginUser;

  export let currentTeamName;

  export let currentTeamId;

  export let workspaceDocuments: WorkspaceDocument[] = [];
  export let teamDocuments = [];

  export let onCreateWorkspace;

  export let onSwitchWorkspace;
  export let onSwitchTeam;
  export let onGlobalSearchToggle;

  export let isWebApp = false;

  export let isCreateTeamModalOpen;
  export let searchQuery = "";
  export let onSearchClick;
  export let handleDocsRedirect;
  export let handleFeaturesRedirect;

  let helpOptionsOpen = false;

  /**
   * callback for Select component
   * @param tabId - selected option id
   */
  let handleDropdown = (tabId: string) => {
    onInitActiveEnvironmentToWorkspace(currentWorkspaceId, tabId);
  };

  /**
   * callback for workspace Select component
   * @param tabId - selected option id
   */
  let handleWorkspaceDropdown = (tabId: string) => {
    onSwitchWorkspace(tabId);
  };

  let handleAgentDropdown = (tabId: string) => {
    localStorage.setItem("selectedAgent", tabId);
    multipleAgentvar = tabId;
  };
  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick(); // Trigger the function passed from Dashboard
    }
  };
  $: {
    if (multipleAgentvar) {
      localStorage.setItem("selectedAgent", multipleAgentvar);
    }
  }
  let handleTeamDropdown = (_teamId: string) => {
    onSwitchTeam(_teamId);
  };

  let guestData = [];
  let workspaceData = [
    {
      id: currentWorkspaceId,
      name: currentWorkspaceName,
      description: currentTeamName,
    },
  ];

  let multipleAgentData = [
    {
      name: "Cloud Agent",
      id: "Cloud Agent",
      displayName: "Cloud Agent",
      description: "Securely send request via Sparrow's cloud.",
    },
    {
      name: "Browser Agent",
      id: "Browser Agent",
      displayName: "Browser Agent",
      description: "Run requests directly in your browser.",
    },
  ];

  let multipleAgentvar = (() => {
    const storedAgent = localStorage.getItem("selectedAgent");
    return storedAgent || multipleAgentData[0]?.id;
  })();

  const createSetFromArray = (arr, key) => {
    const seen = new Set();
    return arr.filter((obj) => {
      if (!obj.hasOwnProperty(key)) {
        return false;
      }
      const keyValue = obj[key];
      return !seen.has(keyValue) && seen.add(keyValue);
    });
  };

  const calculateLimitedWorkspace = () => {
    let workspaces = workspaceDocuments
      .filter((elem) => {
        if (currentTeamId === elem?.team?.teamId) return true;
        return false;
      })
      .reverse()
      .slice(0, 5)
      .map((workspace) => {
        const workspaceObj = {
          id: workspace._id,
          name: workspace.name,
          description: workspace.team?.teamName,
        };
        return workspaceObj;
      });
    workspaces.push({
      id: currentWorkspaceId,
      name: currentWorkspaceName,
      description: currentTeamName,
    });
    const res = createSetFromArray(workspaces, "id");
    if (res.length > 5) {
      res.shift();
    }
    workspaceData = res;
    return;
  };

  $: {
    if (
      currentTeamName ||
      currentTeamId ||
      currentWorkspaceName ||
      currentWorkspaceId ||
      workspaceDocuments
    ) {
      calculateLimitedWorkspace();
    }
  }
  const handleViewWorkspaces = () => {
    navigate("/app/home");
  };

  const handleViewGlobalSearch = () => {
    isGlobalSearchOpen = true;
  };
  export let user;
  export let onLogout;

  import { profileTabIcon as profile } from "@sparrow/library/assets";
  import { profileHoveredIcon as hoveredProfile } from "@sparrow/library/assets";
  import { profileSelectedIcon as selectedProfile } from "@sparrow/library/assets";
  import { onMount } from "svelte";
  import { OSDetector } from "../../utils";
  import WindowAction from "./window-action/WindowAction.svelte";
  import SearchBar from "../SearchBar/SearchBar.svelte";

  let sidebarModalItem: UserProfileObj = {
    heading: "Profile",
    defaultLogo: profile,
    hoveredLogo: hoveredProfile,
    selectedLogo: selectedProfile,
    disabled: isGuestUser ?? false,
    user,
  };

  let showProfileModal = false;
  let searchValue = "";

  let appWindow;

  if (isWebApp === false) {
    appWindow = getCurrentWindow();
  }

  let titlebar; // Reference to the title bar element

  function handleMouseDown(e: MouseEvent) {
    // Check if the target or any parent element matches the exclusion criteria
    if (e.buttons === 1 && !e.target.closest(".no-drag")) {
      if (e.detail === 2) {
        appWindow.toggleMaximize();
      } else {
        appWindow.startDragging();
      }
    }
  }

  let isWindows = false;
  let os = "";
  const osDetector = new OSDetector();
  onMount(() => {
    os = osDetector.getOS();
    if (os === "windows") {
      isWindows = true;
    } else {
      isWindows = false;
    }
  });

  const redirectDocumentation = () => {
    // window.open(docsLink, "_blank");
    handleDocsRedirect();
  };
  const redirectNewFeatures = () => {
    // window.open(featureUpdatesLink, "_blank");
    handleFeaturesRedirect();
  };
</script>

<header
  bind:this={titlebar}
  id="titlebar"
  class=" titlebar app-header ps-1 d-flex align-items-center justify-content-between"
  style="position:relative;"
  on:mousedown={handleMouseDown}
>
  <div class="gradient-ellipse"></div>

  <div class="d-flex ms-2 justify-content-cdenter align-items-center no-drag">
    {#if isWebApp === false}
      {#if isWindows === false}
        <WindowAction isWindows={false} />
      {/if}
    {/if}

    {#if isGuestUser}
      <div class="ms-2" style="margin-right:8px">
        <SparrowEdgeIcon
          height="25px"
          width="24px"
          color="var(--primary-btn-color)"
        />
      </div>
    {:else}
      <div class="ms-2" style="margin-right:8px">
        <SparrowIcon
          height="20px"
          width="20px"
          color="var(--primary-btn-color)"
        />
      </div>
    {/if}

    <!-- <div >
      <WorkspaceRegular />
    </div> -->
    <div class="no-drag" style="margin-left: 8px;" id="workspace-container">
      {#if isGuestUser}
        <div style="display: flex;">
          <Select
            id={"workspace-dropdown"}
            data={guestData}
            titleId={`${currentWorkspaceId}`}
            onclick={() => {}}
            minHeaderWidth={"252px"}
            isDropIconFilled={true}
            borderType={"none"}
            borderActiveType={"none"}
            headerHighlight={"hover-active"}
            headerTheme={"primary"}
            menuItem={"v2"}
            headerFontSize={"12px"}
            maxHeaderWidth={"252px"}
            headerFontWeight={600}
            zIndex={200}
            bodyTheme={"surface"}
            borderRounded={"2px"}
            position={"absolute"}
            isHeaderCombined={true}
            maxBodyHeight={"300px"}
            placeholderText=" Team / Workspace  "
            iconRequired={true}
            icon={WorkspaceRegular}
            iconColor={"var(--icon-ds-neutral-100)"}
            showDescription={false}
            headerHeight={"28px"}
          >
            <div slot="pre-select" class="mb-2 px-1">
              <div class="guest-user-text">
                <div>
                  <div
                    style="font-weight: 500; font-size:12px;color:var(--text-ds-neutral-50);text-align:left"
                  >
                    No Account Connected
                  </div>
                  <div
                    style="font-size:12px;color:var(--text-ds-neutral-300);text-align:left"
                  >
                    Unlock the full experience by getting started.
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                title="Create an Account or Sign In"
                size="small"
                onClick={onLoginUser}
                customWidth={"100%"}
              />
            </div>
          </Select>
        </div>
      {:else if currentWorkspaceId}
        <Select
          id={"workspace-dropdown"}
          data={workspaceData}
          titleId={`${currentWorkspaceId}`}
          onclick={handleWorkspaceDropdown}
          minHeaderWidth={"252px"}
          isDropIconFilled={true}
          borderType={"none"}
          borderActiveType={"none"}
          headerHighlight={"hover-active"}
          headerTheme={"transparent"}
          menuItem={"v2"}
          headerFontSize={"12px"}
          maxHeaderWidth={"252px"}
          zIndex={200}
          bodyTheme={"surface"}
          borderRounded={"2px"}
          position={"absolute"}
          isHeaderCombined={true}
          maxBodyHeight={"300px"}
          iconRequired={true}
          icon={WorkspaceRegular}
          iconColor={"var(--icon-ds-neutral-100)"}
          headerFontWeight={600}
          showDescription={false}
          headerHeight={"28px"}
        >
          <div slot="pre-select" class="mb-1">
            <div class="workspacename">{currentTeamName}</div>
          </div>
          <div
            slot="post-select"
            class="post-dropdown"
            style="justify-content: center; align-items:center;"
          >
            <div class="lower-underline"></div>
            <div class="view-all-workspace" on:click={handleViewWorkspaces}>
              <span>View all Workspaces</span>
              <Button
                type="teritiary-regular"
                startIcon={ArrowRightRegular}
                size="small"
              />
            </div>
            <div class="lower-underline"></div>
            <div class="create-new-workspace" on:click={onCreateWorkspace}>
              <span>Create New Workspace</span>
              <div style="align-content: flex-end;">
                <Button
                  type="teritiary-regular"
                  startIcon={AddRegular}
                  size="small"
                />
              </div>
            </div>
          </div>
        </Select>
      {/if}
    </div>
  </div>

  <div
    class="d-flex align-items-center no-drag"
    style="position: relative; display:flex; gap: 16px;"
  >
    {#if isGuestUser && isLoginBannerActive === false}
      <Tooltip
        placement="bottom-center"
        title={"You are using Sparrow Edge"}
        zIndex={600}
      >
        <div
          style="background-color:var(--bg-ds-surface-300); justify-content:center; align-items:center; margin-left:10px; border-radius:4px; min-width:72px"
          class="join-container"
          on:click={onLoginUser}
        >
          <span class="join-txt"> Sign in For Better Experience</span>
        </div>
      </Tooltip>
    {/if}

    <div>
      <SearchBar
        placeholder="Search Sparrow"
        bind:searchQuery
        onClick={handleSearchClick}
      />
    </div>

    <!-- Multiple Agent Dropdown -->
    {#if isWebApp}
      <Select
        id={"multiple-agent"}
        data={multipleAgentData}
        titleId={`${multipleAgentvar}`}
        onclick={handleAgentDropdown}
        minHeaderWidth={"171px"}
        iconRequired={true}
        icon={CheckCircle}
        iconColor={"#69D696"}
        isDropIconFilled={true}
        borderType={"none"}
        borderActiveType={"none"}
        headerHighlight={"hover-active"}
        headerTheme={"primary"}
        menuItem={"v2"}
        headerFontSize={"12px"}
        maxHeaderWidth={"12px"}
        zIndex={200}
        bodyTheme={"surface"}
        borderRounded={"2px"}
        position={"absolute"}
        isHeaderCombined={false}
        maxBodyHeight={"296px"}
        minBodyWidth={"296px"}
        headerHeight={"28px"}
      >
        <div
          slot="post-select"
          class="post-dropdown d-flex justify-content-center align-items-center flex-column"
        >
          <div class="lower-underline"></div>
          <div class="download-area w-100">
            <div
              class="download-sparrow-button download-section d-flex align-items-center justify-content-between"
              style="display: flex; gap: 12px; padding: 8px; border-radius: 6px; width: fit-content;"
            >
              <SparrowFilledLogo />

              <div class="d-flex flex-column gap-1" style="line-height: 1;">
                <p
                  class="download-text"
                  style="margin: 0; font-size: 12px; font-weight: 500; color: var(--text-ds-nuetral-50);"
                >
                  Sparrow Desktop
                </p>
                <span
                  class="description text-fs-10"
                  style="font-size: 12px; color: gray;"
                >
                  No agent needed.
                </span>
              </div>

              <!-- Download Button -->

              <Button
                type="primary"
                title="Download Now"
                size="small"
                onClick={onMarketingRedirect}
                customWidth={"103px"}
              />
            </div>
          </div>
        </div>
      </Select>
    {/if}
    <!-- {#if !isWebApp} -->

    <div id="environment-select-container">
      <Select
        id={"environment-selector"}
        data={[
          {
            name: "Select Environment",
            id: "none",
            type: environmentType.LOCAL,
            hide: true,
          },
          {
            name: "None",
            id: "none",
            display: "none",
            type: environmentType.LOCAL,
          },
          ...environments,
        ].filter((elem) => {
          return elem.type === environmentType.LOCAL;
        })}
        titleId={currentEnvironment?.id}
        onclick={handleDropdown}
        minHeaderWidth={"205px"}
        iconRequired={true}
        icon={StackIcon}
        iconColor={"var(--icon-primary-300)"}
        isDropIconFilled={true}
        borderType={"none"}
        borderActiveType={"none"}
        headerHighlight={"hover-active"}
        headerTheme={"transparent"}
        menuItem={"v2"}
        headerFontSize={"12px"}
        maxHeaderWidth={"185px"}
        zIndex={200}
        bodyTheme={"surface"}
        borderRounded={"2px"}
        position={"absolute"}
        headerHeight={"28px"}
      />
    </div>
    <!-- {/if} -->
    <div class="" id="question-container">
      <Tooltip placement="bottom-right" title={"Quick Help"} zIndex={600}>
        <Button
          startIcon={QuestionCirlceReqular}
          type="teritiary-regular"
          size="medium"
          iconSize={20}
          onClick={() => (helpOptionsOpen = !helpOptionsOpen)}
        />
      </Tooltip>
    </div>
    {#if helpOptionsOpen}
      <div class="question-option">
        <Dropdown
          buttonId="question-container"
          horizontalPosition="left"
          isMenuOpen={true}
          options={[
            {
              name: "Documentation",
              color: "var(--text-ds-neutral-50)",
              icon: DocumentRegular,
              iconSize: "12px",
              onclick: () => {
                redirectDocumentation();
              },
            },
            {
              name: "What’s New?",
              color: "var(--text-ds-neutral-50)",
              icon: GiftReqular,
              iconSize: "12px",
              onclick: () => {
                redirectNewFeatures();
              },
            },
          ]}
        />
      </div>
    {/if}

    {#if !isGuestUser}
      <div class={"pe-1"}>
        <UserProfileModal
          {isGuestUser}
          item={sidebarModalItem}
          {onLogout}
          bind:showProfileModal
        />
      </div>
    {/if}

    {#if isWebApp === false}
      {#if isWindows}
        <div class="d-flex gap-3 no-drag">
          <WindowAction isWindows={true} />
        </div>
      {/if}
    {/if}
  </div>
</header>

<style>
  .main-container {
    min-height: 28px;
    min-width: 96px;
  }
  header {
    height: 44px;
    background-color: var(--bg-ds-surface-700);
  }

  .description {
    color: var(--text-secondary-200);
  }

  .join-txt {
    font-size: 12px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 5px;
    padding-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    color: var(--text-ds-neutral-100);
  }
  .join-container {
    cursor: pointer;
  }
  .app-header {
    border-bottom: 2px solid var(--border-secondary-900);
  }

  .guest-user-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    color: var(--text-secondary-550);
    cursor: pointer;
    font-size: 12px;
    font-weight: 400;
    padding: 10px;
    text-align: center;
  }

  .download-text {
    margin: 0;
  }
  .download-area {
    display: flex;
    justify-content: center;
    align-self: center;
  }

  .download-sparrow-button {
    display: flex;
    flex-direction: row;
  }

  .create-new-workspace {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    color: var(--text-ds-neutral-100);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    padding: 10px;
    background-color: var(--bg-ds-surface-600);
    min-height: 28px;
    padding: 8px 6px;
  }
  .create-new-workspace:hover {
    background-color: var(--bg-ds-surface-400);
  }

  .upper-underline {
    width: 100%;
    height: 1px;
    background-color: var(--bg-tertiary-300);
  }

  .lower-underline {
    width: 100%;
    height: 1px;
    background-color: var(--bg-ds-surface-200);
  }

  .view-all-workspace {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-ds-neutral-100);
    background-color: var(--bg-ds-surface-600);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    min-height: 28px;
    padding: 8px 6px;
  }

  .view-all-workspace:hover {
    background-color: var(--bg-ds-surface-400);
  }

  .post-dropdown {
    width: 100%;
  }
  .workspacename {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-ds-neutral-200);
    padding: 7px 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  .gradient-ellipse {
    position: absolute;
    left: -20px;
    bottom: 0;
    width: 327px;
    height: 77px;
    background: radial-gradient(
      ellipse at 50% 80%,
      #3670f7 0%,
      transparent 60%
    );
    opacity: 0.2;
    pointer-events: none;
    z-index: 1;
  }
  .question-option {
    position: absolute;
  }
</style>
