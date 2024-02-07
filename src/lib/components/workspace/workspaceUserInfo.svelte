<script lang="ts" module="es6">
  import type {
    TeamDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import { TeamRole, WorkspaceRole } from "$lib/utils/enums";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
    workspaceInviteMethods,
  } from "$lib/utils/interfaces";
  import { notifications } from "$lib/utils/notifications";
  import CustomButton from "../buttons/CustomButton.svelte";
  import MemberDropDown from "../dropdown/MemberDropdown.svelte";
  import ModalWrapperV1 from "../Modal/Modal.svelte";
  import MemberInfoPopup from "./member-info/MemberInfo.svelte";
  export let id: string;
  export let name: string;
  export let email: string;
  export let role: WorkspaceRole | TeamRole;
  export let loggedUserRole: TeamRole;
  export let currentTeamworkspaces: WorkspaceDocument[];
  export let currentTeamDetails: { id: string; name: string };
  export let teamWorkspaceMethods: Pick<
    TeamServiceMethods,
    | "demoteToMemberAtTeam"
    | "promoteToAdminAtTeam"
    | "removeMembersAtTeam"
    | "refreshWorkspace"
  > &
    Pick<TeamRepositoryMethods, "updateUserRoleInTeam" | "removeUserFromTeam">;
  export let workspaceInvitePermissonMethods: workspaceInviteMethods;
  export let loggedInUser: boolean = false;
  export let hasPermission: boolean;
  export let currentWorkspaceDetails: { id: string; name: string };
  let isRemoveMemberPopup = false;
  let isRemoveTeamPopup = false;
  let isMemberInfoPopup: boolean = false;
  let activeWorkspaceOpertionId: string;
  let isPartOfOnlythisWorkspace: boolean;
  export let currentActiveTeam: TeamDocument;
  export let handleUserOnRemove: (
    workspaceId: string,
    userId: string,
  ) => Promise<void>;
  const handleRemove = async (workspaceId: string, userId: string) => {
    const response =
      await workspaceInvitePermissonMethods.deleteUserFromWorkspace(
        workspaceId,
        userId,
      );
    if (response && response?.data?.data) {
      await handleUserOnRemove(workspaceId, userId);
      await workspaceInvitePermissonMethods.deleteUserFromWorkspaceRxDB(
        workspaceId,
        userId,
      );
      notifications.success(
        `${name} removed from ${currentWorkspaceDetails.name}`,
      );
    } else {
      notifications.error(
        `Failed to  remove ${name} from ${currentWorkspaceDetails.name}`,
      );
    }

    showRemoveMemberPopup(false);
  };
  const handleDropdown = async (
    currentRole: TeamRole | WorkspaceRole | "remove" | "teamRemove",
    workspaceId?: string,
  ) => {
    activeWorkspaceOpertionId = workspaceId
      ? workspaceId
      : currentWorkspaceDetails.id;
    if (hasPermission && currentRole === TeamRole.TEAM_ADMIN) {
      const response = await teamWorkspaceMethods.promoteToAdminAtTeam(
        currentTeamDetails.id,
        id,
      );
      if (response) {
        role = currentRole;
        teamRole = currentRole;
        teamWorkspaceMethods.updateUserRoleInTeam(
          currentTeamDetails.id,
          id,
          teamRole,
        );
        response.workspaces.map(
          async (workspace: { id: string; name: string }) => {
            await workspaceInvitePermissonMethods.updateUsersInWorkspaceInRXDB(
              workspace.id,
              id,
              WorkspaceRole.WORKSPACE_ADMIN,
            );
          },
        );
        handleNotification(true, `${name} is now an admin`);
      } else {
        handleNotification(
          false,
          `Failed to change role for ${name}. Please try again.`,
        );
      }
    } else if (hasPermission && currentRole === TeamRole.TEAM_MEMBER) {
      const response: any = await teamWorkspaceMethods.demoteToMemberAtTeam(
        currentTeamDetails.id,
        id,
      );
      if (response) {
        teamRole = currentRole;
        role = currentRole;
        teamWorkspaceMethods.updateUserRoleInTeam(
          currentTeamDetails.id,
          id,
          teamRole,
        );
        response.workspaces.map(
          async (workspace: { id: string; name: string }) => {
            await workspaceInvitePermissonMethods.updateUsersInWorkspaceInRXDB(
              workspace.id,
              id,
              WorkspaceRole.WORKSPACE_EDITOR,
            );
          },
        );
        handleNotification(true, `${name} is now an member`);
      } else {
        handleNotification(
          false,
          `Failed to change role for ${name}. Please try again.`,
        );
      }
    } else if (hasPermission && currentRole === "teamRemove") {
      showRemoveTeamPopup(true);
    }
    if (
      (hasPermission && currentRole === WorkspaceRole.WORKSPACE_VIEWER) ||
      currentRole === WorkspaceRole.WORKSPACE_EDITOR
    ) {
      const response =
        await workspaceInvitePermissonMethods.updateRoleInWorkspace(
          activeWorkspaceOpertionId,
          id,
          currentRole,
        );
      if (response && response.data.data) {
        await workspaceInvitePermissonMethods.updateUsersInWorkspaceInRXDB(
          activeWorkspaceOpertionId,
          id,
          currentRole,
        );
        handleNotification(true, `${name} is now an ${currentRole}`);
      } else {
        handleNotification(
          false,
          `Failed to change role for ${name}. Please try again.`,
        );
      }
    }
    if (hasPermission && currentRole === "remove") {
      handleRemovePopup(true, id);
    }
  };
  const showRemoveMemberPopup = async (showMemberPopup: boolean) => {
    isRemoveMemberPopup = showMemberPopup;
  };
  const showRemoveTeamPopup = async (showMemberPopup: boolean) => {
    isRemoveTeamPopup = showMemberPopup;
  };
  const handleRemovePopup = async (
    showMemberPopup: boolean,
    userId: string,
  ) => {
    await checkIfUserExistInMultipleWorkspace(userId);
    showRemoveMemberPopup(showMemberPopup);
    return;
  };
  const checkIfUserExistInMultipleWorkspace = async (userId: string) => {
    isPartOfOnlythisWorkspace =
      await workspaceInvitePermissonMethods.checkIfUserIsPartOfMutipleWorkspaces(
        userId,
      );
  };
  let teamRole: TeamRole;
  currentActiveTeam._data.users.forEach((user) => {
    if (user?.id === id) {
      teamRole = user.role as TeamRole;
    }
  });

  const handleNotification = (isSuccess: boolean, message: string) => {
    isSuccess ? notifications.success(message) : notifications.error(message);
  };

  const handleMemberPopup = (showPopup: boolean) => {
    isMemberInfoPopup = showPopup;
  };

  let getPermissionsData = () => {
    const commonPermissions = [
      {
        name: "Admin",
        id: TeamRole.TEAM_ADMIN,
        color: "whiteColor",
      },
      {
        name: "Member",
        id: TeamRole.TEAM_MEMBER,
        color: "whiteColor",
      },
    ];
    if (
      (loggedUserRole === TeamRole.TEAM_OWNER &&
        teamRole === TeamRole.TEAM_MEMBER) ||
      (loggedUserRole === TeamRole.TEAM_ADMIN &&
        teamRole === TeamRole.TEAM_MEMBER)
    ) {
      return [
        ...commonPermissions,
        {
          name: "Remove",
          id: "teamRemove",
          color: "dangerColor",
        },
      ];
    } else if (
      loggedUserRole === TeamRole.TEAM_OWNER &&
      teamRole === TeamRole.TEAM_ADMIN
    ) {
      return [
        ...commonPermissions,
        {
          name: "Remove",
          id: "teamRemove",
          color: "dangerColor",
        },
      ];
    } else {
      return [
        {
          name: "Owner",
          id: TeamRole.TEAM_OWNER,
          color: "whiteColor",
        },
        ...commonPermissions,
      ];
    }
  };
  const handleRemoveUserFromTeam = async () => {
    const response = await teamWorkspaceMethods.removeMembersAtTeam(
      currentTeamDetails.id,
      id,
    );
    if (response) {
      teamWorkspaceMethods.removeUserFromTeam(currentTeamDetails.id, id);
      response.workspaces.map(
        async (workspace: { id: string; name: string }) => {
          await handleRemove(workspace.id, id);
        },
      );

      handleNotification(
        true,
        `${name} is removed from ${currentTeamDetails.name}`,
      );
    } else {
      handleNotification(
        false,
        `$Failed to remove ${name}  from ${currentWorkspaceDetails.name}`,
      );
    }
  };
  let memberRemoveLoader: boolean = false;
  let teamMemberRemoveLoader: boolean = false;
