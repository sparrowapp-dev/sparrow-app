<script lang="ts">
  import { user } from "$lib/store/auth.store";
  import Tile from "$lib/components/workspace/members/Tile.svelte";
  export let activeTeam;

  let userId: string = "";
  let userType: string = "";
  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      userId = value._id;
      activeTeam?.users.forEach((user) => {
        if (user.id === userId) {
          userType = user.role;
        }
      });
    }
  });
</script>

<section>
  {#if activeTeam?.users}
    {#each activeTeam?.users as user}
      <Tile {user} {userId} {userType} />
    {/each}
  {/if}
</section>
