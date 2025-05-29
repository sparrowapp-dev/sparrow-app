<script lang="ts">
  import { Table } from "@sparrow/teams/components";
  import { Rows } from "@sparrow/teams/components";
  import type { TeamDocument } from "@app/database/database";
  import InviteRow from "../components/InviteRow.svelte";
  export let invites: [
    {
      name: string;
      email: string;
      expiresAt: string;
      role: string;
    },
  ][] = [];
  export let openTeam: TeamDocument;
  export let onWithDrawInvite;
  export let onResendInvite;
  export let userId: string;

  const tableHeaderContent = ["Users", "", "", "", "Roles", "Actions"];
</script>

<div class="h-100 d-flex flex-column">
  <div
    class="table-container sparrow-thin-scrollbar overflow-y-auto"
    style="flex:1; overflow:auto;"
  >
    {#if invites.length > 0}
      <Table
        tableClassProps="table p-0 table-responsive w-100"
        tableStyleProp="max-height: 100%;width:100%"
        dataSearch="true"
        tableHeaderClassProp="position-sticky top-0 z-2"
        tableHeaderStyleProp="background-color: var(--bg-ds-surface-900);"
        headerObject={tableHeaderContent}
      >
        <tbody class="overflow-y-auto position-relative z-0">
          {#each invites as list, index}
            <InviteRow
              user={list?.email}
              role={list?.role}
              {index}
              {onWithDrawInvite}
              {onResendInvite}
              {openTeam}
              {userId}
            />
          {/each}
        </tbody>
      </Table>
    {:else}
      <div class="not-found-text">No result Found</div>
    {/if}
  </div>
</div>

<style>
  .not-found-text {
    color: var(--text-secondary-200);
    font-size: 16px;
    font-weight: 400;
    text-align: center;
  }
</style>
