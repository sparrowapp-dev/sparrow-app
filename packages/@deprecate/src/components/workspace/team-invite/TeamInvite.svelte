<script lang="ts">
  export let handleInvitePopup: (flag: boolean) => void;
  export let teamName: string = "";
  export let teamId: string = "";
  import closeIcon from "$lib/assets/close.svg";
  import {
    base64ToURL,
    createDynamicComponents,
    validateEmail,
  } from "$lib/utils/helpers";
  import { notifications } from "@sparrow/library/ui";

  import { TeamRole, WorkspaceRole } from "$lib/utils/enums/team.enum";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { Button } from "@sparrow/library/ui";

  export let onSubmit;
  export let updateRepo;
  export let onRefresh;
  export let workspaces;
  export let teamLogo;
  export let userId;

  import closeIconWhite from "$lib/assets/close-icon-white.svg";
  let emailstoBeSentArr: string[] = [];
  let isAllSelectedCheck = false;
  let teamSpecificWorkspace = workspaces.map((elem) => {
    return {
      id: elem._id,
      name: elem.name,
      textColor: "whiteColor",
      checked: false,
    };
  });
  let selectedRole: string = "select";
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
    if (!selectedRole || selectedRole === "select") {
      roleError = true;
    }
    if (!teamSpecificWorkspace || !countCheckedList(teamSpecificWorkspace)) {
      workspaceError = true;
    } else {
      workspaceError = false;
    }
  };

  const refreshMembers = async (_userId, _teamId, _response) => {
    onRefresh(_userId);
    updateRepo(_teamId, _response);
    handleInvitePopup(false);
    if (_response?.nonExistingUsers?.length > 0) {
      _response.nonExistingUsers.forEach((elem) => {
        notifications.error(`${elem} doesn't exist.`);
      });
    }
    if (_response?.alreadyTeamMember?.length > 0) {
      _response.alreadyTeamMember.forEach((elem) => {
        notifications.error(`${elem} already in team.`);
      });
    }
    if (
      !_response?.nonExistingUsers?.length &&
      !_response?.alreadyTeamMember?.length
    ) {
      notifications.success("Invite sent.");
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
      selectedRole != "select"
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
          const response = await onSubmit(teamId, data);
          if (response) {
            await refreshMembers(userId, teamId, response);
          } else {
            notifications.error("Failed to sent invite. Please try again.");
          }
        }
      } else {
        let data = {
          users: emailstoBeSentArr,
          role: selectedRole,
          teamId: teamId,
        };
        const response = await onSubmit(teamId, data);
        if (response) {
          await refreshMembers(userId, teamId, response);
        } else {
          notifications.error("Failed to sent invite. Please try again.");
        }
      }
    }
    loader = false;
  };

  const handleDropdown = (id) => {
    selectedRole = id;
  };
  const handleCheckSelectDropdown = (id: string) => {
    if (id === "select-all") {
      isAllSelectedCheck = !isAllSelectedCheck;
      teamSpecificWorkspace.forEach((elem: any) => {
        elem.checked = isAllSelectedCheck;
      });
      checkInviteValidation();
    } else {
      teamSpecificWorkspace = teamSpecificWorkspace.map((elem) => {
        if (elem?.id === id) {
          elem.checked = !elem.checked;
        }
        return elem;
      });
      isAllSelectedCheck = teamSpecificWorkspace.every((item) => {
        return item.checked;
      });
    }
  };
</script>

<div class="d-flex flex-column">
  <p class="invite-header mb-0">
    Invite By Email<span class="asterik">*</span>
  </p>
  <p class="invite-subheader text-textColor mt-0 mb-1">
    Use commas to separate emails
  </p>
  <div
    class="email-container rounded {emailError && emailstoBeSentArr.length === 0
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
      class="input-container mt-2"
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
    <p class="error-text sparrow-fs-12">One or more Email IDs are invalid</p>
  {:else if emailError && emailstoBeSentArr.length === 0}
    <p class="error-text">Email ID cannot be Empty.</p>
  {/if}
</div>

