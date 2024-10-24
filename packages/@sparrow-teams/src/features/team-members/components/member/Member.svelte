<script lang="ts">
  import { base64ToURL } from "@sparrow/common/utils";
  import type {
    userDetails,
    workspaceDocumentWithPosition,
  } from "@sparrow/common/interfaces";
  import { TeamRole } from "@sparrow/common/enums/team.enum";
  import { AdminLevelPermission } from "@sparrow/common/constants/permissions.constant";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { Profile } from "..";
  import { Select } from "@sparrow/library/forms";
  import { IconFallback } from "@sparrow/library/ui";
  export let user: userDetails;
  export let userType: TeamRole;
  export let openTeam;
  export let workspaces: workspaceDocumentWithPosition;
  export let userId: string;
  export let owner: boolean = false;

  /**
   * function to remove members from team
   */
  export let onRemoveMembersAtTeam;
  /**
   * function to demote admins at team
   */
  export let onDemoteToMemberAtTeam;
  /**
   * function to promote to admin at team
   */
  export let onPromoteToAdminAtTeam;
  /**
   * function to promote to owner at team
   */
  export let onPromoteToOwnerAtTeam;
  /**
   * function to remove member from workspace
   */
  export let onRemoveUserFromWorkspace;
  /**
   * function to change user role at workspace
   */
  export let onChangeUserRoleAtWorkspace;

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

  const handlePopup = (flag: boolean, popType: string): void => {
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
    memberRemovePopupLoader = true;
    const response = await onRemoveMembersAtTeam(
      openTeam.teamId,
      openTeam.name,
      user.id,
      user.name,
    );
    if (response.isSuccessful) {
      memberPopObj.isMemberRemovePopup = false;
    }
    memberRemovePopupLoader = false;
  };
  const handleMemberDemotePopUpSuccess = async () => {
    memberDemotePopupLoader = true;
    const response = await onDemoteToMemberAtTeam(
      openTeam.teamId,
      openTeam.name,
      user.id,
      user.name,
    );
    if (response.isSuccessful) {
      memberPopObj.isMemberDemotePopup = false;
    }
    memberDemotePopupLoader = false;
  };
  export const handleMemberPromotePopUpSuccess = async () => {
    memberPromotePopupLoader = true;
    const response = await onPromoteToAdminAtTeam(
      openTeam.teamId,
      openTeam.name,
      user.id,
      user.name,
    );
    if (response.isSuccessful) {
      memberPopObj.isMemberPromotePopup = false;
    }
    memberPromotePopupLoader = false;
  };

  const handleMemberOwnershipPopUpSuccess = async () => {
    memberOwnershipPopupLoader = true;
    const response = await onPromoteToOwnerAtTeam(
      openTeam.teamId,
      openTeam.name,
      user.id,
      user.name,
    );
    if (response?.isSuccessful) {
      memberPopObj.isMemberOwnershipPopup = false;
    }
    memberOwnershipPopupLoader = false;
    memberPopObj.isMemberOwnershipPopup = false;
  };
  export let getPermissionsData = () => {
    const commonPermissions = [
      {
        name: "Admin",
        id: TeamRole.TEAM_ADMIN,
        color: "light",
      },
      {
        name: "Member",
        id: TeamRole.TEAM_MEMBER,
        color: "light",
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
          color: "danger",
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
          color: "light",
        },
        ...commonPermissions,
        {
          name: "Remove",
          id: "remove",
          color: "danger",
        },
      ];
    } else if (
      userType === TeamRole.TEAM_ADMIN &&
      user.role === TeamRole.TEAM_ADMIN
    ) {
      return [
        ...commonPermissions,
        {
          name: "Remove",
          id: "remove",
          color: "danger",
        },
      ];
    } else {
      return [
        {
          name: "Owner",
          id: TeamRole.TEAM_OWNER,
          color: "light",
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

<Modal
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
      textStyleProp={"font-size: var(--base-text)"}
      type={"dark"}
      loader={false}
      onClick={() => {
        handlePopup(false, "isMemberRemovePopup");
      }}
    />

    <Button
      disable={memberRemovePopupLoader}
      title={"Remove"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"danger"}
      loader={memberRemovePopupLoader}
      onClick={handleMemberPopUpSuccess}
    />
  </div>
</Modal>

<Modal
  title={"Changing Role?"}
  type={"dark"}
  width={"35%"}
  zIndex={10000}
  isOpen={memberPopObj.isMemberPromotePopup}
  handleModalState={(flag) => {
    handlePopup(flag, "isMemberPromotePopup");
  }}
>
  <div style="font-size: 14px;" class="text-lightGray">
    <div
      class="d-flex rounded"
      style=" margin-top:16px !important; margin-bottom:16px !important;"
    >
      <div class="d-flex align-items-center">
        <div
          class="d-flex align-items-center justify-content-center"
          style="width: 36px;
          border: 1px solid var(--border-color);
          height: 36px;
          border-radius: 50%;"
        >
          <span>{user.name[0].toUpperCase()}</span>
        </div>
        <div class="name px-2" style="width: 80%;">
          <span style="font-size:12px;" class="text-whiteColor"
            >{user.name}</span
          ><br />
          <span style="font-size:12px;" class="text-textColor"
            >{user.email}</span
          >
        </div>
      </div>
    </div>

    <p
      style="font-size:12px; color:var( --text-secondary-1000); font-weight:400;"
    >
      You are assigning the role of an '<span
        class="text-whiteColor"
        style=" font-weight:700;">Admin</span
      >' to {user.name}. Following access will be provided to {user.name}:
    </p>
    <ul class="ps-4" style="font-size:12px; color:var( --text-secondary-1000);">
      {#each AdminLevelPermission as permission}
        <li>{permission}</li>
      {/each}
    </ul>
  </div>
  <div
    class="d-flex align-items-center justify-content-between gap-3 mt-1 pt-2 mb-0 rounded"
    style="font-size: 16px;"
  >
    <div class="d-flex align-items-center ellipsis gap-2">
      <div style="width: 36px;">
        {#if openTeam?.logo?.size}
          <img
            class="team-icon me-2"
            src={base64ToURL(openTeam?.logo)}
            alt=""
          />
        {:else}
          <IconFallback character={openTeam?.name[0]} />
        {/if}
      </div>
      <p style="font-size:16px;" class="mb-0 ellipsis">{openTeam?.name}</p>
    </div>

    <Button
      disable={memberPromotePopupLoader}
      title={"Update Access"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"primary"}
      loader={memberPromotePopupLoader}
      onClick={() => {
        handleMemberPromotePopUpSuccess();
      }}
    />
  </div></Modal
>

<Modal
  title={"Changing Role?"}
  type={"dark"}
  width={"35%"}
  zIndex={10000}
  isOpen={memberPopObj.isMemberDemotePopup}
  handleModalState={(flag) => {
    handlePopup(flag, "isMemberDemotePopup");
  }}
>
  <div style="font-size: 14px;" class="text-lightGray mb-1 mt-2">
    <div class="d-flex rounded mb-3">
      <div class=" d-flex align-items-center">
        <div
          class="d-flex align-items-center justify-content-center"
          style="width: 36px;
          border: 1px solid var(--border-color);
          height: 36px;
          border-radius: 50%;"
        >
          <span>{user.name[0].toUpperCase()}</span>
        </div>
        <div class="name px-2" style="width: 80%;">
          <span style="font-size:12px;" class="text-whiteColor"
            >{user.name}</span
          ><br />
          <span style="font-size:12px;" class="text-textColor"
            >{user.email}</span
          >
        </div>
      </div>
    </div>

    <p style="font-size:12px; color:var(--text-secondary-1000) !important;">
      Upon transitioning an Admin to a Member, 'Edit' access will be
      automatically provided for all assigned workspaces.
    </p>
  </div>
  <div
    class="d-flex align-items-center justify-content-between gap-3 mt-1 pb-3 mb-0 rounded"
    style="font-size: 16px; padding-top:16px; padding-bottom:0px !important; "
  >
    <div class="d-flex align-items-center ellipsis gap-2">
      <div style="width: 36px;">
        {#if openTeam?.logo?.size}
          <img
            class="text-center w-25 align-items-center justify-content-center profile-circle bg-dullBackground"
            style="width: 36px !important; height: 36px !important; padding-top: 2px; display: flex; border-radius: 50%;"
            src={base64ToURL(openTeam?.logo)}
            alt=""
          />
        {:else}
          <IconFallback character={openTeam?.name[0]} />
        {/if}
      </div>
      <p style="font-size:16px;" class="mb-0 ellipsis">{openTeam?.name}</p>
    </div>
    <div>
      <Button
        disable={memberDemotePopupLoader}
        title={"Update Access"}
        textStyleProp={"font-size: var(--base-text)"}
        loaderSize={18}
        type={"primary"}
        loader={memberDemotePopupLoader}
        onClick={() => {
          handleMemberDemotePopUpSuccess();
        }}
      />
    </div>
  </div></Modal
>

<Modal
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
    <div class="d-flex rounded mb-3" style="padding-left: 0px !important;">
      <div class="d-flex align-items-center">
        <div
          class="d-flex align-items-center justify-content-center"
          style="width: 36px;
          border: 1px solid var(--border-color);
          height: 36px;
          border-radius: 50%;"
        >
          <span>{user.name[0].toUpperCase()}</span>
        </div>
        <div class="name px-2" style="width: 80%;">
          <span style="font-size:12px;" class="text-whiteColor"
            >{user.name}</span
          ><br />
          <span style="font-size:12px;" class="text-textColor"
            >{user.email}</span
          >
        </div>
      </div>
    </div>

    <p
      style="font-size:12px; color:var(--text-secondary-1000); font-weight:400;"
    >
      You are assigning the role of <span class="text-whiteColor">‘Owner’</span>
      to {user.name}. All the Owner’s access will be transferred to {user.name}
      and you will be demoted to Admin. This action cannot be undone.
    </p>
  </div>

  <p
    class="confirm-header mb-0 sparrow-fs-14"
    style="color: var(--text-secondary-200);"
  >
    Enter team name to confirm<span class="asterik ms-1">*</span>
  </p>
  <input
    id={`input-${user.id}`}
    placeholder=""
    autocomplete="off"
    autocapitalize="none"
    autofocus
    style="outline:none;border:none;flex-grow:1; background-color: var(--bg-tertiary-300);"
    bind:value={confirmationText}
    on:input={() => {
      confirmationError = "";
    }}
    class="input-container rounded w-100 p-2 mt-2 mb-1 {confirmationError
      ? 'error-border'
      : ''}"
  />
  {#if confirmationError}
    <p class="error-text sparrow-fs-12">{confirmationError}</p>
  {/if}
  <br />

  <div
    class="d-flex align-items-center justify-content-between gap-3 pb-3 mb-0 rounded"
    style="font-size: 16px; margin-top:16px;  padding-bottom:0px !important;"
  >
    <div class="d-flex align-items-center ellipsis gap-2">
      <div style="width: 36px;">
        {#if openTeam?.logo?.size}
          <img
            class="text-center w-25 align-items-center justify-content-center profile-circle bg-dullBackground"
            style="width: 36px !important; height: 36px !important; padding-top: 2px; display: flex; border-radius: 50%;"
            src={base64ToURL(openTeam?.logo)}
            alt=""
          />
        {:else}
          <IconFallback character={openTeam?.name[0]} />
        {/if}
      </div>
      <p style="font-size:16px;" class="mb-0 ellipsis">{openTeam?.name}</p>
    </div>
    <Button
      disable={memberOwnershipPopupLoader}
      title={"Update Access"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"primary"}
      loader={memberOwnershipPopupLoader}
      onClick={() => {
        confirmationText = confirmationText.replace(/’/g, "'");
        if (confirmationText === "") {
          confirmationError = `Team name cannot be empty.`;
        } else if (confirmationText !== openTeam?.name) {
          confirmationError = `Team name does not match.`;
        } else {
          confirmationError = "";
          handleMemberOwnershipPopUpSuccess();
        }
      }}
    />
  </div>
</Modal>

<Modal
  title={`Access to ${openTeam?.name}`}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={memberPopObj.isMemberInfoPopup}
  handleModalState={(flag) => {
    handlePopup(flag, "isMemberInfoPopup");
  }}
>
  <Profile
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
    {handleMemberPopUpSuccess}
    {getPermissionsData}
    {onRemoveUserFromWorkspace}
    {onChangeUserRoleAtWorkspace}
  />
</Modal>

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
      <Select
        id={user.id}
        data={getPermissionsData()}
        titleId={user.role ? user.role : ""}
        onclick={handleDropdown}
        menuItem={"v2"}
        headerTheme={"blur"}
        bodyTheme={"violet"}
        borderType={"none"}
        headerFontSize={"10px"}
        disabled={owner}
        borderRounded={"4px"}
      />
    {:else if (userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_ADMIN) || (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_ADMIN)}
      <Select
        id={user.id}
        data={getPermissionsData()}
        titleId={user.role ? user.role : ""}
        onclick={handleDropdown}
        menuItem={"v2"}
        headerTheme={"blur"}
        bodyTheme={"violet"}
        borderType={"none"}
        disabled={owner}
        headerFontSize={"10px"}
        borderRounded={"4px"}
      />
    {:else}
      <Select
        id={user.id}
        data={getPermissionsData()}
        titleId={user.role ? user.role : ""}
        onclick={handleDropdown}
        menuItem={"v2"}
        headerTheme={"transparent"}
        borderType={"none"}
        disabled={true}
        headerFontSize={"10px"}
      />
    {/if}
  </div>
</div>

<style lang="scss">
  .tile:hover {
    background-color: var(--bg-tertiary-600) !important;
    .name span:nth-child(1) {
      color: var(--text-primary-300) !important;
    }
  }
  .icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border-secondary-300);
    background-color: var(--bg-tertiary-750);
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
  .team-icon {
    height: 24px;
    width: 24px;
  }
  .asterik {
    color: var(--dangerColor);
  }
  .input-container {
    background-color: var(--background-dropdown);
    border: 1px solid var(--border-color) !important;
  }
  .error-text {
    margin-top: 2px;
    margin-bottom: 0 !important;
    color: var(--error--color);
  }
  .error-border {
    border: 1px solid var(--error--color) !important;
  }
</style>
