<script lang="ts">
  export let handleInvitePopup: (flag: boolean) => void;
  // export let workspaceName:string;
  export let teamName: string = "";
  export let teamId: string = "";
  import { fade } from "svelte/transition";
  import closeIcon from "$lib/assets/close-icon-normal.svg";
  import closeIconWhite from "$lib/assets/close-icon-white.svg";
  import SelectRoleDropdown from "../dropdown/SelectRoleDropdown.svelte";
  import CheckSelectDropdown from "../dropdown/CheckSelectDropdown.svelte";
  export let onSubmit;
  export let updateRepo;
  export let workspaces;
  //   import type { addUsersInWorkspacePayload
  //   import { UserRoles } from "$lib/utils/enums/enums";
  const emailstoBeSentArr: string[] = [];
  let showErrors = false;
  // const data = [
  //   {
  //     id: "admin",
  //     role: "ADMIN",
  //     info: "Add & edit resources within a workspace,add & remove members to workspace",
  //   },
  //   {
  //     id: "editor",
  //     role: "EDITOR",
  //     info: "Add & edit resources within a workspace",
  //   },
  //   {
  //     id: "viewer",
  //     role: "VIEWER",
  //     info: "View Resources within a workspace.",
  //   },
  // ];
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
  const handleInvite = async () => {
    // showErrors = true;
    if (
      selectedRole &&
      selectedRole !== "select" &&
      emailstoBeSentArr?.length > 0
    ) {
      let data = {
        users: emailstoBeSentArr,
        role: selectedRole,
      };
      const response = await onSubmit(teamId, data);
      updateRepo(teamId, response);
      console.log(response);
    }
  };

  const handleDropdown = (id) => {
    selectedRole = id;
  };
  const handleCheckSelectDropdown = (data) => {
    teamSpecificWorkspace = data;
    console.log(data);
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
    <!-- <select
      class="w-100 mt-1 p-1"
      style="background-color: black;"
      bind:value={selectedRole}
      on:change={() => {}}
    >
      <option value="" disabled selected>Select </option>
      {#each roles as roleObj}
        <option value={roleObj.id}>
          {roleObj.role}
        </option>
      {/each}
    </select>
    {#if showErrors && !selectedRole}
      <p class="error-text">Role Cannot Be Empty</p>
    {/if} -->
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
  <div class="mt-4">
    <p class="role-title mb-0">Role<span class="asterik">*</span></p>
    <!-- <select
      class="w-100 mt-1 p-1"
      style="background-color: black;"
      bind:value={selectedRole}
      on:change={() => {}}
    >
      <option value="" disabled selected>Select </option>
      {#each roles as roleObj}
        <option value={roleObj.id}>
          {roleObj.role}
        </option>
      {/each}
    </select>
    {#if showErrors && !selectedRole}
      <p class="error-text">Role Cannot Be Empty</p>
    {/if} -->
    <CheckSelectDropdown
      id={"check-select-workspace"}
      list={teamSpecificWorkspace}
      onclick={handleCheckSelectDropdown}
    />
  </div>
  <div class="d-flex align-items-center justify-content-between">
    <div class="description mt-4">
      <p class="text-textColor">
        Team:<span style="color:white">: {teamName}</span>
      </p>
    </div>
    <div>
      <button
        class="invite-btn btn rounded border-0 py-2"
        on:click={handleInvite}>Send Invite</button
      >
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
    height: 50%;
    width: 60%;
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
    background-color: var(--dangerColor);
  }

  .btn-close1:active {
    background-color: var(--dangerColor);
  }
  .invite-btn {
    background-color: var(--send-button);
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
    background-color: black;
    border: 1px solid;
    padding: 3px 5px 3px 5px;
  }

  #input-email {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 5px;
  }

  @media (min-width: 1000px) {
    .container {
      display: flex;
      flex-direction: column;
      position: fixed;
      min-height: 54%;
      height: auto;
      width: 42%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--background-color);
      z-index: 12;
      padding: 2%;
      border-radius: 10px;
    }
  }
</style>