<div class="mt-4">
  <p class="role-title mb-1">Role<span class="asterik">*</span></p>
  <Dropdown
    dropDownType={{ type: "text", title: selectedRole ? selectedRole : "" }}
    dropdownId="invite-team"
    data={[
      {
        name: "Select",
        id: "select",
        description: "Select role",
        dynamicClasses: "text-whiteColor",
        hide: true,
      },
      {
        name: "Admin",
        id: WorkspaceRole.WORKSPACE_ADMIN,
        description:
          "Add & edit resources within a workspace,add & remove members to workspace",
        dynamicClasses: "text-whiteColor",
      },
      {
        name: "Editor",
        id: WorkspaceRole.WORKSPACE_EDITOR,
        description: "Add & edit resources within a workspace",
        dynamicClasses: "text-whiteColor",
      },
      {
        name: "Viewer",
        id: WorkspaceRole.WORKSPACE_VIEWER,
        description: "View Resources within a workspace.",
        dynamicClasses: "text-whiteColor",
      },
    ]}
    onclick={handleDropdown}
    staticClasses={[
      {
        id: `invite-team-dropdown-${selectedRole}`,
        classToAdd: ["border", "rounded", "py-1"],
      },
      {
        id: "invite-team-options-container",
        classToAdd: ["end-0", "start-0"],
      },
    ]}
  ></Dropdown>
</div>
{#if selectedRole === TeamRole.TEAM_ADMIN}
  <p class="invite-subheader text-textColor mt-1 mb-1">
    Admins will get access to all the current workspaces as well as any future
    workspaces in the team.
  </p>
{/if}
{#if roleError && selectedRole === "select"}
  <p class="error-text">Role cannot be empty.</p>
{/if}

{#if selectedRole === WorkspaceRole.WORKSPACE_EDITOR || selectedRole === WorkspaceRole.WORKSPACE_VIEWER}
  <div class="mt-4">
    <p class="role-title mb-0">
      Specify Workspace<span class="asterik">*</span>
    </p>
    <p class="invite-subheader text-textColor mt-0 mb-1">
      Select workspaces you would want to give access to.
    </p>
    <!-- <CheckSelectDropdown
      isError={workspaceError && !countCheckedList(teamSpecificWorkspace)}
      id={"check-select-workspace"}
      list={teamSpecificWorkspace}
      onclick={handleCheckSelectDropdown}
    /> -->
    <Dropdown
      dropDownType={{ type: "checkbox", title: "select" }}
      dropdownId="check-select-workspace"
      data={[
        {
          name: "Select",
          id: "select",
          dynamicClasses: "text-whiteColor",
          hide: true,
        },
        {
          name: "Select All",
          id: "select-all",
          dynamicClasses: "text-whiteColor",
          isInvalidOption: true,
          checked: isAllSelectedCheck,
        },
        ...teamSpecificWorkspace,
      ]}
      onclick={handleCheckSelectDropdown}
      staticClasses={[
        {
          id: `check-select-workspace-dropdown-select`,
          classToAdd: ["border", "rounded", "py-1"],
        },
        {
          id: "check-select-workspace-options-container",
          classToAdd: ["end-0", "start-0"],
        },
        {
          id: "check-select-workspace-btn-div",
          classToAdd: ["flex-wrap", "overflow-auto"],
        },
      ]}
      staticCustomStyles={[
        {
          id: "check-select-workspace-options-container",
          styleKey: "overflow",
          styleValue: "auto",
        },
        {
          id: "check-select-workspace-options-container",
          styleKey: "max-height",
          styleValue: "calc(30vh)",
        },
      ]}
    ></Dropdown>
  </div>
  {#if workspaceError && !countCheckedList(teamSpecificWorkspace)}
    <p class="error-text">
      You need to select at least one workspace. If you wish to give access to
      all workspaces, please click on select all.
    </p>
  {/if}
{/if}
<div class="d-flex align-items-center justify-content-between mt-4">
  <div class="description ellipsis">
    <div class="d-flex align-items-center ellipsis">
      {#if teamLogo}
        <img class="team-icon me-2" src={base64ToURL(teamLogo)} alt="" />
      {/if}
      <p style="font-size:16px;" class="mb-0 ellipsis">{teamName}</p>
    </div>
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
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    backdrop-filter: blur(3px);
    z-index: 9;
  }
  .container {
    display: flex;
    flex-direction: column;
    position: fixed;
    max-width: 540px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 10;
    padding: 2%;
    border-radius: 10px;
  }
  .header-title {
    font-size: 20px;
  }
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

  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover {
    background-color: var(--background-dropdown);
  }

  .btn-close1:active {
    background-color: var(--background-dropdown);
  }
  .invite-btn {
    background-color: var(--sparrow-blue);
  }
  .invite-btn:hover {
    background: var(--send1-hoverbutton);
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
    background-color: transparent;
    border: 1px solid;
    padding: 3px 8px 3px 8px;
    border: 1px solid var(--border-color);
    max-height: 100px;
    overflow-y: auto;
  }
  input {
    margin-bottom: 4px !important;
    margin-top: 4px !important;
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
</style>
