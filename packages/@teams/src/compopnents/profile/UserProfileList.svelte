<script lang="ts">
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
      <UserProfileSM
        classProp={classProp + user.class}
        stypeProp={stypeProp + user.style}
        {width}
        {height}
        {borderRadius}
        username={user.name[0].toUpperCase()}
        {userProfileUrl}
      />
    {/if}
  {/each}
  {#if generateUsersList(users).length < users.length}
    <UserProfileSM
      classProp={classProp + `position-absolute bg-backgroundColor`}
      stypeProp={stypeProp +
        `margin-left: -${4 * maxProfiles}px; z-index: ${maxProfiles};`}
      {width}
      {height}
      {borderRadius}
      username={`+${users.length - generateUsersList(users).length}`}
      {userProfileUrl}
    />
  {/if}
{/if}
