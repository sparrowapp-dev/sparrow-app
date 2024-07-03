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

  export let onCreateWorkspace;
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
        minHeaderWidth={"155px"}
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
        <div slot="pre-select" style="justify-content:space-between">
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
          <div class="underline"></div>
        </div>
        <div slot="post-select" style="justify-content: center;">
          <div class="view-all-workspace">
            <span>View all Workspaces</span>
          </div>
          <div class="underline"></div>
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
    color: var(--text-primary-300); /* Blue color */
    cursor: pointer;
    padding: 10px;
    font-size: 12px;
    font-weight: 400;
  }

  .create-new-workspace:hover {
    text-decoration: underline;
  }

  .underline {
    width: 90%;
    height: 1px;
    background-color: var(--bg-tertiary-300); /* Dark background */
    margin-top: 3px;
    margin-left: 5px;
    align-self: center;
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
</style>