</script>

<div
  class="team-details user d-flex w-100% justify-content-between"
  on:click={() => {
    handleMemberPopup(true);
  }}
>
  <div class="user-info">
    <p
      class="profile-circle bg-dullBackgroundr text-white text-center d-flex align-items-center justify-content-center"
      style="width: 36px; height:36px;border-radius:50%;border:2px solid #45494D ;"
    >
      {name[0]}
    </p>
    <div class="user-info-details" style="position: relative">
      <p>{loggedInUser ? name + "(YOU)" : name}</p>
      <p class="user-email" style="position:absolute;bottom:0;">{email}</p>
    </div>
  </div>
  <div></div>
  <div class="user-info-role">
    {#if hasPermission}
      <MemberDropDown
        {id}
        data={[
          {
            name: "Editor",
            id: "editor",
            color: "whiteColor",
          },
          {
            name: "Viewer",
            id: "viewer",
            color: "whiteColor",
          },
          {
            name: "Remove",
            id: "remove",
            color: "dangerColor",
          },
        ]}
        method={role ? role : ""}
        onclick={handleDropdown}
        isWorkspaceMemberDropDown={true}
      />
    {:else}
      <div class="default-admin-container p-2 rounded z-2">
        <p class="m-0 p-0 text-white text-capitalize" style="font-size: 12px;">
          {role}
        </p>
      </div>
    {/if}
    <ModalWrapperV1
      title={"Remove user?"}
      type={"danger"}
      width={"35%"}
      zIndex={10000}
      isOpen={isRemoveMemberPopup}
      handleModalState={showRemoveMemberPopup}
    >
      <div class="text-lightGray mb-1 sparrow-fs-14">
        <p class="text-lightGray">
          Are you sure you want to remove <span class="text-whiteColor fw-bold"
            >{name}</span
          >? They will lose access to the
          <span class="text-whiteColor fw-bold"
            >{currentWorkspaceDetails.name}</span
          >
          workspace.

          {isPartOfOnlythisWorkspace
            ? `
            They will still have access to other workspaces that they are part of.
        `
            : `
            Since they are not part of any other workspace, they will lose access to ${currentTeamDetails.name} team as well.
          `}
        </p>
      </div>
      <div
        class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 pb-3 rounded"
        style="font-size: 16px;"
      >
        <CustomButton
          disable={memberRemoveLoader}
          text={"Cancel"}
          fontSize={14}
          type={"dark"}
          loader={false}
          onClick={() => {
            showRemoveMemberPopup(false);
          }}
        />

        <CustomButton
          disable={memberRemoveLoader}
          text={"Remove"}
          fontSize={14}
          type={"danger"}
          loader={memberRemoveLoader}
          onClick={async () => {
            memberRemoveLoader = true;
            await handleRemove(activeWorkspaceOpertionId, id);
            memberRemoveLoader = false;
          }}
        />
      </div>
    </ModalWrapperV1>

    <ModalWrapperV1
      title={"Remove user?"}
      type={"danger"}
      width={"35%"}
      zIndex={10000}
      isOpen={isRemoveTeamPopup}
      handleModalState={showRemoveTeamPopup}
    >
      <div class="text-lightGray mb-1 sparrow-fs-14">
        <p class="text-lightGray">
          Are you sure you want to remove <span class="text-whiteColor fw-bold"
            >{name}</span
          >? They will lose access to the
          <span class="text-whiteColor fw-bold">{currentTeamDetails.name}</span>
          Team.
        </p>
      </div>
      <div
        class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 pb-3 rounded"
        style="font-size: 16px;"
      >
        <CustomButton
          disable={teamMemberRemoveLoader}
          text={"Cancel"}
          fontSize={14}
          type={"dark"}
          loader={false}
          onClick={() => {
            showRemoveTeamPopup(false);
          }}
        />

        <CustomButton
          disable={teamMemberRemoveLoader}
          text={"Remove"}
          fontSize={14}
          type={"danger"}
          loader={teamMemberRemoveLoader}
          onClick={async () => {
            teamMemberRemoveLoader = true;
            await handleRemoveUserFromTeam();
            teamMemberRemoveLoader = false;
          }}
        />
      </div>
    </ModalWrapperV1>
  </div>
</div>

<ModalWrapperV1
  title={`Access to ${currentTeamDetails.name}`}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isMemberInfoPopup}
  handleModalState={handleMemberPopup}
