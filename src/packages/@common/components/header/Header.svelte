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
  /**
   * callback for Select component
   * @param tabId - selected option id
   */
  let handleDropdown = (tabId: string) => {
    onInitActiveEnvironmentToWorkspace(currentWorkspaceId, tabId);
  };

  export let currentWorkspaceName;

  export let isGuestUser = false;
  export let isLoginBannerActive = false;

  export let onLoginUser;

  export let currentTeam;

  export let workspaceDocuments: WorkspaceDocument[] = [];

  let workspaceData;

  // function createSetFromArray(arr, key) {
  //   const seen = new Set();
  //   return arr.filter((obj) => {
  //     if (!obj.hasOwnProperty(key)) {
  //       throw new Error(`Object does not have key "${key}"`);
  //     }
  //     const keyValue = obj[key];
  //     return !seen.has(keyValue) && seen.add(keyValue);
  //   });
  // }

  // const calculateLimitedWorkspace = () => {
  //   let workspaces = workspaceDocuments
  //     .filter((elem) => {
  //       if (currentTeam?.id === elem?.team?.teamId) return true;
  //       return false;
  //     })
  //     .reverse()
  //     .slice(0, constants.WORKSPACE_LIMIT)
  //     .map((workspace) => {
  //       const workspaceObj = {
  //         id: workspace._id,
  //         name: workspace.name,
  //         description: workspace.team?.teamName,
  //       };
  //       return workspaceObj;
  //     });
  //   workspaces.push({
  //     id: currentWorkspaceId,
  //     name: currentWorkspaceName,
  //     description: currentTeam?.name,
  //   });
  //   const res = createSetFromArray(workspaces, "name");
  //   if (res.length > constants.WORKSPACE_LIMIT) {
  //     res.shift();
  //   }
  //   workspaceData = res;
  //   return;
  // };

  $: {
    if (currentWorkspaceId || currentTeam) {
      // calculateLimitedWorkspace();
    }
  }
  $: {
    if (workspaceDocuments) {
      console.log("--->workspacedocs", workspaceDocuments);
    }
  }
</script>

<header
  class="app-header ps-1 pe-3 d-flex align-items-center justify-content-between"
>
  <div class="d-flex ms-3 justify-content-center align-items-center">
    <div>
      <SparrowIcon
        height="17px"
        width="17px"
        color="var(--primary-btn-color)"
      />
    </div>

    <div class="ms-3">
      <Select
        id={"environment-selec65tor"}
        data={[
          {
            name: currentWorkspaceName,
            id: currentWorkspaceName,
          },
        ]}
        titleId={`${currentWorkspaceName}`}
        onclick={handleDropdown}
        minHeaderWidth={"auto"}
        iconRequired={false}
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
      >
        <div slot="pre-select" class="d-none">
          <hr class="mb-2 mt-2" />
          <p class="sparrow-fs-12 text-textColor mb-2 ps-2 pe-2">
            View all Branches
          </p>
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
</style>
