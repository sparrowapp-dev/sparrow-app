<script lang="ts">
  export let handleInvitePopup: (flag: boolean) => void;
  export let teamName: string = "";
  export let teamId: string = "";
  import { fade } from "svelte/transition";
  import closeIcon from "$lib/assets/close.svg";
  import closeIconWhite from "$lib/assets/close-icon-white.svg";
  import SelectRoleDropdown from "../../dropdown/SelectRoleDropdown.svelte";
  import CheckSelectDropdown from "../../dropdown/CheckSelectDropdown.svelte";
  import CoverButton from "../../buttons/CoverButton.svelte";

  export let onSubmit;
  export let updateRepo;
  export let workspaces;

  const emailstoBeSentArr: string[] = [];
  let showErrors = false;
  let teamSpecificWorkspace = workspaces.map((elem) => {
    return {
      id: elem._id,
      name: elem.name,
      checked: false,
    };
  });
  let selectedRole: string = "select";
  let currentEmailEntered: string;
  const handleEmailOnAdd = (email: string) => {
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
      closeIconBtn.src = closeIconWhite;
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
  const handleInvite = async () => {
    // showErrors = true;
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
          updateRepo(teamId, response);
          handleInvitePopup(false);
        } else {
          // spec error true
        }
      } else {
        let data = {
          users: emailstoBeSentArr,
          role: selectedRole,
        };
        const response = await onSubmit(teamId, data);
        updateRepo(teamId, response);
        handleInvitePopup(false);
        // console.log(response);
      }
      loader = false;
    }
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
    <p class="invite-subheader text-textColor mt-0 mb-0">
      use commas to separate emails
    </p>
    <div class="email-container">
      <div id="input-email"></div>
      <input
        id="input"
        placeholder="Enter email ID"
        style="outline:none;border:none;flex-grow:1; background:transparent;"
        bind:value={currentEmailEntered}
        class="input-container mt-2"
        on:keydown={(event) => {
          if (event.key === "," || event.key === "Enter") {
            handleEmailOnAdd(currentEmailEntered);
          }
        }}
      />
    </div>
    {#if showErrors && emailstoBeSentArr.length === 0}
      <p class="error-text">Email ID cannot be Empty</p>
    {/if}
  </div>

  <div class="mt-4">
    <p class="role-title mb-0">Role<span class="asterik">*</span></p>
    {#if showErrors && !selectedRole}
      <p class="error-text">Role Cannot Be Empty</p>
    {/if}
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

  {#if selectedRole === "editor" || selectedRole === "viewer"}
    <div class="mt-4">
      <p class="role-title mb-0">
        Specify Workspace<span class="asterik">*</span>
      </p>
      <p class="invite-subheader text-textColor mt-0 mb-3">
        Select Workspaces you would want to give access to.
      </p>
      <CheckSelectDropdown
        id={"check-select-workspace"}
        list={teamSpecificWorkspace}
        onclick={handleCheckSelectDropdown}
      />
    </div>
  {/if}
  <div class="d-flex align-items-center justify-content-between mt-4">
    <div class="description">
      <p class="text-textColor">
        Team:<span style="color:white">: {teamName}</span>
      </p>
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
    color: var(--error--color);
    font-size: 12px;
  }

  .email-container {
    display: flex;
    flex-wrap: wrap;
    background-color: transparent;
    border: 1px solid;
    padding: 3px 5px 3px 5px;
  }

  #input-email {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 5px;
  }
</style>
