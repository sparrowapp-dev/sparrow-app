<script lang="ts">
  import { Avatar } from "@sparrow/library/ui";
import UserProfileSM from "./UserProfileSM.svelte";
  import { onMount } from "svelte";

  export let users: any[];
  export let width: number;
  export let height: number;
  export let classProp = "";
  export let stypeProp = "";
  export let borderRadius: number;
  export let userProfileUrl: string | undefined = undefined;
  export let maxProfiles = 3;

  let generatedUsersList: any[];

  const generateUsersList = (users: any[]) => {
    return users.slice(0, maxProfiles).map((value, index) => ({
      class: `position-absolute bg-backgroundColor`,
      style: `margin-left: -${4 * index}px; z-index: ${index};`,
      name: value?.name && value.name,
    }));
  };

  onMount(() => {
    if (users) generatedUsersList = generateUsersList(users);
  });
</script>

{#if users.length > 0}
  {#each generateUsersList(users) as user}
    {#if user && typeof user.name === "string" && user.name !== ""}
      <Avatar
        type="letter"
        size="small"
        letter={user.name[0]}
        bgColor="var(--text-secondary-600)"
    />
    {/if}
  {/each}
  {#if generateUsersList(users).length < users.length}
    <Avatar
      type="letter"
      size="small"
      letter={`+${users.length - generateUsersList(users).length}`}
      bgColor="var(--text-secondary-600)"/>
  {/if}
{/if}
