<script lang="ts">
  import { Input } from "@sparrow/library/forms";
  import { Header, Member } from "../components";

  /**
   * Current user
   */
  export let user;
  /**
   * List of users in the current workspace.
   */
  export let users = [];

  /**
   * Name of the current workspace.
   */
  export let workspaceName: string = "";

  /**
   * Function to change role of user in workspace.
   */
  export let onChangeUserRoleAtWorkspace;

  /**
   * Function to remove user from workspace.
   */
  export let onRemoveUserFromWorkspace;

  /**
   * Workspace modal is active or not.
   */
  export let isWorkspaceInviteModalOpen: boolean;

  /**
   * Function to delete workspace.
   */
  export let onDeleteWorkspace;

  /**
   * Role of current user in workspace.
   */
  export let userRole;

  /**
   * Current workspace which is active.
   */
  export let activeWorkspace;
  let search: string = "";
  let activeUser;
  let filteredUser;

  /**
   * Filters out the active user from a list of users.
   */
  $: {
    if (users || user) {
      filteredUser = users.filter((_user) => {
        if ($user?._id === _user.id) {
          activeUser = _user;
          return false;
        }
        return true;
      });
    }
  }
</script>

<Header
  bind:isWorkspaceInviteModalOpen
  {workspaceName}
  {onDeleteWorkspace}
  {userRole}
  {activeWorkspace}
/>
<div class="workspace-setting h-100" style="padding-top:0;">
  <div class="d-flex flex-column" style="">
    <div class="pb-3">
      <Input
        class="search-area text-fs-12 rounded p-2"
        type="search"
        bind:value={search}
        on:input={() => {}}
        width={"300px"}
        style="outline:none; width:358px; font-size:12px !important; height:32px; background-color: var(--bg-tertiary-750); border-radius:4px;"
        placeholder={`Search People in ${workspaceName}`}
        defaultBorderColor="transparent"
        hoveredBorderColor={"var(--border-primary-300)"}
        focusedBorderColor={"var(--border-primary-300)"}
      />
    </div>
    <Member user={activeUser} isActiveUser={true} />
    <hr />
    {#if !filteredUser?.length}
      <div class="skeleton-parent">
        <p class="skeleton-text" style="margin-top: 10px;">
          Once you invite people to this workspace, you will see them listed
          here. Add people and manage their access by clicking to invite.
        </p>
      </div>
    {:else}
      {#each filteredUser as user}
        {#if user.email.includes(search) || user.name.includes(search) || user.role.includes(search)}
          <Member
            {user}
            {activeUser}
            isActiveUser={false}
            {activeWorkspace}
            {onChangeUserRoleAtWorkspace}
            {onRemoveUserFromWorkspace}
          />
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .skeleton-parent {
    position: relative;
  }
  .skeleton-text {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    color: var(--Text-text-secondary, #808080);
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
  }
</style>
