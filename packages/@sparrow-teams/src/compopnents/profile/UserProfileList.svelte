<script lang="ts">
  import { Avatar } from "@sparrow/library/ui";
  import { onMount } from "svelte";
  
  export let users: any[] = [];
  export let maxProfiles = 2;
  
  let generatedUsersList: any[] = [];
  
  const generateUsersList = (users: any[]) => {
    const displayCount = Math.min(users.length, maxProfiles);
    
    return users.slice(0, displayCount).map((value, index) => ({
      class: "avatar",
      style: `left: ${index * 18}px; z-index: ${100 - index};`, 
      name: value?.name || "",
    }));
  };
  
  onMount(() => {
    if (users) generatedUsersList = generateUsersList(users);
  });

  $: visibleAvatarCount = Math.min(users.length, maxProfiles);
  $: hasExtraUsers = users.length > maxProfiles;
  $: extraAvatarPosition = visibleAvatarCount * 18;
</script>

{#if users.length > 0}
  <div class="avatar-container">
    {#each generateUsersList(users) as user, index}
      {#if user && typeof user.name === "string" && user.name !== ""}
        <div class="avatar-wrapper" style={user.style}>
          <Avatar
            type="letter"
            size="small"
            letter={user.name[0].toUpperCase()}
            bgColor={index==1 ? "var(--bg-ds-warning-600)": ""}
          />
        </div>
      {/if}
    {/each}
    
    {#if hasExtraUsers}
      <div class="avatar-wrapper extra-avatar" style={`left: ${extraAvatarPosition}px; z-index: 1;`}>
        <Avatar
          type="letter"
          size="small"
          letter={`+${users.length - maxProfiles}`}
          bgColor="var(--bg-ds-neutral-700)"
        />
      </div>
    {/if}
  </div>
{/if}

<style>
  .avatar-container {
    display: flex;
    align-items: center;
    position: relative;
  }
  
  .avatar-wrapper {
    position: absolute;
  }
</style>