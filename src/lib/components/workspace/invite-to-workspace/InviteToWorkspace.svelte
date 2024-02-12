<script lang="ts">
  export let handleInvitePopup: (flag: boolean) => void;
  export let teamName: string;
  import { fade } from "svelte/transition";
  import closeIcon from "$lib/assets/close-icon-normal.svg";
  import SelectRoleDropdown from "$lib/components/dropdown/SelectRoleDropdown.svelte";
  import closeIconWhite from "$lib/assets/close-icon-white.svg";
  import type {
    addUsersInWorkspace,
    addUsersInWorkspacePayload,
  } from "$lib/utils/dto";
  import { notifications } from "$lib/utils/notifications";
  import { WorkspaceRole } from "$lib/utils/enums";
  import { createDynamicComponents } from "$lib/utils/helpers/common.helper";
  import { validateEmail } from "$lib/utils/helpers";
  let emailstoBeSentArr: string[] = [];

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
  let currentEmailEntered: string;
  let invalidEmails: string[] = [];

  function removeElement(event: Event): void {
    const email = event.target?.id;
    const removeElement = document.getElementById(email) as HTMLElement;
    const emailContainer = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.removeChild(removeElement);
    emailstoBeSentArr = emailstoBeSentArr.filter((e) => e != email);
    invalidEmails = invalidEmails.filter((e) => e != email);
    console.log(emailstoBeSentArr);
    console.log(invalidEmails);
  }

  const handleEmailOnAdd = (email: string) => {
    email = email.replace(",", "");
    email = email.trim();
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      invalidEmails.push(email);
    } else {
      emailstoBeSentArr.push(email);
    }

    const emailDiv: HTMLElement = createDynamicComponents(
      "div",
      `d-flex bg-emailInviteBackgroundColor gx-1 px-1 justify-content-center rounded-1 align-items-center ${
        !isValidEmail ? "border border-danger" : ""
      }`,
    );
    const emailContentSpan = createDynamicComponents("span", "");
    const closeIconBtn = createDynamicComponents("img", "bg-transparent", [
      { eventType: "click", eventHandler: removeElement },
      {
        eventType: "mouseleave",
        eventHandler: () => {
          closeIconBtn.src = closeIcon;
        },
      },
      {
        eventType: "mouseenter",
        eventHandler: () => {
          closeIconBtn.src = closeIconWhite;
        },
      },
    ]) as HTMLImageElement;
    emailDiv.id = email;
    closeIconBtn.id = email;
    closeIconBtn.src = closeIcon;
    emailContentSpan.innerHTML = email;
    emailDiv.appendChild(emailContentSpan);
    emailDiv.appendChild(closeIconBtn);
    const emailContainer: HTMLElement = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.appendChild(emailDiv);
    currentEmailEntered = "";
  };
  const handleInvite = async () => {
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
      if (response && response.data.data) {
        const newTeam: addUsersInWorkspace[] = response.data.data.users;
        addUsersInWorkspaceInRxDB(currentWorkspaceDetails.id, newTeam);
        notifications.success(
          `Invite Sent to ${emailstoBeSentArr.length} for ${currentWorkspaceDetails.name}`,
        );
      } else {
        notifications.error(`Failed to sent invites, please try again`);
      }
      handleInvitePopup(false);
    }
  };
  const handleDropdown = (role: WorkspaceRole) => {
    selectedRole = role;
  };
</script>

<div class="d-flex flex-column">
  <p class="invite-header mb-0 sparrow-fs-14">
    Invite By Email<span class="asterik">*</span>
  </p>
  <p class="invite-subheader text-textColor mt-0 mb-0 sparrow-fs-12">
    use commas to separate emails
  </p>
  <div
    class="email-container d-flex flex-wrap bg-transparent border border-1 border-secondary"
    style="padding:3px 5px 3px 5px;"
  >
    <div
      id="input-email"
      class="d-flex align-items-start flex-wrap gap-2"
    ></div>
    <input
      id="input"
      placeholder="Enter email IDs"
      style="outline:none;border:none;flex-grow:1; background:transparent;"
      bind:value={currentEmailEntered}
      class="input-container mt-2"
      on:keyup={(event) => {
        if (event.key === "," || event.key === "Enter" || event.key === " ") {
          handleEmailOnAdd(currentEmailEntered);
        }
      }}
    />
  </div>
  {#if showErrors && emailstoBeSentArr.length === 0}
    <p class="error-text sparrow-fs-12">Email ID cannot be Empty</p>
  {/if}
  {#if showErrors && invalidEmails.length}
    <p class="error-text sparrow-fs-12">One or more Email IDs are invalid</p>
  {/if}
</div>
<div class="mt-4">
  <p class="role-title mb-1">Role<span class="asterik">*</span></p>
  <SelectRoleDropdown
    isError={showErrors && selectedRole === defaultRole}
    id={"invite-member-workspace"}
    data={[
      {
        name: "Select",
        id: defaultRole,
        description: "Select role",
        color: "whiteColor",
      },
      {
        name: "Admin",
        id: WorkspaceRole.WORKSPACE_ADMIN,
        description:
          "Add & edit resources within a workspace,add & remove members to workspace",
        color: "whiteColor",
      },
      {
        name: "Editor",
        id: WorkspaceRole.WORKSPACE_EDITOR,
        description: "Add & edit resources within a workspace",
        color: "whiteColor",
      },
      {
        name: "Viewer",
        id: WorkspaceRole.WORKSPACE_VIEWER,
        description: "View Resources within a workspace.",
        color: "whiteColor",
      },
    ]}
    method={selectedRole ? selectedRole : ""}
    onclick={handleDropdown}
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
    <button class="invite-btn btn rounded border-0 py-2" on:click={handleInvite}
      >Send Invite</button
    >
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
