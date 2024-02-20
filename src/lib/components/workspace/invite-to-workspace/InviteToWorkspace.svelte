<script lang="ts">
  export let handleInvitePopup: (flag: boolean) => void;
  export let teamName: string;
  import { fade } from "svelte/transition";
  import closeIcon from "$lib/assets/close-icon-normal.svg";
  import closeIconWhite from "$lib/assets/close-icon-white.svg";
  import type {
    addUsersInWorkspace,
    addUsersInWorkspacePayload,
  } from "$lib/utils/dto";
  import { notifications } from "$lib/utils/notifications";
  import { WorkspaceRole } from "$lib/utils/enums";
  import { createDynamicComponents } from "$lib/utils/helpers/common.helper";
  import { validateEmail } from "$lib/utils/helpers";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import InputSelect from "$lib/components/inputs/InputSelect.svelte";
  import Button from "$lib/components/buttons/Button.svelte";
  let loader = false;
  let emailstoBeSentArr: string[] = [];
  export let users;
  export let addUsersInWorkspace: (
    id: string,
    data: addUsersInWorkspacePayload,
  ) => Promise<any>;
  export let addUsersInWorkspaceInRxDB: (
    id: string,
    data: addUsersInWorkspace[],
  ) => Promise<void>;
  export let currentWorkspaceDetails: { id: string; name: string };
  let showErrors = false;
  let defaultRole = "select";
  let selectedRole = defaultRole;
  let invalidEmails: string[] = [];

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
      selectedRole != "select"
    ) {
      const response = await addUsersInWorkspace(
        currentWorkspaceDetails.id,
        data,
      );
      if (response?.data?.data) {
        const newTeam: addUsersInWorkspace[] = response.data.data.users;
        addUsersInWorkspaceInRxDB(currentWorkspaceDetails.id, newTeam);
        notifications.success(
          `Invite Sent to ${emailstoBeSentArr.length} for ${currentWorkspaceDetails.name}`,
        );
        loader = false;
        handleInvitePopup(false);
      } else {
        loader = false;
        notifications.error(`Failed to sent invites, please try again`);
      }
    }
    loader = false;
  };
  const handleDropdown = (role: string) => {
    selectedRole = role as WorkspaceRole;
  };
</script>

<div class="d-flex flex-column">
  <p class="invite-header mb-2 sparrow-fs-14">
    Invite By Email<span class="asterik">*</span>
  </p>
  <InputSelect
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
    {showErrors}
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
  <Dropdown
    dropDownType={{ type: "text", title: selectedRole ? selectedRole : "" }}
    dropdownId="workspaceInvite"
    data={[
      {
        name: "Select",
        id: defaultRole,
        description: "Select role",
        dynamicClasses: "whiteColor",
        hide: true,
      },
      {
        name: "Admin",
        id: WorkspaceRole.WORKSPACE_ADMIN,
        description:
          "Add & edit resources within a workspace,add & remove members to workspace",
        dynamicClasses: "whiteColor",
      },
      {
        name: "Editor",
        id: WorkspaceRole.WORKSPACE_EDITOR,
        description: "Add & edit resources within a workspace",
        dynamicClasses: "whiteColor",
      },
      {
        name: "Viewer",
        id: WorkspaceRole.WORKSPACE_VIEWER,
        description: "View Resources within a workspace.",
        dynamicClasses: "whiteColor",
      },
    ]}
    onclick={handleDropdown}
    staticClasses={[
      {
        id: `workspaceInvite-dropdown-${selectedRole}`,
        classToAdd: ["border", "rounded", "py-1"],
      },
      {
        id: "workspaceInvite-options-container",
        classToAdd: ["end-0", "start-0"],
      },
    ]}
  />
  {#if showErrors && selectedRole === "select"}
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
  <div class="description mt-4 sparrow-fs-12">
    <p class="mb-0 text-textColor">
      Workspace<span style="color:white">: {currentWorkspaceDetails.name}</span>
    </p>
    <p class="text-textColor">
      Team:<span style="color:white">: {teamName}</span>
    </p>
  </div>
  <div>
    <Button
      disable={loader}
      title={"Send Invite"}
      loaderSize={19}
      textStyleProp={"font-size: var(--base-text)"}
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
  .invite-btn {
    background-color: var(--primary-btn-color);
  }
  .invite-btn:hover {
    background: var(--send1-hoverbutton);
    color: var(--white-color);
  }
  .error-text {
    margin-top: 4px;
    color: var(--error--color);
  }
</style>
