<script lang="ts">
  import type { addUsersInWorkspacePayload } from "$lib/utils/dto";
  import { WorkspaceRole } from "$lib/utils/enums";
  import { Button } from "@library/ui";
  import { InviteUserPicker } from "../components";
  import { Select } from "@library/forms";

  /**
   * Controls the visibility of the invite popup.
   * @param isInviteContainerOpened - Determines whether to show or hide the invite popup.
   */
  export let handleInvitePopup: (isInviteContainerOpened: boolean) => void;

  /**
   * The name of the team to which users are being invited.
   */
  export let teamName: string;

  /**
   * List of users available for invitation.
   */
  export let users;

  /**
   * Function to add users to the local RxDB.
   * @param id - The ID of the workspace.
   * @param data - The array of users to add to the workspace in RxDB.
   */
  export let onInviteUserToWorkspace: (
    currenWorkspaceDetails: any,
    data: any,
    emailstoBeSentArr: string[],
  ) => Promise<any>;

  /**
   * Details of the current workspace.
   */
  export let currentWorkspaceDetails: {
    id: string;
    name: string;
    users: {
      email: string;
    }[];
  };

  /**
   * state variables
   */
  const defaultRole: string = "select";
  let loader: boolean = false;
  let emailstoBeSentArr: string[] = [];
  let showErrors: boolean = false;
  let selectedRole: string = defaultRole;
  let invalidEmails: string[] = [];

  /**
   * Handles the invite action. Sends the invite to the specified emails with the selected role.
   */
  const handleInvite = async () => {
    loader = true;
    showErrors = true;
    const data: addUsersInWorkspacePayload = {
      users: emailstoBeSentArr,
      role: selectedRole,
    };
    if (
      emailstoBeSentArr &&
      emailstoBeSentArr.length > 0 &&
      !invalidEmails.length &&
      selectedRole &&
      selectedRole != defaultRole
    ) {
      const response = await onInviteUserToWorkspace(
        currentWorkspaceDetails,
        data,
        emailstoBeSentArr,
      );
      if (response.isSuccessful) {
        handleInvitePopup(false);
      }
    }
    loader = false;
  };

  /**
   * Handles the role selection from the dropdown.
   * @param role - The selected role.
   */
  const handleDropdown = (role: string) => {
    selectedRole = role as WorkspaceRole;
  };
</script>

<div class="d-flex flex-column">
  <p class="invite-header mb-2 sparrow-fs-14">
    Invite By Email<span class="asterik">*</span>
  </p>
  <InviteUserPicker
    list={users?.filter((element) => {
      if (
        currentWorkspaceDetails.users
          .map((element) => {
            return element.email;
          })
          .includes(element.email)
      ) {
        return false;
      }
      return true;
    })}
    id={"input-select2"}
    onChange={(items) => {
      emailstoBeSentArr = items;
    }}
  />
  {#if showErrors && emailstoBeSentArr.length === 0}
    <p class="error-text sparrow-fs-12">Email ID cannot be Empty.</p>
  {/if}
</div>
<div class="mt-4">
  <p class="role-title mb-1">Role<span class="asterik">*</span></p>

  <Select
    id="invite-workspace-role"
    titleId={selectedRole ? selectedRole : ""}
    data={[
      {
        name: "Select",
        id: defaultRole,
        description: "Select role",
        hide: true,
      },
      {
        name: "Editor",
        id: WorkspaceRole.WORKSPACE_EDITOR,
        description: "Add & edit resources within a workspace",
      },
      {
        name: "Viewer",
        id: WorkspaceRole.WORKSPACE_VIEWER,
        description: "View Resources within a workspace.",
      },
    ]}
    onclick={handleDropdown}
    position={"absolute"}
    menuItem={"v2"}
    bodyTheme={"violet"}
    headerTheme={"violet2"}
    borderRounded={"4px"}
    headerFontWeight={400}
    headerFontSize={"12px"}
    isError={showErrors && selectedRole === defaultRole}
  />
  {#if showErrors && selectedRole === defaultRole}
    <p class="error-text sparrow-fs-12">Role Cannot Be Empty</p>
  {/if}
</div>
<div class="text-textColor mt-2 sparrow-fs-12">
  You can invite your team members or external collaborators to a this
  workspace. Invited people will have access to only the <span
    style="color:white">{currentWorkspaceDetails.name}</span
  > workspace.
</div>
<div class="d-flex align-items-center justify-content-between">
  <div class="description mt-4 sparrow-fs-12 ellipsis">
    <p class="mb-0 text-textColor ellipsis">
      Workspace<span style="color:white">: {currentWorkspaceDetails.name}</span>
    </p>
    <p class="text-textColor ellipsis">
      Team:<span style="color:white">: {teamName}</span>
    </p>
  </div>
  <div>
    <Button
      disable={loader}
      title={"Send Invite"}
      loaderSize={19}
      textStyleProp={"font-size: var(--base-text); min-width:80px;"}
      type={"primary"}
      {loader}
      onClick={() => {
        handleInvite();
      }}
    />
  </div>
</div>

<style>
  .asterik {
    color: var(--dangerColor);
    margin-left: 4px;
  }
  .error-text {
    margin-top: 4px;
    color: var(--error--color);
  }
</style>
