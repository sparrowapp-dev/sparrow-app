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
  import { notifications } from "$lib/utils/notifications";
  import { navigate } from "svelte-navigator";
  import ModalWrapperV1 from "../Modal/Modal.svelte";
  import Button from "../buttons/Button.svelte";
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
  let isshowDeletePopupOpen: boolean = false;
  export let users: userDetails[] = [];
  export let hasPermission: boolean;
  export let loggedInUser: userDetails;
  let filterText = "";
  export let handleInvitePopup: (showPopup: boolean) => void;
  export let getUserDetailsOfWorkspace: (workspaceId: string) => any;
  const handleUserOnRemove = async (workspaceId: string, userId: string) => {
    users = users.filter(
      (userObj) =>
        !(userObj.id !== userId && userObj.workspaceId !== workspaceId),
    );
  };

  const handleDeletePopup = (showPopup: boolean) => {
    isshowDeletePopupOpen = showPopup;
  };

  const handleDeleteWorkspaceFlow = async () => {
    const response = await workspaceInvitePermissonMethods.deleteWorkspace(
      currentWorkspaceDetails.id,
    );
    await workspaceInvitePermissonMethods.handleWorkspaceDeletion(
      currentTeamDetails.id,
      currentWorkspaceDetails.id,
    );
    if (response && response.data) {
      notifications.success(
        `${currentWorkspaceDetails.name}is removed from ${currentTeamDetails.name}`,
      );
      navigate("/dashboard/workspaces");
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
    <p class="workspace-name" style="font-size: 18px;">
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
          Everything in '<span class="text-whiteColor"
            >{currentWorkspaceDetails.name}</span
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
        on:blur={() => {
          if (confirmationText === "") {
            confirmationError = `Workspace name cannot be empty.`;
          } else if (confirmationText !== currentWorkspaceDetails.name) {
            confirmationError = `Workspace name does not match.`;
          } else {
            confirmationError = "";
          }
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
        class="d-flex align-items-center justify-content-between gap-3 mt-1 pb-3 mb-0 rounded"
        style="font-size: 16px;"
      >
        <div class="d-flex align-items-center">
          <p style="font-size:16px;" class="mb-0">
            {currentWorkspaceDetails.name}
          </p>
        </div>
        <Button
          disable={workspaceDeletePopupLoader ||
            confirmationText !== currentWorkspaceDetails.name}
          title={"Delete Workspace"}
          textStyleProp={"font-size: var(--base-size)"}
          loaderSize={18}
          type={"danger"}
          loader={workspaceDeletePopupLoader}
          onClick={async () => {
            workspaceDeletePopupLoader = true;
            await handleDeleteWorkspaceFlow();
            workspaceDeletePopupLoader = false;
          }}
        />
      </div>
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
