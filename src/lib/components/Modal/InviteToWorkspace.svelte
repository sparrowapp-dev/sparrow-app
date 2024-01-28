<script lang="ts">
    export let handleInvitePopup: (flag: boolean) => void;
    export let teamName:string;
    import { fade } from "svelte/transition";
    import closeIcon from "$lib/assets/close-icon-normal.svg";
    import closeIconWhite from "$lib/assets/close-icon-white.svg";
    import type { addUsersInWorkspacePayload,addUsersInWorkspace } from "$lib/utils/dto";
    import { notifications } from "$lib/utils/notifications";
    import { UserRoles } from "$lib/utils/enums/enums";
    const emailstoBeSentArr: string[] = [];

    export let addUsersInWorkspace:(id:string,data:addUsersInWorkspacePayload)=>Promise<any>;
    export let addUsersInWorkspaceInRxDB:(id:string,data:addUsersInWorkspace[])=>Promise<void>
    export let currentWorkspaceDetails;
    let showErrors=false;
    const  roles = [
          { id: 1, role:UserRoles.ADMIN ,info:"Add & edit resources within a workspace,add & remove members to workspace" },
          { id: 2, role: UserRoles.EDITOR,info:"Add & edit resources within a workspace" },
          { id: 3, role: UserRoles.VIEWER,info:"View Resources within a workspace." }
      ];
    let selectedRole="";
    let currentEmailEntered: string;
    const handleEmailOnAdd = (email: string) => {
      email=email.trim();
      emailstoBeSentArr.push(email);
      const emailDiv = document.createElement("div");
      const emailContentSpan = document.createElement("span");
      const closeIconBtn = document.createElement("img");
      emailDiv.id=email;
      closeIconBtn.classList.add(email);
      closeIconBtn.addEventListener("click",(event:any)=>{
      const className=event.target?.className;
      const removeElement=document.getElementById(className);
      document.getElementById("input-email").removeChild(removeElement);
      })
      closeIconBtn.addEventListener("mouseenter",()=>{
        closeIconBtn.src=closeIconWhite;
      })
      closeIconBtn.addEventListener("mouseleave",()=>{
        closeIconBtn.src=closeIcon;
      })
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
    const handleInvite=async()=>{
      showErrors=true;
      const data:addUsersInWorkspacePayload={
        users:emailstoBeSentArr,
        role:selectedRole.role
      }
      if(emailstoBeSentArr && emailstoBeSentArr.length>0 && selectedRole){
      const response = await addUsersInWorkspace(currentWorkspaceDetails.id,data);
      if(response && response.data.data){
        const newTeam:addUsersInWorkspace[]=response.data.data.users;
        addUsersInWorkspaceInRxDB(currentWorkspaceDetails.id,newTeam);
        notifications.success(`Invite Sent to ${emailstoBeSentArr.length} for ${currentWorkspaceDetails.name}`);
         
      }else{
        notifications.error(`Failed To sent invites,please try again`);
      }
       handleInvitePopup(false);
    }
    }
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
            if (event.key === ","|| event.key==="Enter") {
              handleEmailOnAdd(currentEmailEntered);
            }
          }}
        />
      </div>
      {#if showErrors && emailstoBeSentArr.length===0}
        <p class="error-text">Email ID cannot be Empty</p>
        {/if}
    </div>
  
    <div class="mt-4">
      <p class="role-title mb-0">Role<span class="asterik">*</span></p>
      <select   class="w-100 mt-1 p-1" style="background-color: black;" bind:value={selectedRole} on:change={() => {
      }}>
        <option  value="" disabled selected>Select
        </option>
        {#each roles as roleObj}
          <option value={roleObj}>
              {roleObj.role}
          </option>
        {/each}
      </select>
      {#if showErrors && !selectedRole}
      <p class="error-text">Role Cannot Be Empty</p>
      {/if}
    </div>
    <div class="text-textColor mt-2" style="font-size: 12px;">
      You can invite your team members or external collaborators to a this
      workspace. Invited people will have access to only the <span style="color:white">{currentWorkspaceDetails.name}</span> workspace.
    </div>
    <div class="d-flex align-items-center justify-content-between">
      <div class="description mt-4">
        <p class="mb-0 text-textColor">
          Workspace<span style="color:white">: {currentWorkspaceDetails.name}</span>
        </p>
        <p class="text-textColor">
          Team:<span style="color:white">: {teamName}</span>
        </p>
      </div>
      <div>
        <button class="invite-btn btn rounded border-0 py-2" on:click={handleInvite}>Send Invite</button>
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
      z-index: 12;
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
      z-index: 12;
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
      background-color: var(--primary-btn-color);
    }
    .invite-btn:hover {
      background: var(--send1-hoverbutton);
      color:var(--white-color);
    }
    .error-text{
      margin-top: 4px;
      color:var( --error--color);
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