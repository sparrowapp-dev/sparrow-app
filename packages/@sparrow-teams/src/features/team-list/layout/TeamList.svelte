<script>
  import { Button, List, Tooltip } from "@sparrow/library/ui";
  import { PeopleIcon, PlusIcon } from "@sparrow/library/assets";
  import { base64ToURL } from "@sparrow/common/utils";
  import { Avatar } from "@sparrow/library/ui";
  import { PeopleFilled, PeopleRegular } from "@sparrow/library/icons";
  import { onMount } from "svelte";
  export let isCreateTeamModalOpen;
  export let isGuestUser;
  export let setOpenTeam;
  export let teamList = [];
  export let disableNewInviteTag;
  export let modifyTeam;
  export let activeIndex;
  onMount(() => {
    console.log(teamList);
  });
</script>

<!--Teams list-->
<section class="d-flex flex-column" style="max-height:33%;">
  <div
    class="sidebar-teams-header d-flex justify-content-between p-3 px-2 pb-0"
  >
    <h6 class="teams-heading ms-2 px-1">Teams</h6>
    <div>
      <Tooltip title="New Team" placement={"bottom-center"} distance={10}>
        <button
          class="new-team-btn d-flex align-items-center justify-content-center p-0 rounded border-0"
          on:click={() => {
            isCreateTeamModalOpen = true;
          }}
          disabled={isGuestUser}
        >
          <PlusIcon height={"14px"} width={"14px"} />
        </button>
      </Tooltip>
    </div>
  </div>
  <div class="sidebar-teams-list" style="flex:1; overflow:auto;">
    <List height={"100%"} overflowY={"auto"} classProps={"px-2 py-1"}>
      {#each teamList.slice().reverse() as team, index}
        <button
          class={`sidebar-items d-flex w-100 mb-1 
        px-3 align-items-center justify-content-between rounded teams-outer border-0 ${
          team.teamId === activeIndex ? "active" : ""
        }`}
          style={!isGuestUser
            ? "gap:4px; padding:4px; padding-left:8px;"
            : "pointer-events: none; gap:4px; padding:4px; padding-left:8px; "}
          on:click={async () => {
            await setOpenTeam(team.teamId);
            activeIndex = team.teamId;
            if (team.isNewInvite) {
              let data = await disableNewInviteTag(team.teamId);
              if (data) {
                data.isNewInvite = false;
                modifyTeam(team.teamId, data);
              }
            }
          }}
        >
          <div class=" d-flex w-100 overflow-hidden" style="gap: 4px;">
            {#if base64ToURL(team.logo) == "" || base64ToURL(team.logo) == undefined}
              <div class="" style="height: 24px; width:24px;">
                <Avatar
                  type={"letter"}
                  size={"small"}
                  letter={team.name[0]}
                  bgColor={"purple"}
                />
              </div>
            {:else}
              <img src={base64ToURL(team.logo)} alt="" />
            {/if}
            <p
              style="font-weight: 500; padding:4px 2px; font-size:12px; line-height:18px; "
              class="ellipsis sparrow-fs-12 text-left teams-title overflow-hidden my-auto"
            >
              {team.name || ""}
            </p>
          </div>
          {#if team.isNewInvite}
            <p class="mb-0 new-invite text-labelColor w-50 ellipsis">
              NEW INVITE
            </p>
          {:else}
            <Button
              size="extra-small"
              customWidth="24px"
              type="teritiary-regular"
              startIcon={team.teamId !== activeIndex
                ? PeopleRegular
                : PeopleFilled}
            />
          {/if}
        </button>
      {/each}
    </List>
  </div>
  <hr class="mb-0 pb-0" />
</section>

<style>
  .sidebar-teams-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sidebar-teams-list::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }

  .teams-heading {
    margin-left: 5px;
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
  .teams-outer {
    padding: 6px 5px;
    background-color: transparent;
  }
  .teams-outer.active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .sidebar-items {
    gap: 4px;
  }
  .new-team-btn {
    height: 20px;
    width: 20px;
    background-color: transparent;
    border: none;
  }
  .new-team-btn:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .new-team-btn:active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .new-team-btn.active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .teams-outer:focus-visible {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    outline: 2px solid var(--bg-ds-primary-300);
  }
  .teams-outer:hover {
    background-color: var(--bg-tertiary-750);
  }

  .teams-outer:active {
    background-color: var(--bg-ds-surface-500);
  }

  .teams-outer img {
    width: 25px;
    height: 25px;
    overflow: hidden;
    border-radius: 50%;
    margin-right: 8px;
  }
  .sidebar-teams-list {
    max-height: 30vh;
  }

  .sidebar-recentapi-list {
    max-height: 30vh;
  }
  .new-invite {
    font-size: 12px !important;
  }
  .teams-title {
    width: calc(100% - 40px);
    text-align: left;
  }

  .title {
    width: calc(100% - 40px);
    text-align: left;
  }
  .not-found-text {
    color: var(--request-arc);
    font-size: 12px;
  }

  .github-icon {
    padding-bottom: 50px !important;
  }
</style>
