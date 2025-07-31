<script lang="ts">
  import { Input, Search } from "@sparrow/library/forms";
  import { Shimmer } from "../../images";
  import { user } from "@app/store/auth.store";
  import { Member } from "./sub-workspace-settings";

  /**
   * List of users in the current workspace.
   */
  export let users = [];

  export let currentWorkspace;

  export let onChangeUserRoleAtWorkspace;
  export let onRemoveUserFromWorkspace;
  $: console.log(currentWorkspace);
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

  let searchedUsers = [];
  $: {
    searchedUsers = filteredUser.filter((user) => {
      return (
        user.email.includes(search) ||
        user.name.includes(search) ||
        user.role.includes(search)
      );
    });
  }
</script>

<div class="workspace-setting h-100" style="padding-top:0;">
  <div class="d-flex flex-column" style="">
    <div class="pb-3" style="">
      <Search
        variant="secondary"
        size="small"
        bind:value={search}
        on:input={() => {}}
        customWidth={"300px"}
        placeholder={`Search people in ${currentWorkspace?.name}`}
      />
    </div>
    <Member user={activeUser} isActiveUser={true} />
    <hr />
    {#if !searchedUsers.length && search}
      <div class="skeleton-parent">
        <p class="skeleton-text" style="margin-top: 10px;">No result found.</p>
      </div>
    {:else if searchedUsers.length}
      {#each filteredUser as user}
        {#if user.email.includes(search) || user.name.includes(search) || user.role.includes(search)}
          <Member
            {user}
            {activeUser}
            isActiveUser={false}
            {currentWorkspace}
            {onChangeUserRoleAtWorkspace}
            {onRemoveUserFromWorkspace}
          />
        {/if}
      {/each}
    {:else if !filteredUser?.length}
      <div class="skeleton-parent">
        <p class="skeleton-text">
          Once you invite people to this workspace, you will see them listed
          here. Add people and manage their access by clicking to invite.
        </p>
        <img
          src={Shimmer}
          alt="shimmer effect"
          width="100%"
          height="100%"
          style="margin-top:8px;"
        />
      </div>
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
