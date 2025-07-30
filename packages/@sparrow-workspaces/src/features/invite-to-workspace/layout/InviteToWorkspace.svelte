<script lang="ts">
  import type { addUsersInWorkspacePayload } from "@sparrow/common/dto";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Button } from "@sparrow/library/ui";
  import { InviteUserPicker } from "../components";
  import { Select } from "@sparrow/library/forms";

  /**
   * Controls the visibility of the invite popup.
   * @param isInviteContainerOpened - Determines whether to show or hide the invite popup.
   */
  export let handleInvitePopup: (isInviteContainerOpened: boolean) => void;
  export let plan;

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
    workspaceId: string,
    workspaceName: string,
    data: any,
    invitedUserCount: number,
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
  let selectedRole: string = defaultRole;
  let invalidEmails: string[] = [];
  let errors = {
    emailsEmpty: false,
    roleInvalid: false,
    userConflict: "",
  };

  const clearErrors = () => {
    errors = {
      emailsEmpty: false,
      roleInvalid: false,
      userConflict: "",
    };
  };

  /**
   * Handles the invite action. Sends the invite to the specified emails with the selected role.
   */
  const handleInvite = async () => {
    loader = true;
    clearErrors();
    if (emailstoBeSentArr.length === 0) {
      errors.emailsEmpty = true;
      loader = false;
      return;
    }
    const isValid = filterWorkspaceInviteEmails(emailstoBeSentArr);
    if (!isValid) {
      loader = false;
      return;
    }
    if (selectedRole === defaultRole) {
      errors.roleInvalid = true;
      loader = false;
      return;
    }
    const data: addUsersInWorkspacePayload = {
      users: emailstoBeSentArr,
      role: selectedRole,
    };
    const response = await onInviteUserToWorkspace(
      currentWorkspaceDetails.id,
      currentWorkspaceDetails.name,
      data,
      emailstoBeSentArr.length,
    );
    if (response.isSuccessful) {
      handleInvitePopup(false);
    }
    loader = false;
  };

  const filterWorkspaceInviteEmails = (sentEmails: string[]) => {
    const hubUserEmails = users.map((u: any) => u.email);
    const workspaceUserEmails = currentWorkspaceDetails.users.map(
      (u: any) => u.email,
    );
    for (const email of sentEmails) {
      if (!isValidEmail(email)) {
        errors.userConflict = "Please check and enter a correct email address.";
        return false;
      }
      const isHubMember = hubUserEmails.includes(email);
      const isInWorkspace = workspaceUserEmails.includes(email);
      if (isHubMember && isInWorkspace) {
        errors.userConflict = "User already exists in workspace.";
        return false;
      }
    }
    return true;
  };

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Handles the role selection from the dropdown.
   * @param role - The selected role.
   */
  const handleDropdown = (role: string) => {
    selectedRole = role as WorkspaceRole;
    if (role !== defaultRole) errors.roleInvalid = false;
  };
</script>

<div class="d-flex flex-column pt-3">
  <p class="invite-header text-secondary-1000 mb-0 sparrow-fs-14">
    Invite by Email<span class="asterik">*</span>
  </p>
  <p class="text-fs-12 mb-2 text-secondary-200">
    Use comma to separate emails.
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
    currentWorkspaceUsers={currentWorkspaceDetails.users}
    onChange={(items) => {
      emailstoBeSentArr = items;
      clearErrors();
      filterWorkspaceInviteEmails(emailstoBeSentArr);
    }}
    isError={errors.emailsEmpty || !!errors.userConflict}
  />
  {#if errors.emailsEmpty}
    <p class="error-text mb-0 sparrow-fs-12">Email ID cannot be empty.</p>
  {:else if errors.userConflict}
    <p class="error-text mb-0 sparrow-fs-12">{errors.userConflict}</p>
  {/if}
</div>
<div class="mt-4">
  <p class="role-title text-secondary-1000 text-fs-14 mb-1">
    Role<span class="asterik">*</span>
  </p>

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
    variant={"tertiary"}
    borderRounded={"4px"}
    headerFontWeight={400}
    headerFontSize={"12px"}
    isError={errors.roleInvalid}
    minHeaderWidth={"100%"}
    size={"medium"}
  />
  {#if errors.roleInvalid}
    <p class="error-text sparrow-fs-12">Role cannot be empty.</p>
  {/if}
</div>
<div class="text-secondary-200 mt-2 sparrow-fs-12">
  You can invite hub members or external collaborators to this workspace.
  Invited people will have access to only the <span style="color:white"
    >{currentWorkspaceDetails.name}</span
  > workspace.
</div>
{#if plan?.name !== "Community"}
  <p class="text-fs-12 mt-3" style="color: var(--text-ds-neutral-400)">
    Note: Inviting a user reserves a license and may trigger a charge, unless an
    unused license is available.
  </p>
{/if}
<div class="d-flex align-items-center justify-content-between pt-3">
  <div class="description sparrow-fs-12 ellipsis">
    <p class="mb-0 text-secondary-200 ellipsis">
      Workspace: <span style="color:white">
        {currentWorkspaceDetails.name}</span
      >
    </p>
    <p class="text-secondary-200 mb-0 ellipsis">
      Hub: <span style="color:white"> {teamName}</span>
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
    color: var(--text-danger-200);
    margin-left: 4px;
  }
  .error-text {
    margin-top: 4px;
    color: var(--text-danger-200);
  }
</style>
