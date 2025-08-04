<script>
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { AddRegular } from "@sparrow/library/icons";
  import VirtualScroll from "svelte-virtual-scroll-list";
  import { policyConfig } from "@sparrow/common/store";
  import { TeamRow } from "../components";
  export let isCreateTeamModalOpen;
  export let isGuestUser;
  export let setOpenTeam;
  export let teamList = [];
  export let disableNewInviteTag;
  export let modifyTeam;
  export let threeDotIconDisable = false;
</script>

<!--Teams list-->
<section class="d-flex flex-column" style="height:33%;">
  <div
    class="sidebar-teams-header d-flex justify-content-between p-3 px-2 pb-0 mb-1"
  >
    <h6
      class="teams-heading px-1 text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-regular"
      style=" color:var(--bg-ds-neutral-300); display:flex;align-items:center; margin-bottom:0;"
    >
      Hubs
    </h6>
    {#if $policyConfig.hubCreationAllowed}
      <div>
        <Tooltip title="New Hub" placement={"bottom-center"} distance={10}>
          <Button
            type="primary"
            size="small"
            customWidth={"28px"}
            startIcon={AddRegular}
            disable={isGuestUser}
            onClick={() => {
              isCreateTeamModalOpen = true;
            }}
          />
        </Tooltip>
      </div>
    {/if}
  </div>
  <div class="sidebar-teams-list" style="flex:1; overflow:auto;">
    <div class="ps-2" style="height: 100%;">
      <VirtualScroll data={teamList.reverse()} key="teamId" let:data>
        <TeamRow
          team={data}
          {isGuestUser}
          {setOpenTeam}
          {disableNewInviteTag}
          {modifyTeam}
          {threeDotIconDisable}
        />
      </VirtualScroll>
    </div>
  </div>
  <hr
    class=" pb-0"
    style="margin-left: 10px; margin-top:12px; margin-bottom:12px;"
  />
</section>

<style>
  .sidebar-teams-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sidebar-teams-list::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }

  .teams-heading {
    outline: none;
  }
  /* .virtual-scroll-wrapper {
    padding: 0 0 0 4px;
  } */
</style>
