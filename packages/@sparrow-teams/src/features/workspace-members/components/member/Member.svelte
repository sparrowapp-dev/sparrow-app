<script lang="ts">
  import { Select } from "@sparrow/library/forms";
  import { WorkspaceRole } from "@sparrow/common/enums/team.enum";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";

  /**
   * Function to remove user from workspace.
   */
  export let onRemoveUserFromWorkspace;

  /**
   * Function to change role of user in workspace.
   */
  export let onChangeUserRoleAtWorkspace;

  /**
   * Current workspace which is active.
   */
  export let activeWorkspace;

  /**
   * user at workspace level
   */
  export let user;

  /**
   * Current user with its role.
   */
  export let activeUser;

  /**
   * Indicates if the current user is active.
   */
  export let isActiveUser;

  let getPermissionsData = () => {
    const commonPermissions = [
      {
        name: "Editor",
        id: WorkspaceRole.WORKSPACE_EDITOR,
        color: "light",
      },
      {
        name: "Viewer",
        id: WorkspaceRole.WORKSPACE_VIEWER,
        color: "light",
      },
      {
        name: "Remove",
        id: "remove",
        color: "danger",
      },
    ];

    if (
      (activeUser?.role === WorkspaceRole.WORKSPACE_ADMIN &&
        user.role === WorkspaceRole.WORKSPACE_EDITOR) ||
      (activeUser?.role === WorkspaceRole.WORKSPACE_ADMIN &&
        user.role === WorkspaceRole.WORKSPACE_VIEWER)
    ) {
      return [...commonPermissions];
    } else {
      return [
        ...commonPermissions,
        {
          name: "Admin",
          id: WorkspaceRole.WORKSPACE_ADMIN,
          color: "light",
        },
      ];
    }
  };

  const handleDropdown = (id: WorkspaceRole | "remove") => {
    if (id === "remove") {
      memberPopObj.isMemberRemovePopup = true;
    } else if (
      user.role !== WorkspaceRole.WORKSPACE_VIEWER &&
      id === WorkspaceRole.WORKSPACE_VIEWER
    ) {
      handleMemberDemotePopUpSuccess();
    } else if (
      user.role !== WorkspaceRole.WORKSPACE_EDITOR &&
      id === WorkspaceRole.WORKSPACE_EDITOR
    ) {
      handleMemberPromotePopUpSuccess();
    }
  };

  const memberPopObj = {
    isMemberRemovePopup: false,
  };

  const handlePopup = (flag: boolean, popType: string): void => {
    switch (popType) {
      case "isMemberRemovePopup":
        memberPopObj.isMemberRemovePopup = flag;
        break;
      default:
        break;
    }
  };

  let memberRemovePopupLoader: boolean = false;
  let memberPromotePopupLoader: boolean = false;
  let memberDemotePopupLoader: boolean = false;

  const handleRemoveUserFromWorkspace = async () => {
    memberRemovePopupLoader = true;
    const response = await onRemoveUserFromWorkspace(
      activeWorkspace._id,
      activeWorkspace.name,
      user.id,
      user.name,
    );
    if (response?.isSuccessful) {
      memberPopObj.isMemberRemovePopup = false;
    }
    memberRemovePopupLoader = false;
  };

  const handleMemberDemotePopUpSuccess = async () => {
    memberDemotePopupLoader = true;
    const response = await onChangeUserRoleAtWorkspace(
      activeWorkspace._id,
      activeWorkspace.name,
      user.id,
      user.name,
      WorkspaceRole.WORKSPACE_VIEWER,
    );
    if (response?.isSuccessful) {
      memberPopObj.isMemberEditorPopup = false;
    }
    memberDemotePopupLoader = false;
  };

  export const handleMemberPromotePopUpSuccess = async () => {
    memberPromotePopupLoader = true;
    const response = await onChangeUserRoleAtWorkspace(
      activeWorkspace._id,
      activeWorkspace.name,
      user.id,
      user.name,
      WorkspaceRole.WORKSPACE_EDITOR,
    );
    if (response?.isSuccessful) {
      memberPopObj.isMemberViewerPopup = false;
    }
    memberPromotePopupLoader = false;
  };
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
  <div style="font-size: 14px;" class="isMemberRemovePopuptext-lightGray mb-1">
    <p style="font-size:12px;" class="text-textColor">
      Are you sure you want to remove <span class="text-whiteColor"
        >"{user.name}"</span
      >
      ? They will lose access to the
      <span class="text-whiteColor">"{activeWorkspace.name}"</span> team.
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
      onClick={handleRemoveUserFromWorkspace}
      loaderSize={18}
      type={"danger"}
      loader={memberRemovePopupLoader}
    />
  </div>
</Modal>

<div
  class="member-data-container d-flex align-items-center mb-2 w-100"
  style="height: 46px;"
>
  <div
    class="rounded-5 me-2 border border-defaultColor d-flex justify-content-center align-items-center"
    style="height: 32px; width: 32px;"
  >
    <p class="mb-0">
      {user?.name[0]}
    </p>
  </div>
  <div
    class="d-flex flex-column"
    style="width:calc(100% - 100px); font-size:12px; "
  >
    <div style="color: var(--text-secondary-100);">
      <p class="mb-0 username-text">
        {user?.name}
        {#if isActiveUser}
          (You)
        {/if}
      </p>
    </div>
    <div style="color: var(--text-secondary-200) ;">
      <p class="mb-0">{user?.email}</p>
    </div>
  </div>
  <div class="position">
    <Select
      id={user.id}
      data={getPermissionsData()}
      titleId={user?.role ? user.role : ""}
      menuItem={"v2"}
      headerTheme={"blur"}
      onclick={handleDropdown}
      bodyTheme={"violet"}
      borderType={"none"}
      headerFontSize={"10px"}
      disabled={!(
        (activeUser?.role === WorkspaceRole.WORKSPACE_ADMIN &&
          user.role === WorkspaceRole.WORKSPACE_EDITOR) ||
        (activeUser?.role === WorkspaceRole.WORKSPACE_ADMIN &&
          user.role === WorkspaceRole.WORKSPACE_VIEWER)
      )}
      borderRounded={"4px"}
    />
  </div>
</div>

<style>
  .member-data-container:hover {
    background-color: var(--dropdown-option-hover);
  }

  .member-data-container:hover .username-text {
    color: var(--text-primary-300);
  }
  .member-data-container {
    padding: 10px;
    border-radius: 5px;
  }
</style>
