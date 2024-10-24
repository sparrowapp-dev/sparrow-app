<script lang="ts">
  export let handleModalState: (flag: boolean) => void;
  export let teamName: string = "";
  export let teamId: string = "";
  import {
    base64ToURL,
    createDynamicComponents,
    validateEmail,
  } from "@sparrow/common/utils";

  import { TeamRole, WorkspaceRole } from "@sparrow/common/enums/team.enum";
  import { Button, IconFallback } from "@sparrow/library/ui";

  export let onInviteClick;
  export let workspaces;
  export let teamLogo;
  export let userId;
  export let users;
  /**
   * Validates the user email.
   */
  export let onValidateEmail;

  import { closeIconWhiteIcon as closeIconWhite } from "@sparrow/library/assets";
  import { MultiSelect, Select } from "@sparrow/library/forms";
  import { notifications } from "@sparrow/library/ui";

  let emailstoBeSentArr: string[] = [];
  let teamSpecificWorkspace = workspaces.map((elem) => {
    return {
      id: elem._id,
      name: elem.name,
      textColor: "whiteColor",
      checked: false,
    };
  });
  const defaultRole = "select";
  let selectedRole: string = defaultRole;
  let currentEmailEntered: string;

  let emailError: boolean = false;
  let roleError: boolean = false;
  let workspaceError: boolean = false;
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
  }

  /**
   * Checks if user already exist in team
   * @param email - email input
   */
  const isEmailAlreadyExistInTeam = (email: string) => {
    for (let i = 0; i < users.length; i++) {
      if (email.toLowerCase() === users[i].email.toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  const handleEmailOnAdd = async (email: string) => {
    email = email.replace(",", "");
    email = email.trim();

    const isEmailAlreadyExist = isEmailAlreadyExistInTeam(email);
    if (isEmailAlreadyExist) {
      notifications.error("User already in team!");
    }
    const isUserExist = await onValidateEmail(email); // checks if user exist on server
    if (!isUserExist) {
      // notifications.error("User doesn't exist on sparrow!");
    }
    const isValidEmail =
      validateEmail(email) && !isEmailAlreadyExist && isUserExist;

    if (!isValidEmail) {
      invalidEmails.push(email);
    } else {
      emailstoBeSentArr.push(email);
    }

    const emailDiv: HTMLElement = createDynamicComponents(
      "div",
      `d-flex  email-container-item ps-2 me-1 justify-content-center rounded-1 align-items-center ${
        !isValidEmail
          ? "email-container-item-invalid"
          : "email-container-item-valid"
      }`,
    );
    const emailContentSpan = createDynamicComponents("span", `text-fs-12`);
    const closeIconBtn = createDynamicComponents(
      "img",
      `bg-transparent email-container-img ${
        !isValidEmail
          ? "email-container-img-invalid"
          : "email-container-img-valid"
      }`,
      [{ eventType: "click", eventHandler: removeElement }],
    ) as HTMLImageElement;
    emailDiv.id = email;
    closeIconBtn.id = email;
    closeIconBtn.src = closeIconWhite;
    emailContentSpan.innerHTML = email;
    emailDiv.appendChild(emailContentSpan);
    emailDiv.appendChild(closeIconBtn);
    const emailContainer: HTMLElement = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.appendChild(emailDiv);
    currentEmailEntered = "";
    if (emailstoBeSentArr.length && !invalidEmails.length) {
      emailError = false;
    } else {
      emailError = true;
    }
  };

  const countCheckedList = (ls) => {
    let count = 0;
    ls.forEach((element) => {
      if (element.checked) {
        count++;
      }
    });
    return count;
  };
  let loader: boolean = false;

  const checkInviteValidation = () => {
    if (emailstoBeSentArr?.length === 0) {
      emailError = true;
    }
    if (!selectedRole || selectedRole === defaultRole) {
      roleError = true;
    }
    if (!teamSpecificWorkspace || !countCheckedList(teamSpecificWorkspace)) {
      workspaceError = true;
    } else {
      workspaceError = false;
    }
  };

  const handleInvite = async () => {
    checkInviteValidation();
    loader = true;
    if (
      emailstoBeSentArr &&
      emailstoBeSentArr.length > 0 &&
      !invalidEmails.length &&
      selectedRole &&
      selectedRole != defaultRole
    ) {
      if (
        selectedRole === WorkspaceRole.WORKSPACE_EDITOR ||
        selectedRole === WorkspaceRole.WORKSPACE_VIEWER
      ) {
        if (countCheckedList(teamSpecificWorkspace)) {
          let data = {
            users: emailstoBeSentArr,
            role: selectedRole,
            teamId: teamId,
            workspaces: teamSpecificWorkspace
              .filter((elem) => {
                if (elem.checked) {
                  return true;
                }
                return false;
              })
              .map((elem) => {
                return {
                  id: elem.id,
                  name: elem.name,
                };
              }),
          };
          const response = await onInviteClick(teamId, teamName, data, userId);
          if (response.isSuccessful) {
            handleModalState(false);
          }
        }
      } else {
        let data = {
          users: emailstoBeSentArr,
          role: selectedRole,
          teamId: teamId,
        };
        const response = await onInviteClick(teamId, teamName, data, userId);
        if (response.isSuccessful) {
          handleModalState(false);
        }
      }
    }
    loader = false;
  };

  const handleDropdown = (id) => {
    selectedRole = id;
  };
  const handleCheckSelectDropdown = (items: any[]) => {
    teamSpecificWorkspace = items;
  };
</script>

<div class="d-flex flex-column pt-2">
  <p class="invite-header text-secondary-1000 mb-0">
    Invite by Email<span class="asterik">*</span>
  </p>
  <p class="invite-subheader text-secondary-200 mt-0 mb-1">
    Use comma to separate emails.
  </p>
  <div
    class="email-container rounded {(emailError && invalidEmails.length) ||
    (emailError && emailstoBeSentArr.length === 0)
      ? 'isError'
      : ''}"
  >
    <div id="input-email"></div>
    <input
      id="input"
      placeholder="Enter email ID"
      autocomplete="off"
      autocapitalize="none"
      style="outline:none;border:none;flex-grow:1; background:transparent;"
      bind:value={currentEmailEntered}
      class="input-container text-fs-12"
      on:keyup={(event) => {
        if (
          (event.key === "," || event.key === "Enter" || event.key === " ") &&
          currentEmailEntered &&
          currentEmailEntered.trim() != "" &&
          currentEmailEntered.trim() != ","
        ) {
          handleEmailOnAdd(currentEmailEntered);
        }
      }}
      on:blur={() => {
        if (
          currentEmailEntered &&
          currentEmailEntered.trim() != "" &&
          currentEmailEntered.trim() != ","
        ) {
          handleEmailOnAdd(currentEmailEntered);
        }
      }}
    />
  </div>
  {#if emailError && invalidEmails.length}
    <p class="error-text sparrow-fs-12">
      Please check and enter correct email address.
    </p>
  {:else if emailError && emailstoBeSentArr.length === 0}
    <p class="error-text">Email ID cannot be empty.</p>
  {/if}
</div>

<div class="mt-4">
  <p class="role-title text-fs-14 text-secondary-1000 mb-1">
    Role<span class="asterik">*</span>
  </p>
  <Select
    id="invite-team"
    titleId={selectedRole ? selectedRole : ""}
    data={[
      {
        name: "Select",
        id: defaultRole,
        description: "Select role",
        hide: true,
      },
      {
        name: "Admin",
        id: WorkspaceRole.WORKSPACE_ADMIN,
        description:
          "Add & edit resources within a workspace, add & remove members to a workspace.",
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
    isError={roleError && selectedRole === defaultRole}
  />
</div>
{#if selectedRole === TeamRole.TEAM_ADMIN}
  <p class="invite-subheader text-textColor mt-1 mb-1">
    Admins will have access to all current and future team workspaces.
  </p>
{/if}
{#if roleError && selectedRole === defaultRole}
  <p class="error-text">Role cannot be empty.</p>
{/if}

{#if selectedRole === WorkspaceRole.WORKSPACE_EDITOR || selectedRole === WorkspaceRole.WORKSPACE_VIEWER}
  <div class="mt-4">
    <p class="role-title text-fs-12 text-secondary-1000 mb-0">
      Specify Workspace<span class="asterik">*</span>
    </p>
    <p class="invite-subheader text-textColor mt-0 mb-1">
      Select workspaces you would want to give access to.
    </p>
  </div>

  <!-- workspace selector -->

  <MultiSelect
    data={[...teamSpecificWorkspace]}
    id={"team-invite-multiple-workspace-selector"}
    onclick={handleCheckSelectDropdown}
    --body-background-color="var(--bg-tertiary-400)"
    --header-background-color="var(--bg-tertiary-300)"
    --header-item-background-color="var(--bg-tertiary-750)"
  />

  {#if workspaceError && !countCheckedList(teamSpecificWorkspace)}
    <p class="error-text">
      You need to select at least one workspace. If you wish to give access to
      all workspaces, please click on select all.
    </p>
  {/if}
{/if}
<div class="d-flex align-items-center justify-content-between mt-4">
  <div class="d-flex align-items-center description ellipsis gap-2">
    <div class="d-flex align-items-center" style="width: 36px;">
      {#if teamLogo?.size}
        <img
          class="text-center w-25 align-items-center justify-content-center profile-circle bg-dullBackground"
          style="width: 36px !important; height: 36px !important; padding-top: 2px; display: flex; border-radius: 50%;"
          src={base64ToURL(teamLogo)}
          alt=""
        />
      {:else}
        <span class="">
          <IconFallback character={teamName[0]} />
        </span>
      {/if}
    </div>
    <p style="font-size:16px;" class="mb-0 ellipsis">{teamName}</p>
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
  .invite-header {
    font-size: 14px;
  }
  .invite-subheader {
    font-size: 12px;
  }

  .description {
    font-size: 12px;
  }

  .asterik {
    color: var(--dangerColor);
    margin-left: 4px;
  }
  .error-text {
    margin-top: 4px;
    margin-bottom: 0 !important;
    color: var(--error--color);
    font-size: 12px;
  }

  .email-container {
    display: flex;
    flex-wrap: wrap;
    background-color: var(--bg-tertiary-300);
    border: 1px solid;
    padding: 3px 8px 3px 8px;
    border: 1px solid var(--border-color);
    max-height: 100px;
    overflow-y: auto;
  }
  input {
    margin-bottom: 4px !important;
    margin-top: 4px !important;
    caret-color: var(--text-primary-300);
  }
  #input-email {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 5px;
  }
  .team-icon {
    height: 24px;
    width: 24px;
  }
  .isError {
    border: 1px solid var(--error--color) !important;
  }
  :global(.email-container-item) {
    height: 26px;
    border: 1px solid transparent;
    background-color: var(--bg-tertiary-750);
  }
  :global(.email-container-item-invalid) {
    color: var(--text-danger-200);
  }
  :global(.email-container-item-invalid:hover) {
    border: 1px solid var(--text-danger-200);
    background-color: var(--bg-tertiary-600);
  }
  :global(.email-container-item-valid) {
    color: var(--text-secondary-100);
  }
  :global(.email-container-item-valid:hover) {
    background-color: var(--bg-tertiary-600);
  }
  input::placeholder {
    color: var(--text-secondary-200);
  }
  .email-container:hover {
    border: 1px solid var(--bg-primary-300);
  }
  :global(.email-container-img-invalid) {
    filter: brightness(0) saturate(100%) invert(60%) sepia(64%) saturate(544%)
      hue-rotate(308deg) brightness(109%) contrast(99%);
  }
  :global(.email-container-img-valid) {
    filter: brightness(0) saturate(100%) invert(65%) sepia(13%) saturate(217%)
      hue-rotate(166deg) brightness(87%) contrast(85%);
  }
  :global(.email-container-img) {
    height: 22px;
    width: 22px;
    cursor: pointer;
  }
</style>
