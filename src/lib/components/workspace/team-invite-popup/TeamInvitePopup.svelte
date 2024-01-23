<script lang="ts">
  export let handleInvitePopup: (flag: boolean) => void;
  export let teamName: string = "";
  export let teamId: string = "";
  import { fade } from "svelte/transition";
  import closeIcon from "$lib/assets/close.svg";
  import SelectRoleDropdown from "../../dropdown/SelectRoleDropdown.svelte";
  import CheckSelectDropdown from "../../dropdown/CheckSelectDropdown.svelte";
  import CoverButton from "../../buttons/CoverButton.svelte";
  import { base64ToURL } from "$lib/utils/helpers";
  import { notifications } from "$lib/utils/notifications";

  export let onSubmit;
  export let updateRepo;
  export let workspaces;
  export let teamLogo;

  const emailstoBeSentArr: string[] = [];
  let teamSpecificWorkspace = workspaces.map((elem) => {
    return {
      id: elem._id,
      name: elem.name,
      checked: false,
    };
  });
  let selectedRole: string = "select";
  let currentEmailEntered: string;

  let emailError: boolean = false;
  let roleError: boolean = false;
  let workspaceError: boolean = false;

  const handleEmailOnAdd = (email: string) => {
    email = email.replace(",", "");
    email = email.trim();
    emailstoBeSentArr.push(email);
    const emailDiv = document.createElement("div");
    const emailContentSpan = document.createElement("span");
    const closeIconBtn = document.createElement("img");
    emailDiv.id = email;
    closeIconBtn.classList.add(email);
    closeIconBtn.addEventListener("click", (event: any) => {
      const className = event.target?.className;
      const removeElement = document.getElementById(className);
      document.getElementById("input-email").removeChild(removeElement);
    });
    closeIconBtn.addEventListener("mouseenter", () => {
      closeIconBtn.src = closeIcon;
    });
    closeIconBtn.addEventListener("mouseleave", () => {
      closeIconBtn.src = closeIcon;
    });

    closeIconBtn.src = closeIcon;
    emailContentSpan.innerHTML = email;
    emailDiv.appendChild(emailContentSpan);
    emailDiv.appendChild(closeIconBtn);
    emailDiv.style.backgroundColor = "#1E1E1E";
    emailDiv.style.display = "flex";
    emailDiv.style.justifyContent = "center";
    emailDiv.style.alignItems = "center";
    emailDiv.style.gap = "4px";
    emailDiv.style.paddingLeft = "4px";
    emailDiv.style.paddingRight = "4px";
    emailDiv.style.borderRadius = "4px";
    closeIconBtn.style.backgroundColor = "transparent";
    document.getElementById("input-email").appendChild(emailDiv);
    currentEmailEntered = "";
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
    }
  };

  const handleInvite = async () => {
    checkInviteValidation();
    loader = true;
    if (
      selectedRole &&
      selectedRole !== "select" &&
      emailstoBeSentArr?.length > 0
    ) {
      if (selectedRole === "editor" || selectedRole === "viewer") {
        if (countCheckedList(teamSpecificWorkspace)) {
          let data = {
            users: emailstoBeSentArr,
            role: selectedRole,
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
            updateRepo(teamId, response);
            handleInvitePopup(false);
            notifications.success("Invite sent.");
          } else {
            notifications.error("Failed to sent invite. Please try again.");
          }
        }
      } else {
        let data = {
          users: emailstoBeSentArr,
          role: selectedRole,
        };
        const response = await onSubmit(teamId, data);
        if (response) {
          updateRepo(teamId, response);
          handleInvitePopup(false);
          notifications.success("Invite sent.");
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
  const handleCheckSelectDropdown = (data) => {
    teamSpecificWorkspace = data;
  };
</script>

<div
  class="background-overlay"
  on:click={() => {
    handleInvitePopup(false);
  }}
  transition:fade={{ delay: 0, duration: 100 }}
/>

<div class="container">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <p class="mb-0 header-title">Invite Team Members</p>
    <button
      class="btn-close1 border-0 rounded"
      on:click={() => {
        handleInvitePopup(false);
      }}
    >
      <img src={closeIcon} alt="x" />
    </button>
  </div>
  <div class="d-flex flex-column">
    <p class="invite-header mb-0">
      Invite By Email<span class="asterik">*</span>
    </p>
    <p class="invite-subheader text-textColor mt-0 mb-1">
      use commas to separate emails
    </p>
    <div class="email-container rounded">
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
          if (event.key === "," || event.key === "Enter") {
            handleEmailOnAdd(currentEmailEntered);
          }
        }}
      />
    </div>
    {#if emailError && emailstoBeSentArr.length === 0}
      <p class="error-text">Email ID cannot be Empty.</p>
    {/if}
  </div>

  <div class="mt-4">
    <p class="role-title mb-1">Role<span class="asterik">*</span></p>
    <SelectRoleDropdown
      id={"invite-member-workspace"}
      data={[
        {
          name: "Select",
          id: "select",
          description: "Select role",
          color: "whiteColor",
        },
        {
          name: "Admin",
          id: "admin",
          description:
            "Add & edit resources within a workspace,add & remove members to workspace",
          color: "whiteColor",
        },
        {
          name: "Editor",
          id: "editor",
          description: "Add & edit resources within a workspace",
          color: "whiteColor",
        },
        {
          name: "Viewer",
          id: "viewer",
          description: "View Resources within a workspace.",
          color: "whiteColor",
        },
      ]}
      method={selectedRole ? selectedRole : ""}
      onclick={handleDropdown}
    />
  </div>
  {#if selectedRole === "admin"}
    <p class="invite-subheader text-textColor mt-1 mb-1">
      Admins will get access to all the current workspaces as well as any future
      workspaces in the team.
    </p>
  {/if}
  {#if roleError && selectedRole === "select"}
    <p class="error-text">Role cannot be empty.</p>
  {/if}

  {#if selectedRole === "editor" || selectedRole === "viewer"}
    <div class="mt-4">
      <p class="role-title mb-0">
        Specify Workspace<span class="asterik">*</span>
      </p>
      <p class="invite-subheader text-textColor mt-0 mb-1">
        Select Workspaces you would want to give access to.
      </p>
      <CheckSelectDropdown
        id={"check-select-workspace"}
        list={teamSpecificWorkspace}
        onclick={handleCheckSelectDropdown}
      />
    </div>
    {#if workspaceError && !countCheckedList(teamSpecificWorkspace)}
      <p class="error-text">
        You need to select at least one workspace. If you wish to give access to
        all workspaces, plese click on select all.
      </p>
    {/if}
  {/if}
  <div class="d-flex align-items-center justify-content-between mt-4">
    <div class="description">
      <div class="d-flex align-items-center">
        {#if teamLogo}
          <img class="team-icon me-2" src={base64ToURL(teamLogo)} alt="" />
        {/if}
        <p style="font-size:16px;" class="mb-0">{teamName}</p>
      </div>
    </div>
    <div>
      <CoverButton
        disable={loader}
        text={"Send Invite"}
        size={14}
        type={"primary"}
        {loader}
        onClick={() => {
          handleInvite();
        }}
      />
    </div>
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
</style>
