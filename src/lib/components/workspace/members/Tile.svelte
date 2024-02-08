<script lang="ts">
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import { base64ToURL } from "$lib/utils/helpers";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
    userDetails,
    workspaceDocumentWithPosition,
  } from "$lib/utils/interfaces";
  import MemberInfoPopup from "../member-info/MemberInfo.svelte";
  import { notifications } from "$lib/utils/notifications";
  import { TeamRole } from "$lib/utils/enums/team.enum";
  import { v4 as uuidv4 } from "uuid";
  import { AdminLevelPermission } from "$lib/utils/constants/permissions.constant";
  import type { MemberPopType } from "$lib/utils/types/common.type";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import Button from "$lib/components/buttons/Button.svelte";
  export let user: userDetails;
  export let userType: TeamRole;
  export let openTeam;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;
  export let workspaces: workspaceDocumentWithPosition;
  export let userId: string;
  export let owner: boolean = false;

  const handleDropdown = (id: TeamRole | "remove") => {
    if (id === "remove") {
      memberPopObj.isMemberRemovePopup = true;
    } else if (
      user.role === TeamRole.TEAM_ADMIN &&
      id === TeamRole.TEAM_MEMBER
    ) {
      memberPopObj.isMemberDemotePopup = true;
    } else if (
      user.role === TeamRole.TEAM_MEMBER &&
      id === TeamRole.TEAM_ADMIN
    ) {
      memberPopObj.isMemberPromotePopup = true;
    } else if (
      user.role === TeamRole.TEAM_ADMIN &&
      id === TeamRole.TEAM_OWNER
    ) {
      memberPopObj.isMemberOwnershipPopup = true;
    }
  };
  const memberPopObj = {
    isMemberRemovePopup: false,
    isMemberPromotePopup: false,
    isMemberDemotePopup: false,
    isMemberInfoPopup: false,
    isMemberOwnershipPopup: false,
  };

  const handlePopup = (flag: boolean, popType: MemberPopType): void => {
    switch (popType) {
      case "isMemberRemovePopup":
        memberPopObj.isMemberRemovePopup = flag;
        break;
      case "isMemberPromotePopup":
        memberPopObj.isMemberPromotePopup = flag;
        break;
      case "isMemberDemotePopup":
        memberPopObj.isMemberDemotePopup = flag;
        break;
      case "isMemberInfoPopup":
        memberPopObj.isMemberInfoPopup = flag;
        break;
      case "isMemberOwnershipPopup":
        memberPopObj.isMemberOwnershipPopup = flag;
        break;
      default:
        break;
    }
  };

  const handleMemberPopUpSuccess = async () => {
    const response = await teamServiceMethods.removeMembersAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      memberPopObj.isMemberRemovePopup = false;
      notifications.success(`${user.name} is removed from ${openTeam.name}`);
    } else {
      notifications.error(
        `Failed to remove ${user.name} from ${openTeam.name}`,
      );
    }
  };
  const handleMemberDemotePopUpSuccess = async () => {
    const response = await teamServiceMethods.demoteToMemberAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      memberPopObj.isMemberDemotePopup = false;
      notifications.success(`${user.name} is now a member`);
    } else {
      notifications.error(
        `Failed to change role for ${user.name}. Please try again.`,
      );
    }
  };
  export const handleMemberPromotePopUpSuccess = async () => {
    const response = await teamServiceMethods.promoteToAdminAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      memberPopObj.isMemberPromotePopup = false;
      notifications.success(`${user.name} is now an admin`);
    } else {
      notifications.error(
        `Failed to change role for ${user.name}. Please try again.`,
      );
    }
  };

  const handleMemberOwnershipPopUpSuccess = async () => {
    const response = await teamServiceMethods.promoteToOwnerAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      memberPopObj.isMemberOwnershipPopup = false;
      notifications.success(
        `${user.name} is now the new Owner of ${openTeam.name}.`,
      );
    } else {
      notifications.error(
        `Failed to update access of Owner. Please try again.`,
      );
    }
  };
  export let getPermissionsData = () => {
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
      (userType === TeamRole.TEAM_OWNER &&
        user.role === TeamRole.TEAM_MEMBER) ||
      (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_MEMBER)
    ) {
      return [
        ...commonPermissions,
        {
          name: "Remove",
          id: "remove",
          color: "dangerColor",
        },
      ];
    } else if (
      userType === TeamRole.TEAM_OWNER &&
      user.role === TeamRole.TEAM_ADMIN
    ) {
      return [
        {
          name: "Owner",
          id: TeamRole.TEAM_OWNER,
          color: "whiteColor",
        },
        ...commonPermissions,
        {
          name: "Remove",
          id: "remove",
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
  let memberRemovePopupLoader: boolean = false;
  let memberPromotePopupLoader: boolean = false;
  let memberDemotePopupLoader: boolean = false;
  let memberOwnershipPopupLoader: boolean = false;
  let confirmationText: string = "";
  let confirmationError: string = "";
</script>

<ModalWrapperV1
  title={"Remove user?"}
  type={"danger"}
  width={"35%"}
  zIndex={10000}
  isOpen={memberPopObj.isMemberRemovePopup}
  handleModalState={(flag) => {
    handlePopup(flag, "isMemberRemovePopup");
  }}
>
  <div style="font-size: 14px;" class="text-lightGray mb-1">
    <p style="font-size:12px;" class="text-textColor">
      Are you sure you want to remove <span class="text-whiteColor"
        >"{user.name}"</span
      >
      ? They will lose access to the
      <span class="text-whiteColor">"{openTeam?.name}"</span> team.
    </p>
  </div>
  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 pb-3 rounded"
    style="font-size: 16px;"
  >
    <Button
      disable={memberRemovePopupLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-size)"}
      type={"dark"}
      loader={false}
      onClick={() => {
        handlePopup(false, "isMemberRemovePopup");
      }}
    />

    <Button
      disable={memberRemovePopupLoader}
      title={"Remove"}
      textStyleProp={"font-size: var(--base-size)"}
      loaderSize={18}
      type={"danger"}
      loader={memberRemovePopupLoader}
      onClick={() => {
        memberRemovePopupLoader = true;
        handleMemberPopUpSuccess();
        memberRemovePopupLoader = false;
      }}
    />
  </div>
</ModalWrapperV1>

<ModalWrapperV1
  title={"Changing Role?"}
  type={"dark"}
  width={"35%"}
  zIndex={10000}
  isOpen={memberPopObj.isMemberPromotePopup}
  handleModalState={(flag) => {
    handlePopup(flag, "isMemberPromotePopup");
  }}
>
  <div style="font-size: 14px;" class="text-lightGray mb-1">
    <div class="d-flex tile rounded mb-3">
      <div class="info d-flex align-items-center">
        <div
          class="d-flex align-items-center justify-content-center"
          style="width: 36px;
        border: 1px solid var(--border-color);
        height: 36px;
        border-radius: 50%;"
        >
          <span>{user.name[0].toUpperCase()}</span>
        </div>
        <div class="name px-2">
          <span style="font-size:12px;" class="text-whiteColor"
            >{user.name}</span
          ><br />
          <span style="font-size:12px;" class="text-textColor"
            >{user.email}</span
          >
        </div>
      </div>
    </div>

    <p style="font-size:12px;" class="text-textColor">
      You are assigning the role of an '<span class="text-whiteColor"
        >Admin</span
      >' to ${user.name}. Following access will be provided to ${user.name}:
    </p>
    <ul class="ps-4 text-textColor" style="font-size:12px;">
      {#each AdminLevelPermission as permission}
        <li>{permission}</li>
      {/each}
    </ul>
  </div>
  <div
    class="d-flex align-items-center justify-content-between gap-3 mt-1 pb-3 mb-0 rounded"
    style="font-size: 16px;"
  >
    <div class="d-flex align-items-center">
      {#if openTeam?.logo}
        <img class="team-icon me-2" src={base64ToURL(openTeam?.logo)} alt="" />
      {/if}
      <p style="font-size:16px;" class="mb-0">{openTeam?.name}</p>
    </div>

    <Button
      disable={memberPromotePopupLoader}
      title={"Update Access"}
      textStyleProp={"font-size: var(--base-size)"}
      loaderSize={18}
      type={"primary"}
      loader={memberPromotePopupLoader}
      onClick={() => {
        memberPromotePopupLoader = true;
        handleMemberPromotePopUpSuccess();
        memberPromotePopupLoader = false;
      }}
    />
  </div></ModalWrapperV1
>

<ModalWrapperV1
  title={"Changing Role?"}
  type={"dark"}
  width={"35%"}
  zIndex={10000}
  isOpen={memberPopObj.isMemberDemotePopup}
  handleModalState={(flag) => {
    handlePopup(flag, "isMemberDemotePopup");
  }}
>
  <div style="font-size: 14px;" class="text-lightGray mb-1">
    <div class="d-flex tile rounded mb-3">
      <div class="info d-flex align-items-center">
        <div
          class="d-flex align-items-center justify-content-center"
          style="width: 36px;
        border: 1px solid var(--border-color);
        height: 36px;
        border-radius: 50%;"
        >
          <span>{user.name[0].toUpperCase()}</span>
        </div>
        <div class="name px-2">
          <span style="font-size:12px;" class="text-whiteColor"
            >{user.name}</span
          ><br />
          <span style="font-size:12px;" class="text-textColor"
            >{user.email}</span
          >
        </div>
      </div>
    </div>

    <p style="font-size:12px;" class="text-textColor">
      Upon transitioning an Admin to a Member, 'Edit' access will be
      automatically provided for all assigned workspaces.
    </p>
  </div>
  <div
    class="d-flex align-items-center justify-content-between gap-3 mt-1 pb-3 mb-0 rounded"
    style="font-size: 16px;"
  >
    <div class="d-flex align-items-center">
      {#if openTeam?.logo}
        <img class="team-icon me-2" src={base64ToURL(openTeam?.logo)} alt="" />
      {/if}
      <p style="font-size:16px;" class="mb-0">{openTeam?.name}</p>
    </div>

    <Button
      disable={memberDemotePopupLoader}
      title={"Update Access"}
      textStyleProp={"font-size: var(--base-size)"}
      loaderSize={18}
      type={"primary"}
      loader={memberDemotePopupLoader}
      onClick={() => {
        memberDemotePopupLoader = true;
        handleMemberDemotePopUpSuccess();
        memberDemotePopupLoader = false;
      }}
    />
  </div></ModalWrapperV1
>

<ModalWrapperV1
  title={"Changing Role?"}
  type={"dark"}
  width={"35%"}
  zIndex={10000}
  isOpen={memberPopObj.isMemberOwnershipPopup}
  handleModalState={(flag) => {
    handlePopup(flag, "isMemberOwnershipPopup");
  }}
>
  <div style="font-size: 14px;" class="text-lightGray mb-1">
    <div class="d-flex tile rounded mb-3">
      <div class="info d-flex align-items-center">
        <div
          class="d-flex align-items-center justify-content-center"
          style="width: 36px;
        border: 1px solid var(--border-color);
        height: 36px;
        border-radius: 50%;"
        >
          <span>{user.name[0].toUpperCase()}</span>
        </div>
        <div class="name px-2">
          <span style="font-size:12px;" class="text-whiteColor"
            >{user.name}</span
          ><br />
          <span style="font-size:12px;" class="text-textColor"
            >{user.email}</span
          >
        </div>
      </div>
    </div>

    <p style="font-size:12px;" class="text-textColor">
      You are assigning the role of <span class="text-whiteColor">‘Owner’</span>
      to {user.name}. All the Owner’s access will be transferred to {user.name}
      and you will be demoted to Admin. This action cannot be undone.
    </p>
  </div>

  <p class="confirm-header mb-0">
    Enter Team name to confirm<span class="asterik">*</span>
  </p>
  <input
    id={`input-${user.id}`}
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
        confirmationError = `Team name cannot be empty.`;
      } else if (confirmationText !== openTeam?.name) {
        confirmationError = `Team name does not match.`;
      } else {
        confirmationError = "";
      }
    }}
    class="input-container mt-2 mb-1 {confirmationError ? 'error-border' : ''}"
  />
  {#if confirmationError}
    <p class="error-text">{confirmationError}</p>
  {/if}
  <br />

  <div
    class="d-flex align-items-center justify-content-between gap-3 mt-1 pb-3 mb-0 rounded"
    style="font-size: 16px;"
  >
    <div class="d-flex align-items-center">
      {#if openTeam?.logo}
        <img class="team-icon me-2" src={base64ToURL(openTeam?.logo)} alt="" />
      {/if}
      <p style="font-size:16px;" class="mb-0">{openTeam?.name}</p>
    </div>
    <Button
      disable={memberOwnershipPopupLoader ||
        confirmationText !== openTeam?.name}
      title={"Update Access"}
      textStyleProp={"font-size: var(--base-size)"}
      loaderSize={18}
      type={"primary"}
      loader={memberOwnershipPopupLoader}
      onClick={() => {
        memberOwnershipPopupLoader = true;
        handleMemberOwnershipPopUpSuccess();
        memberOwnershipPopupLoader = false;
      }}
    />
  </div>
</ModalWrapperV1>

<ModalWrapperV1
  title={`Access to ${openTeam?.name}`}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={memberPopObj.isMemberInfoPopup}
  handleModalState={(flag) => {
    handlePopup(flag, "isMemberInfoPopup");
  }}
>
  <MemberInfoPopup
    {owner}
    {user}
    workspaces={workspaces.map((elem) => {
      let element = elem.toMutableJSON();
      for (let i = 0; i < element.users.length; i++) {
        if (element.users[i].id === user.id) {
          element.position = elem.users[i].role;
          break;
        }
      }
      return element;
    })}
    {userType}
    {userId}
    {handlePopup}
    {teamServiceMethods}
    {handleMemberPopUpSuccess}
    {getPermissionsData}
  />
</ModalWrapperV1>
<div class="d-flex tile rounded align-items-center">
  <div
    class="info d-flex align-items-center"
    on:click={() => {
      memberPopObj.isMemberInfoPopup = true;
    }}
  >
    <div class="icon d-flex align-items-center justify-content-center">
      <span>{user.name[0].toUpperCase()}</span>
    </div>
    <div class="name px-2">
      <span style="font-size:12px;" class="text-whiteColor"
        >{user.name} {owner ? "(You)" : ""}</span
      ><br />
      <span style="font-size:12px;" class="text-textColor">{user.email}</span>
    </div>
  </div>
  <div class="position">
    {#if (userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_MEMBER) || (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_MEMBER)}
      <MemberDropdown
        id={user.id + uuidv4()}
        data={getPermissionsData()}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {:else if userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_ADMIN}
      <MemberDropdown
        id={user.id + uuidv4()}
        data={getPermissionsData()}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {:else}
      <MemberDropdown
        id={user.id + uuidv4()}
        disabled={true}
        data={getPermissionsData()}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {/if}
  </div>
</div>

<style>
  .tile:hover {
    background-color: var(--background-light) !important;
  }
  .icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
  }
  .info {
    width: calc(100% - 120px);
    height: 48px;
    padding: 8px !important;
  }
  .position {
    width: 120px;
    padding: 8px;
  }
</style>
