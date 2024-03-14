<script lang="ts">
  import { SearchIcon } from "$lib/assets/app.asset";
  import WorkspaceUserInfo from "./workspaceUserInfo.svelte";
  import { TeamRole } from "$lib/utils/enums";
  import type {
    CollectionsMethods,
    TeamRepositoryMethods,
    TeamServiceMethods,
    userDetails,
    workspaceInviteMethods,
  } from "$lib/utils/interfaces";
  import type {
    TeamDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  export let collectionsMethods: CollectionsMethods;
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import ModalWrapperV1 from "../Modal/Modal.svelte";
  import Button from "../buttons/Button.svelte";
  import { HeaderDashboardViewModel } from "../header/header-dashboard/HeaderDashboard.ViewModel";
  import Dropdown from "../dropdown/Dropdown.svelte";
  import { requestResponseStore } from "$lib/store";
  export let currentTeamworkspaces: WorkspaceDocument[];
  export let currentWorkspaceDetails: { id: string; name: string };
  export let currentTeamDetails: { id: string; name: string };
  export let loggedInUserEmail: string;
  export let loggedUserRole: TeamRole;
  export let teamWorkspaceMethods: Pick<
    TeamServiceMethods,
    | "demoteToMemberAtTeam"
    | "promoteToAdminAtTeam"
    | "removeMembersAtTeam"
    | "refreshWorkspace"
  > &
    Pick<TeamRepositoryMethods, "updateUserRoleInTeam" | "removeUserFromTeam">;
  export let workspaceInvitePermissonMethods: workspaceInviteMethods;
  export let currentActiveTeam: TeamDocument;
  let isshowDeletePopupOpen = false;
  let showActivateWorkspacePopup = false;
  export let users: userDetails[] = [];
  export let hasPermission: boolean;
  export let loggedInUser: userDetails;
  let filterText = "";
  export let handleInvitePopup: (showPopup: boolean) => void;
  const _viewModel = new HeaderDashboardViewModel();
  let activeWorkspaceBeingDeleted = false;
  let teamSpecificWorkspace = currentTeamworkspaces.map((elem) => {
    return {
      id: elem._id,
      name: elem.name,
      dynamicClasses: "text-whiteColor",
    };
  });

  const handleUserOnRemove = async (workspaceId: string, userId: string) => {
    users = users.filter(
      (userObj) =>
        !(userObj.id !== userId && userObj.workspaceId !== workspaceId),
    );
  };

  const handleDeletePopup = (showPopup: boolean) => {
    isshowDeletePopupOpen = showPopup;
  };

  const handleActivateWorkspacePopup = (showPopup: boolean) => {
    showActivateWorkspacePopup = showPopup;
  };

  const handleActivateWorkspace = async (workspaceId: string) => {
    await _viewModel.activateWorkspace(workspaceId);
    showActivateWorkspacePopup = false;
    await requestResponseStore.clearTabs();
    const workspaceObj = currentTeamworkspaces.find(
      (ws) => ws._id === workspaceId,
    ) as any;
    const newWorkspaceObj = { ...workspaceObj._data };
    newWorkspaceObj.isActiveWorkspace = true;
    newWorkspaceObj.currentEnvironmentId = workspaceObj?.environmentId;
    newWorkspaceObj.type = "WORKSPACE";
    newWorkspaceObj.save = true;
    newWorkspaceObj.path = {
      collectionId: "",
      workspaceId,
    };
    newWorkspaceObj.property = {
      workspace: {
        requestCount: 0,
        collectionCount: 0,
      },
    };
    collectionsMethods.handleCreateTab(newWorkspaceObj);
    collectionsMethods.handleActiveTab(workspaceId);
  };

  const handleDeleteWorkspaceFlow = async () => {
    activeWorkspaceBeingDeleted = await _viewModel.checkActiveWorkspace(
      currentWorkspaceDetails.id,
    );
    if (activeWorkspaceBeingDeleted && teamSpecificWorkspace.length === 1) {
      notifications.error(
        "Failed to delete the last workspace. Please create a new workspace before deleting this workspace.",
      );
      handleDeletePopup(false);
      return;
    }
    const response = await workspaceInvitePermissonMethods.deleteWorkspace(
      currentWorkspaceDetails.id,
    );
    await workspaceInvitePermissonMethods.handleWorkspaceDeletion(
      currentTeamDetails.id,
      currentWorkspaceDetails.id,
    );
    if (response && response.data) {
      teamSpecificWorkspace = teamSpecificWorkspace.filter(
        (ws) => ws.id != currentWorkspaceDetails.id,
      );
      notifications.success(
        `${currentWorkspaceDetails.name} is removed from ${currentTeamDetails.name}`,
      );
      if (activeWorkspaceBeingDeleted) {
        showActivateWorkspacePopup = true;
      }
    } else {
      notifications.error(
        `Failed to remove ${currentWorkspaceDetails.name} from ${currentTeamDetails.name}. Please try again`,
      );
    }
    handleDeletePopup(false);
  };
  let confirmationText: string = "";
  let confirmationError: string = "";
  let workspaceDeletePopupLoader: boolean = false;
</script>

<div
  class="my-workspace d-flex flex-column"
  style="width:calc(100% - 280px); margin-top: 15px;padding:24px;"
>
  <div class="workspace-setting-header">
    <p
      class="workspace-name w-50 overflow-hidden text-truncate"
      style="font-size: 18px;"
    >
      {currentWorkspaceDetails.name}
    </p>
    {#if hasPermission}
      <div class="workspace-setting-buttons">
        <button
          class="workspace-setting-button-del"
          on:click={() => {
            handleDeletePopup(true);
          }}
        >
          Delete Workspace
        </button>
        <button
          class="workspace-setting-button-inv"
          on:click={() => {
            handleInvitePopup(true);
          }}
        >
          Invite</button
        >
      </div>
    {/if}
  </div>

  <div
    class="search-bar ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
  >
    <SearchIcon />
    <input
      type="search"
      style=" font-size: 14px;font-weight:500;background:none;"
      class="border-0 w-100 h-100"
      placeholder="Search People in {currentWorkspaceDetails.name || ''}"
      on:input={(event) => {
        filterText = event.target.value;
      }}
    />
  </div>
  <div class="mt-4">
    {#if loggedInUser?.name
      .toLocaleLowerCase()
      .startsWith(filterText) || loggedInUser?.email
        .toLocaleLowerCase()
        .startsWith(filterText)}
      <WorkspaceUserInfo
        name={loggedInUser?.name}
        role={loggedInUser?.role}
        loggedInUser={true}
        {currentTeamworkspaces}
        email={loggedInUser?.email}
        {hasPermission}
        {currentTeamDetails}
        {loggedUserRole}
        id={loggedInUser?.id}
        {currentWorkspaceDetails}
        {workspaceInvitePermissonMethods}
        {handleUserOnRemove}
        {teamWorkspaceMethods}
        {currentActiveTeam}
      ></WorkspaceUserInfo>
      <hr style="margin-top:-5px;" />
    {/if}
  </div>
  <div>
    {#each users as user}
      {#if user.name.toLocaleLowerCase().startsWith(filterText) || user.email
          .toLocaleLowerCase()
          .startsWith(filterText)}
        <WorkspaceUserInfo
          name={user?.name}
          role={user?.role}
          email={user?.email}
          {hasPermission}
          {loggedUserRole}
          id={user?.id}
          {currentTeamDetails}
          {teamWorkspaceMethods}
          {currentTeamworkspaces}
          {handleUserOnRemove}
          {currentWorkspaceDetails}
          {workspaceInvitePermissonMethods}
          {currentActiveTeam}
        ></WorkspaceUserInfo>
      {/if}
    {/each}
    {#if ![...users, loggedInUser].some((user) => {
      return user.name.toLocaleLowerCase().startsWith(filterText) || user.email
          .toLocaleLowerCase()
          .startsWith(filterText);
    })}
      <span class="not-found-text mx-auto ellipsis">No results found.</span>
    {/if}
  </div>

  <ModalWrapperV1
    title={"Delete Workspace?"}
    type={"danger"}
    width={"35%"}
    zIndex={1000}
    isOpen={isshowDeletePopupOpen}
    handleModalState={handleDeletePopup}
  >
    <div class="workspace-delete-confirmation">
      <div class="text-lightGray mb-1 sparrow-fs-14">
        <p class="text-textColor sparrow-fs-12">
          Everything in <span class="text-whiteColor"
            >"{currentWorkspaceDetails.name}"</span
          > will be permanently removed, and all contributors will lose access. This
          action cannot be undone.
        </p>
      </div>

      <p class="confirm-header mb-0 sparrow-fs-14">
        Enter workspace name to confirm<span class="asterik">*</span>
      </p>
      <input
        id={`workspace-confirmation-input`}
        placeholder=""
        autocomplete="off"
        autocapitalize="none"
        autofocus
        style="outline:none;border:none;flex-grow:1;"
        bind:value={confirmationText}
        on:input={() => {
          confirmationError = "";
        }}
        class="input-container mt-2 mb-1 {confirmationError
          ? 'error-border'
          : ''}"
      />
      {#if confirmationError}
        <p class="error-text sparrow-fs-12">{confirmationError}</p>
      {/if}
      <br />

      <div
        class="d-flex align-items-center justify-content-between gap-3 mt-2 pb-3 mb-0 rounded ellipsis"
        style="font-size: 16px;"
      >
        <div class="d-flex align-items-center ellipsis">
          <p style="font-size:16px;" class="mb-0 ellipsis">
            {currentWorkspaceDetails.name}
          </p>
        </div>
        <div class="d-flex">
          <Button
            disable={workspaceDeletePopupLoader}
            title={"Cancel"}
            textStyleProp={"font-size: var(--base-text)"}
            buttonClassProp={"me-2"}
            loaderSize={18}
            type={"dark"}
            loader={false}
            onClick={async () => {
              confirmationError = "";
              confirmationText = "";
              handleDeletePopup(false);
            }}
          />
          <Button
            disable={workspaceDeletePopupLoader}
            title={"Delete Workspace"}
            textStyleProp={"font-size: var(--base-text)"}
            loaderSize={18}
            type={"danger"}
            loader={workspaceDeletePopupLoader}
            onClick={async () => {
              confirmationText = confirmationText.replace(/’/g, "'");
              if (confirmationText === "") {
                confirmationError = `Workspace name cannot be empty.`;
              } else if (confirmationText !== currentWorkspaceDetails.name) {
                confirmationError = `Workspace name does not match.`;
              } else {
                confirmationError = "";
                workspaceDeletePopupLoader = true;
                await handleDeleteWorkspaceFlow();
                workspaceDeletePopupLoader = false;
              }
            }}
          />
        </div>
      </div>
    </div>
  </ModalWrapperV1>

  <ModalWrapperV1
    title={"Activate Workspace"}
    type={"primary"}
    width={"35%"}
    zIndex={1000}
    isOpen={showActivateWorkspacePopup}
    canClose={false}
    handleModalState={handleActivateWorkspacePopup}
  >
    <div class="mt-4">
      <p class="role-title mb-0">
        Choose your next active workspace<span class="asterik">*</span>
      </p>
      <br />
      <Dropdown
        dropDownType={{ type: "text", title: "select" }}
        dropdownId="check-select-workspace"
        data={[
          {
            name: "Select",
            id: "select",
            dynamicClasses: "text-whiteColor",
            hide: true,
          },
          ...teamSpecificWorkspace.filter((workspaceitem) => {
            workspaceitem.id !== currentWorkspaceDetails.id;
          }),
        ]}
        onclick={handleActivateWorkspace}
        staticClasses={[
          {
            id: `check-select-workspace-dropdown-select`,
            classToAdd: ["border", "rounded", "py-1"],
          },
          {
            id: "check-select-workspace-options-container",
            classToAdd: ["end-0", "start-0"],
          },
          {
            id: "check-select-workspace-btn-div",
            classToAdd: ["flex-wrap", "overflow-auto"],
          },
        ]}
        staticCustomStyles={[
          {
            id: "check-select-workspace-options-container",
            styleKey: "overflow",
            styleValue: "auto",
          },
          {
            id: "check-select-workspace-options-container",
            styleKey: "max-height",
            styleValue: "calc(100vh - 500px)",
          },
        ]}
      ></Dropdown>
    </div>
  </ModalWrapperV1>
</div>

<style lang="scss">
  .workspace-setting-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    line-height: 18px;
  }
  .workspace-setting-buttons {
    display: flex;
    gap: 10px;
  }
  .workspace-setting-button-del {
    background-color: var(--border-color);
    border: none;
    padding: 5px 15px 5px 15px;
    border-radius: 4px;
  }
  .workspace-setting-button-del:hover {
    background-color: #616364;
  }
  .workspace-setting-button-inv {
    background-color: var(--primary-btn-color);
    border: none;
    padding: 5px 15px 5px 15px;
    border-radius: 4px;
  }
  .workspace-setting-button-inv:hover {
    background-color: var(--send1-hoverbutton);
  }
  .search-bar {
    border: 1px solid var(--border-color);
  }
  .search-bar:hover {
    outline: 1px solid;
  }
  .search-bar {
    width: 50%;
    padding: 8px;
  }
  .search-bar > input:focus {
    outline: none;
    border: none;
  }
  @media (max-width: 1000px) {
    .workspace-setting-header {
      display: flex;
      flex-direction: column;
    }
    .search-bar {
      margin-top: 15px;
      width: 80%;
    }
  }
  .workspace-delete-confirmation {
    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
    .btn-primary {
      background-color: var(--border-color);
    }

    .btn-primary:hover {
      color: var(--blackColor);
      background-color: var(--workspace-hover-color);
    }

    .btn-primary:active {
      color: var(--blackColor);
      background-color: var(--button-pressed);
    }

    .btn-secondary {
      background-color: var(--dangerColor);
    }

    .btn-secondary:hover {
      background-color: var(--delete-hover);
    }
    .team-icon {
      height: 24px;
      width: 24px;
    }
    .asterik {
      color: var(--dangerColor);
      margin-left: 4px;
    }
    .input-container {
      background-color: var(--background-dropdown);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color) !important;
      width: 100%;
    }
    .error-text {
      margin-top: 2px;
      margin-bottom: 0 !important;
      color: var(--error--color);
    }
    .error-border {
      border: 1px solid var(--error--color) !important;
    }
  }
</style>
