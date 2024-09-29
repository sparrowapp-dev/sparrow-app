<script lang="ts">
  import { Select } from "@sparrow/library/forms";
  import {
    CloudOffIcon,
    SparrowEdgeIcon,
    StackIcon,
  } from "@sparrow/library/icons";
  import { environmentType } from "@deprecate/utils/enums";
  import { SparrowIcon } from "@sparrow/library/icons";
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

  export let onCreateWorkspace;

  export let onSwitchWorkspace;

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

  let guestData = [];
  let workspaceData = [
    {
      id: currentWorkspaceId,
      name: currentWorkspaceName,
      description: currentTeamName,
    },
  ];

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

  import profile from "@deprecate/assets/profileTab.svg";
  import hoveredProfile from "@deprecate/assets/profile-hovered.svg";
  import selectedProfile from "@deprecate/assets/profile-selected.svg";

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
    <div class="ms-3">
      {#if isGuestUser}
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
