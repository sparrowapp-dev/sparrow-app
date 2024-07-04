<script lang="ts">
  import { Select } from "@library/forms";
  import { CloudOffIcon, StackIcon } from "@library/icons";
  import { environmentType } from "$lib/utils/enums";
  import { ArrowIcon } from "@library/icons";
  import { DownArrowIcon } from "$lib/assets/icons";
  import ArrowUnfilled from "@library/icons/ArrowUnfilled.svelte";
  import { Tooltip } from "@library/ui";
  import { SparrowIcon } from "@library/icons";
  import constants from "$lib/utils/constants";
  import type { WorkspaceDocument } from "@app/database/database";
  import { PlusIcon } from "@library/icons";
  import { navigate } from "svelte-navigator";
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
    onSwitchWorkspace(tabId);
  };

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
    const res = createSetFromArray(workspaces, "name");
    if (res.length > constants.WORKSPACE_LIMIT) {
      res.shift();
    }
    workspaceData = res;
    return;
  };

  $: {
    if (currentWorkspaceName || currentTeamName) {
      calculateLimitedWorkspace();
    }
  }
  const handleViewWorkspaces = () => {
    navigate("/app/home");
  };
</script>

<header
  class="app-header ps-1 pe-3 d-flex align-items-center justify-content-between"
>
  <div class="d-flex ms-3 justify-content-cdenter align-items-center">
    <div>
      <SparrowIcon
        height="17px"
        width="17px"
        color="var(--primary-btn-color)"
      />
    </div>

    <div class="ms-3">
      <Select
        id={"workspace-dropdown"}
        data={workspaceData}
        titleId={`${currentWorkspaceId}`}
        onclick={handleDropdown}
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
    </div>
  </div>

  <div class="d-flex align-items-center">
    {#if isGuestUser && isLoginBannerActive === false}
      <Tooltip title={"Reconnect to explore more features!"} placement="bottom">
        <CloudOffIcon
          height="19px"
          width="23px"
          color="var(--icon-secondary-290)"
        />
      </Tooltip>
      <div
        style="background-color:#313233; justify-content:center; align-items:center; margin-right:10px; margin-left:10px; border-radius:2px"
        class="join-container"
        on:click={onLoginUser}
      >
        <span class="join-txt"> Join the Experience </span>
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
  </div>
</header>

<style>
  header {
    height: 44px;
    background-color: var(--bg-secondary-850);
  }
  .join-txt {
    font-size: 12px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .join-container {
    cursor: pointer;
  }
  .app-header {
    border-bottom: 2px solid var(--border-secondary-900);
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
