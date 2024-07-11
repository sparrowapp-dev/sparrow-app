<script lang="ts">
  import { Input } from "@library/forms";
  import { Shimmer } from "../../images";
  import { user } from "$lib/store";
  import { Member } from "./sub-workspace-settings";

  /**
   * List of users in the current workspace.
   */
  export let users = [];

  /**
   * Name of the current workspace.
   */
  export let workspaceName: string = "";

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

<div class="workspace-setting h-100" style="padding:24px; padding-top:0;">
  <div class="d-flex flex-column" style="">
    <div class="pb-3">
      <Input
        class="search-area text-fs-12 rounded p-2"
        type="search"
        bind:value={search}
        on:input={() => {}}
        width={"300px"}
        style="outline:none; width:358px; font-size:12px !important; height:32px; border:none; background-color: var(--bg-tertiary-250); border-radius:4px;"
        placeholder={`Search People in ${workspaceName}`}
        defaultBorderColor="transparent"
        hoveredBorderColor={"var(--border-primary-300)"}
        focusedBorderColor={"var(--border-primary-300)"}
      />
    </div>
    <Member user={activeUser} isActiveUser={true} />
    <hr />
    {#if !filteredUser?.length}
      <img
        src={Shimmer}
        alt="shimmer effect"
        width="100%"
        height="100%"
        style="margin-left: -5px; margin-top:8px;"
      />
    {:else}
      {#each filteredUser as user}
        {#if user.email.includes(search) || user.name.includes(search) || user.role.includes(search)}
          <Member {user} isActiveUser={false} />
        {/if}
      {/each}
    {/if}
  </div>
</div>
