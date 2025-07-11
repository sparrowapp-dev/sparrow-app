<script lang="ts">
  import type { TeamDocument } from "@app/database/database";
  import InviteRow from "../components/InviteRow.svelte";
  import VirtualScroll from "svelte-virtual-scroll-list";
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

  const tableHeaderContent = ["Users", "", "", "", "Roles", "Actions"];
</script>

<div class="h-100 w-100 overflow-auto">
  {#if invites.length > 0}
    <div class="h-100 d-flex flex-column text-fs-12">
      <div class={`d-flex pb-2 ps-2`}>
        <div style="width:70%">Users</div>
        <div style="width:20%">Roles</div>
        <div class="d-flex justify-content-end pe-5" style="width:10%">
          Actions
        </div>
      </div>
      <div class="w-100 overflow-auto z-0" style="flex:1 !important;">
        <div style="height: 100%;">
          <VirtualScroll data={invites} key="email" let:data>
            <InviteRow
              user={data?.email}
              role={data?.role}
              id={data?.id}
              {onWithDrawInvite}
              {onResendInvite}
              {openTeam}
            />
          </VirtualScroll>
        </div>
      </div>
    </div>
  {:else}
    <div class="not-found-text">No result Found</div>
  {/if}
</div>

<style>
  .not-found-text {
    color: var(--text-secondary-200);
    font-size: 16px;
    font-weight: 400;
    text-align: center;
  }
</style>
