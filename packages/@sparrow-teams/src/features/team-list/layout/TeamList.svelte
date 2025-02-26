<script>
  import { Button, ButtonV2, List, Tooltip } from "@sparrow/library/ui";
  import { PeopleIcon, PlusIcon } from "@sparrow/library/assets";
  import { base64ToURL } from "@sparrow/common/utils";
  import { Avatar } from "@sparrow/library/ui";
  import {
    AddRegular,
    MoreHorizontalRegular,
    PeopleFilled,
    PeopleRegular,
  } from "@sparrow/library/icons";
  export let isCreateTeamModalOpen;
  export let isGuestUser;
  export let setOpenTeam;
  export let teamList = [];
  export let disableNewInviteTag;
  export let modifyTeam;
  export let activeIndex;
  export let threeDotIconDisable = false;
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
      {#each teamList.slice().reverse() as team}
        <button
          class={`d-flex w-100 mb-1 
        px-3 align-items-center justify-content-between rounded teams-outer border-0 ${
          team.teamId === activeIndex ? "active" : ""
        }`}
          style={!isGuestUser ? "" : "pointer-events: none;"}
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
          <div class=" d-flex w-100 overflow-hidden">
            {#if base64ToURL(team.logo) == "" || base64ToURL(team.logo) == undefined}
              <div class="me-2">
                <Avatar
                  type={"letter"}
                  size={"small"}
                  letter={team.name[0]}
                  bgColor={"var(--bg-tertiary-700)"}
                />
              </div>
            {:else}
              <img src={base64ToURL(team.logo)} alt="" />
            {/if}
            <p
              style="font-weight: 700;"
              class="ellipsis ms-1 sparrow-fs-12 text-left teams-title overflow-hidden my-auto"
            >
              {team.name || ""}
            </p>
          </div>
          {#if team.isNewInvite}
            <p class="mb-0 new-invite text-labelColor w-50 ellipsis">
              NEW INVITE
            </p>
          {:else}
            <PeopleIcon
              color={team.teamId === activeIndex
                ? "var(--sparrow-text-color)"
                : "var(--defaultcolor)"}
              classProp={team.users?.length <= 1 && "d-none"}
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
    background-color: var(--text-tertiary-750);
  }
  .new-team-btn {
    height: 20px;
    width: 20px;
    background-color: transparent;
  }
  .new-team-btn:hover {
    background-color: var(--border-color);
  }
  .teams-outer:hover {
    background-color: var(--bg-tertiary-750);
  }

  .teams-outer:active {
    background-color: var(--bg-secondary-320);
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
