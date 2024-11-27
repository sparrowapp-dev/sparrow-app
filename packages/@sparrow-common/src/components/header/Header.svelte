<script lang="ts">
  import { Select } from "@sparrow/library/forms";
  import {
    CloudOffIcon,
    SparrowEdgeIcon,
    StackIcon,
    CheckCircle,
  } from "@sparrow/library/icons";
  import { environmentType } from "@sparrow/common/enums";
  import { SparrowIcon } from "@sparrow/library/icons";
  import { ArrowRightIcon } from "@sparrow/library/icons";
  import constants from "@app/constants/constants";
  import type { WorkspaceDocument } from "@app/database/database";
  import { PlusIcon } from "@sparrow/library/icons";
  import { navigate } from "svelte-navigator";
  import PopupHint from "./sub-component/PopupHint.svelte";
  import UserProfileModal, {
    type UserProfileObj,
  } from "./sub-component/UserProfileModal.svelte";
  /**
   * environment list
   */
  export let environments;

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

  export let isWebApp = false;

  export let isCreateTeamModalOpen;

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
    multipleagentvar = tabId;
  };

  $: {
    if (multipleagentvar) {
      localStorage.setItem("selectedAgent", multipleagentvar);
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
      description:
        "Run requests via the cloud for faster performance and reduced load on your device.",
    },
    {
      name: "Browser Agent",
      id: "Browser Agent",
      displayName: "Browser Agent",
      description:
        "Run requests directly from your browser, ideal for local testing.",
    },
  ];

  let multipleagentvar = (() => {
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
      .slice(0, constants.WORKSPACE_LIMIT)
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
    if (res.length > constants.WORKSPACE_LIMIT) {
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
  export let user;
  export let onLogout;

  import { profileTabIcon as profile } from "@sparrow/library/assets";
  import { profileHoveredIcon as hoveredProfile } from "@sparrow/library/assets";
  import { profileSelectedIcon as selectedProfile } from "@sparrow/library/assets";

  let sidebarModalItem: UserProfileObj = {
    heading: "Profile",
    defaultLogo: profile,
    hoveredLogo: hoveredProfile,
    selectedLogo: selectedProfile,
    disabled: isGuestUser ?? false,
    user,
  };

  let showProfileModal = false;
</script>

<header
  class="app-header ps-1 pe-3 d-flex align-items-center justify-content-between"
>
  <div class="d-flex ms-3 justify-content-cdenter align-items-center">
    {#if isGuestUser}
      <div>
        <SparrowEdgeIcon
          height="25px"
          width="24px"
          color="var(--primary-btn-color)"
        />
      </div>
    {:else}
      <div>
        <SparrowIcon
          height="17px"
          width="17px"
          color="var(--primary-btn-color)"
        />
      </div>
    {/if}
    <div class="ms-4">
      {#if isWebApp}
        {#if teamDocuments?.filter((_team) => {
          if (_team.isOpen) return true;
          return false;
        })[0]?.teamId}
          <div class="ps-2">
            <Select
              id={"workspace-dropdown"}
              data={teamDocuments
                ?.map((_team) => {
                  return {
                    id: _team.teamId,
                    name: _team.name,
                  };
                })
                .reverse()}
              titleId={teamDocuments?.filter((_team) => {
                if (_team.isOpen) return true;
                return false;
              })[0]?.teamId}
              onclick={handleTeamDropdown}
              minHeaderWidth={"200px"}
              iconRequired={false}
              isDropIconFilled={true}
              borderType={"none"}
              borderActiveType={"none"}
              headerHighlight={"hover-active"}
              headerTheme={"transparent"}
              menuItem={"v2"}
              headerFontSize={"12px"}
              maxHeaderWidth={"215px"}
              minBodyWidth={"200px"}
              zIndex={200}
              bodyTheme={"violet"}
              borderRounded={"2px"}
              position={"absolute"}
              maxBodyHeight={"160px"}
            >
              <div
                slot="post-select"
                class="post-dropdown"
                style="justify-content: center; align-items:center;"
              >
                <div class="lower-underline"></div>
                <div
                  class="create-new-workspace"
                  on:click={() => {
                    isCreateTeamModalOpen = true;
                  }}
                >
                  <span>Create New Team</span>
                  <div style="align-content: flex-end;">
                    <PlusIcon
                      height="16px"
                      width="16px"
                      color="var(--icon-primary-300)"
                    />
                  </div>
                </div>
              </div>
            </Select>
          </div>
        {/if}
      {:else if isGuestUser}
        <Select
          id={"workspace-dropdown"}
          data={guestData}
          titleId={`${currentWorkspaceId}`}
          onclick={() => {}}
          minHeaderWidth={"205px"}
          iconRequired={false}
          isDropIconFilled={true}
          borderType={"none"}
          borderActiveType={"none"}
          headerHighlight={"hover-active"}
          headerTheme={"transparent"}
          menuItem={"v2"}
          headerFontSize={"12px"}
          maxHeaderWidth={"215px"}
          zIndex={200}
          bodyTheme={"violet"}
          borderRounded={"2px"}
          position={"absolute"}
          isHeaderCombined={true}
          maxBodyHeight={"300px"}
          placeholderText=" Team / Workspace  "
        >
          <div slot="pre-select" class="mb-2 px-1">
            <div class="guest-user-text">
              <span
                >This version has limited features. Get started and unlock the
                complete package.</span
              >
            </div>
            <div
              on:click={onLoginUser}
              class="btn d-flex justify-content-center align-items-center"
              style="width:100%; height:26px; background-color:var(--bg-primary-300);"
            >
              <button
                class="mb-1"
                style="width:100%; height:100%; text-decoration:none; outline:none !important; background-color:transparent;  border:none; font-size:12px;"
              >
                Create an Account or Sign In
              </button>
            </div>
          </div>
        </Select>
      {:else if currentWorkspaceId}
        <Select
          id={"workspace-dropdown"}
          data={workspaceData}
          titleId={`${currentWorkspaceId}`}
          onclick={handleWorkspaceDropdown}
          minHeaderWidth={"185px"}
          iconRequired={false}
          isDropIconFilled={true}
          borderType={"none"}
          borderActiveType={"none"}
          headerHighlight={"hover-active"}
          headerTheme={"transparent"}
          menuItem={"v2"}
          headerFontSize={"12px"}
          maxHeaderWidth={"215px"}
          zIndex={200}
          bodyTheme={"violet"}
          borderRounded={"2px"}
          position={"absolute"}
          isHeaderCombined={true}
          maxBodyHeight={"300px"}
        >
          <div slot="pre-select" class="pre-dropdown">
            <div class="create-new-workspace" on:click={onCreateWorkspace}>
              <span>Create New Workspace</span>
              <div style="align-content: flex-end;">
                <PlusIcon
                  height="16px"
                  width="16px"
                  color="var(--icon-primary-300)"
                />
              </div>
            </div>
            <div class="upper-underline"></div>
          </div>
          <div
            slot="post-select"
            class="post-dropdown"
            style="justify-content: center; align-items:center;"
          >
            {#if workspaceData.length < 5}
              <div class="recent-text-btn">
                You will see your five most recent workspaces here.
              </div>
            {/if}
            <div class="lower-underline"></div>
            <div class="view-all-workspace" on:click={handleViewWorkspaces}>
              <span>View all Workspaces</span>
            </div>
          </div>
        </Select>
      {/if}
    </div>
  </div>

  <div class="d-flex align-items-center" style="position: relative;">
    {#if isGuestUser && isLoginBannerActive === false}
      <PopupHint />

      <div
        style="background-color:#313233; justify-content:center; align-items:center; margin-right:10px; margin-left:10px; border-radius:2px"
        class="join-container"
        on:click={onLoginUser}
      >
        <span class="join-txt"> Sign In for Enhanced Experience</span>
      </div>
    {/if}

    <!-- Multiple Agent Dropdown -->

    <Select
      id={"multiple-agent"}
      data={multipleAgentData}
      titleId={`${multipleagentvar}`}
      onclick={handleAgentDropdown}
      minHeaderWidth={"232px"}
      iconRequired={true}
      icon={CheckCircle}
      iconColor={"#69D696"}
      isDropIconFilled={true}
      borderType={"none"}
      borderActiveType={"none"}
      headerHighlight={"hover-active"}
      headerTheme={"transparent"}
      menuItem={"v2"}
      headerFontSize={"12px"}
      maxHeaderWidth={"12px"}
      zIndex={200}
      bodyTheme={"violet"}
      borderRounded={"2px"}
      position={"absolute"}
      isHeaderCombined={false}
      maxBodyHeight={"300px"}
    >
      <div slot="pre-select" class="pre-dropdown">
        <div class="select-agent">
          <div>Select Sparrow Agent</div>
        </div>
        <div class="upper-underline"></div>
      </div>
      <div
        slot="post-select"
        class="post-dropdown"
        style="justify-content: center; align-items:center; flex-direction:row"
      >
        <div class="lower-underline"></div>
        <div class="download-area">
          <div class="download-sparrow-button dowload-section">
            <p class="download-text">
              Download Sparrow Desktop <span class="description">
                Effortlessly test requests with the desktop app. No agents
                required.
              </span>
            </p>
          </div>
          <div class="download-area">
            <SparrowIcon
              height="32px"
              width="32px"
              color="var(--primary-btn-color)"
            />
          </div>
        </div>
        <div class="download-btn">
          <p>Download Now</p>
          <div>
            <ArrowRightIcon
              height="15px"
              width="11px"
              color="var(--icon-primary-300)"
            />
          </div>
        </div>
      </div>
    </Select>
    <!-- {#if !isWebApp} -->
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
      minHeaderWidth={"185px"}
      iconRequired={true}
      icon={StackIcon}
      iconColor={"var(--icon-primary-300)"}
      isDropIconFilled={true}
      borderType={"none"}
      borderActiveType={"none"}
      headerHighlight={""}
      headerTheme={"transparent"}
      menuItem={"v2"}
      headerFontSize={"12px"}
      maxHeaderWidth={"185px"}
      zIndex={200}
      bodyTheme={"violet"}
      borderRounded={"2px"}
      position={"absolute"}
    />
    <!-- {/if} -->

    {#if !isGuestUser}
      <div class="ms-2 me-1">
        <UserProfileModal
          {isGuestUser}
          item={sidebarModalItem}
          {onLogout}
          bind:showProfileModal
        />
      </div>
    {/if}
  </div>
</header>

<style>
  header {
    height: 44px;
    background-color: var(--bg-secondary-850);
  }

  .description {
    font-size: 10px;
    color: var(--text-secondary-200);
  }

  .join-txt {
    font-size: 12px;
    padding-left: 12px;
    padding-right: 16px;
    padding-top: 4px;
    padding-bottom: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
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

  .download-btn {
    color: #3670f7;
    padding: 0 0 0px 12px;
    font-size: 14px;
    display: flex;
    gap: 10px;
  }

  .dowload-section {
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: #ffffff;
    cursor: pointer;
    font-size: 12px;
    font-weight: 400;
    padding: 10px;
  }

  .select-agent {
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: #ffffff;
    cursor: pointer;
    padding: 10px;
    font-size: 12px;
    font-weight: 400;
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
    color: var(--text-primary-300);
    cursor: pointer;
    font-size: 12px;
    font-weight: 400;
    padding: 10px;
  }

  .upper-underline {
    width: 100%;
    height: 1px;
    background-color: var(--bg-tertiary-300);
  }

  .lower-underline {
    width: 100%;
    height: 1px;
    background-color: var(--bg-tertiary-300);
    margin-top: 10px;
  }

  .view-all-workspace {
    display: flex;
    align-items: center;
    color: var(--text-secondary-200); /* Blue color */
    cursor: pointer;
    padding: 10px;
    font-size: 12px;
    font-weight: 400;
  }

  .view-all-workspace:hover {
    background-color: var(--bg-tertiary-600);
  }

  .post-dropdown {
    width: 100%;
  }
  .pre-dropdown:hover {
    background-color: var(--bg-tertiary-600);
  }
  .recent-text-btn {
    font-size: 12px;
    font-weight: 400;
    padding: 10px;
    align-self: center;
    color: var(--text-secondary-200);
    text-align: center;
  }
</style>
