<script>
  import {
    Button,
    ButtonV2,
    List,
    PlanTag,
    Tooltip,
  } from "@sparrow/library/ui";
  import { PeopleIcon, PlusIcon } from "@sparrow/library/assets";
  import { base64ToURL } from "@sparrow/common/utils";
  import { Avatar } from "@sparrow/library/ui";
  import {
    AddRegular,
    MoreHorizontalRegular,
    PeopleFilled,
    PeopleRegular,
  } from "@sparrow/library/icons";
  import { policyConfig } from "@sparrow/common/store";
  export let isCreateTeamModalOpen;
  export let isGuestUser;
  export let setOpenTeam;
  export let teamList = [];
  export let disableNewInviteTag;
  export let modifyTeam;
  export let threeDotIconDisable = false;
</script>

<!--Teams list-->
<section class="d-flex flex-column" style="max-height:33%;">
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
    <List height={"100%"} overflowY={"auto"} classProps={"px-2 py-1"}>
      {#each teamList.slice().reverse() as team, index}
        <button
          class={`sidebar-items d-flex w-100 mb-1 
        px-3 align-items-center justify-content-between rounded teams-outer border-0 ${
          team.isOpen ? "active" : ""
        }`}
          style={!isGuestUser
            ? "gap:4px; padding:4px; padding-left:8px;"
            : "pointer-events: none; gap:4px; padding:4px; padding-left:8px; "}
          on:click={async () => {
            await setOpenTeam(team.teamId);
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
                  size={"extra-small"}
                  letter={team.name[0]}
                  bgColor={"var(--bg-ds-secondary-400)"}
                />
              </div>
            {:else}
              <Avatar
                type={"image"}
                size={"extra-small"}
                image={base64ToURL(team.logo)}
              />
            {/if}
            <div class="d-flex align-items-center team-row-content">
              <p
                class="team-name-ellipsis ellipsis text-left teams-title overflow-hidden my-auto text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
              >
                {team.name || ""}
              </p>
              {#if team?.plan?.name}
                <span class="ps-2 team-plan-tag">
                  <PlanTag
                    plan={(team?.plan?.name || "community").toLowerCase()}
                    text={team?.plan?.label || ""}
                  />
                </span>
              {/if}
            </div>
          </div>
          {#if team.isNewInvite}
            <p class="mb-0 new-invite text-labelColor w-50 ellipsis">
              NEW INVITE
            </p>
          {:else if team?._data?.users?.length > 1}
            <Button
              size="extra-small"
              customWidth="24px"
              type="teritiary-regular"
              startIcon={!team.isOpen ? PeopleRegular : PeopleFilled}
            />
          {/if}
          {#if threeDotIconDisable}
            <Button
              size="extra-small"
              customWidth={"24px"}
              type="teritiary-regular"
              startIcon={MoreHorizontalRegular}
            />
          {/if}
        </button>
      {/each}
    </List>
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
    background-color: var(--bg-ds-surface-400);
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
  .team-row-content {
    width: 100%;
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .team-name-ellipsis {
    max-width: 90px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
  }
  .team-plan-tag {
    flex-shrink: 0;
    min-width: 0;
    max-width: 120px;
    display: flex;
    align-items: center;
  }
</style>