>
  <MemberInfoPopup
    owner={loggedInUser}
    {teamRole}
    user={{
      id,
      name,
      email,
      role,
      workspaceId: currentWorkspaceDetails.id,
    }}
    workspaces={currentTeamworkspaces.map((elem) => {
      let element = elem.toMutableJSON();
      for (let i = 0; i < element.users.length; i++) {
        if (element.users[i].id === id) {
          element["position"] = elem.users[i].role;
          break;
        }
      }
      return element;
    })}
    userType={loggedUserRole}
    userId={id}
    getPermissionsData={() => {
      return getPermissionsData();
    }}
    handleDropDownWorkspaceLevel={handleDropdown}
    isWorkspaceMemberInfo={true}
  />
</ModalWrapperV1>

<style>
  .user:hover {
    background-color: var(--background-light) !important;
  }
  .profile-circle {
    border-radius: 50%;
  }
  .user-email {
    position: absolute;
    bottom: 0;
    color: var(--button-color);
  }
  .user-info {
    display: flex;
    gap: 5px;
    justify-content: center;
  }
  .user-info-details {
    display: flex;
    gap: 2px;
    font-size: 12px;
    flex-direction: column;
  }
  .user-info-role {
    font-size: 14px;
    margin-top: 5px;
  }
  .select-option:focus {
    border: 2px solid var(--workspace-hover-color);
  }
  select {
    border: 2px solid var(--workspace-hover-color);
  }
  .default-admin-container {
    background: none;
    outline: none;
    border: none;
    height: 34px;
    width: auto;
    padding: 0 10px;
    border: 1px solid transparent;
    cursor: pointer;
  }
  .default-admin-container:hover {
    background-color: var(--border-color);
  }
</style>
