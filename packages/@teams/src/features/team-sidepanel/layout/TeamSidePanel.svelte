<script lang="ts">
  import { Tooltip } from "@sparrow/library/ui";
  import plus from "@deprecate/assets/plus.svg";
  import { DoubleArrowIcon, GithubIcon } from "@sparrow/library/icons";
  import { WithButton } from "@sparrow/workspaces/common/hoc";
  import type { TabDocument, TeamDocument } from "@app/database/database";
  import { RecentWorkspace, RecentApis } from "../../../features";
  import { open } from "@tauri-apps/plugin-shell";
  import { base64ToURL } from "@deprecate/utils/helpers";
  import { List } from "@sparrow/library/ui";
  import { PeopleIcon } from "@deprecate/assets/app.asset";
  import constants from "@app/constants/constants";
  export let teamList: TeamDocument[] = [];
  export let tabList: TabDocument[] = [];
  export let isCreateTeamModalOpen;
  export let data: any;
  export let collectionList;
  export let openTeam;
  export let onApiClick;
  export let githubRepo;
  export let setOpenTeam;
  export let OnWorkspaceSwitch;
  export let isGuestUser = false;

  export let disableNewInviteTag;
  export let modifyTeam;

  const externalSparrowGithub = constants.SPARROW_GITHUB;

  export let leftPanelController: {
    leftPanelCollapse: boolean;
    handleCollapseCollectionList: () => void;
  };

  let isGithubStarHover = false;

  let activeIndex;

  $: {
    if (openTeam) {
      activeIndex = openTeam.teamId;
    }
  }

  export let appVersion;
</script>

{#if leftPanelController.leftPanelCollapse}
  <div>
    <button
      class="d-flex align-items-center justify-content-center border-0 angleRight w-16 position-absolute {leftPanelController.leftPanelCollapse
        ? 'd-block'
        : 'd-none'}"
      style="left:52px; bottom: 20px; width: 20px; height:20px ; background-color:var(--blackColor); z-index: {leftPanelController.leftPanelCollapse
        ? '2'
        : '0'}"
      on:click={() => {
        leftPanelController.leftPanelCollapse =
          !leftPanelController.leftPanelCollapse;
        leftPanelController.handleCollapseCollectionList();
      }}
    >
      <span
        style="transform: rotate(180deg); "
        class="position-relative d-flex align-items-center justify-content-center"
      >
        <DoubleArrowIcon
          height={"10px"}
          width={"10px"}
          color={"var(--text-primary-200)"}
        />
      </span>
    </button>
  </div>
{/if}

{#if !leftPanelController.leftPanelCollapse}
  <div
    class="d-flex flex-column sidebar h-100 d-flex flex-column justify-content-between bg-secondary-900"
  >
    <div style="flex:1; overflow:auto;">
      <!--Teams list-->
      <section class="d-flex flex-column" style="max-height:33%;">
        <div
          class="sidebar-teams-header d-flex justify-content-between p-3 pb-0"
        >
          <h6 class="teams-heading ms-2 px-1">Teams</h6>
          <div>
            <Tooltip title="New Team" placement={"bottom"} distance={10}>
              <button
                class="new-team-btn rounded border-0"
                on:click={() => {
                  isCreateTeamModalOpen = true;
                }}
                disabled={isGuestUser}
              >
                <img src={plus} alt="" />
              </button>
            </Tooltip>
          </div>
        </div>
        <div class="sidebar-teams-list" style="flex:1; overflow:auto;">
          <List height={"100%"} overflowY={"auto"} classProps={"px-2 py-1"}>
            {#each teamList.slice().reverse() as team, index}
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
                    <p
                      class={`m-0 sparrow-fs-15 text-defaultColor me-2 align-items-center justify-content-center bg-transparent border-defaultColor `}
                      style={`padding-top: 2px; width: 25px !important; height: 25px !important; display: flex; border: 1px solid var(--defaultcolor); border-radius: 50%;  font-weight:700;`}
                    >
                      {team.name[0] ? team.name[0].toUpperCase() : ""}
                    </p>
                  {:else}
                    <img src={base64ToURL(team.logo)} alt="" />
                  {/if}
                  <p
                    style="font-weight: 700;"
                    class="ellipsis ms-1 sparrow-fs-12 text-left teams-title overflow-hidden my-auto"
                  >
                    {team.name}
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

      <!-- Recent APIs-->
      {#if !isGuestUser}
        <section class="d-flex flex-column" style="max-height:33%;">
          <RecentApis {tabList} {data} {collectionList} {onApiClick} />
        </section>

        <!-- Recent Workspace Section -->
        <section class="d-flex flex-column" style="max-height:33%;">
          <RecentWorkspace {data} {openTeam} {OnWorkspaceSwitch} />
        </section>
      {/if}
    </div>

    <!-- github repo section -->
    <section>
      <div
        class="p-2 d-flex align-items-center justify-content-between"
        style="z-index: 4;"
      >
        <Tooltip title={"Star Us On GitHub"} placement={"top"}>
          <div
            class=" px-2 py-1 border-radius-2 d-flex align-items-center {isGithubStarHover
              ? 'bg-secondary-600'
              : ''}"
            role="button"
            on:mouseenter={() => {
              isGithubStarHover = true;
            }}
            on:mouseleave={() => {
              isGithubStarHover = false;
            }}
            on:click={async () => {
              await open(externalSparrowGithub);
            }}
          >
            <GithubIcon
              height={"18px"}
              width={"18px"}
              color={isGithubStarHover
                ? "var(--bg-secondary-100)"
                : "var(--bg-secondary-200)"}
            />
            <span
              class="ps-2 text-fs-14 {isGithubStarHover
                ? 'text-secondary-100'
                : 'text-secondary-200'}"
            >
              {githubRepo?.stargazers_count || ""}
            </span>
          </div>
        </Tooltip>

        <div class="d-flex align-items-center">
          <span class="text-fs-14 text-secondary-200 pe-2">v{appVersion}</span>
          <WithButton
            icon={DoubleArrowIcon}
            onClick={() => {
              leftPanelController.leftPanelCollapse =
                !leftPanelController.leftPanelCollapse;
              leftPanelController.handleCollapseCollectionList();
            }}
            disable={false}
            loader={false}
          />
        </div>
      </div>
    </section>
  </div>
{/if}

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
