<script lang="ts">
  import { Tooltip } from "@library/ui/tooltip";
  import plus from "$lib/assets/plus.svg";
  import { DoubleArrowIcon, GithubIcon } from "@library/icons";
  import WithButton from "@workspaces/common/hoc/WithButton.svelte";
  import type { TabDocument, TeamDocument } from "@app/database/database";
  import RecentApi from "@teams/features/recent-apis/layout/RecentApi.svelte";
  import RecentWorkspace from "@teams/features/recent-workspace/layout/RecentWorkspace.svelte";

  import { base64ToURL } from "$lib/utils/helpers";
  import { List } from "@library/ui";
  import { PeopleIcon } from "$lib/assets/app.asset";
  import { version } from "../../../../../../src-tauri/tauri.conf.json";
    import constants from "$lib/utils/constants";
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

  const externalSparrowGithub = constants.SPARROW_GITHUB;


  export let leftPanelController: {
    leftPanelCollapse: boolean;
    handleCollapseCollectionList: () => void;
  };

  let isGithubStarHover = false;

  let activeIndex ;

  const handleTeamClick = (id) => {
    setOpenTeam(id);
    activeIndex = id;
  };

  $: {
    if (openTeam) {
      activeIndex = openTeam.teamId;
    }
  }
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
    class="sidebar d-flex flex-column justify-content-between bg-secondary-900"
  >
    <div>
      <!--Teams list-->
      <section>
        <div
          class="sidebar-teams-header d-flex justify-content-between p-3 pb-0"
        >
          <h6 class="teams-heading ms-2 px-1">Teams</h6>
          <div>
            <Tooltip
              title="New Team"
              placement={"bottom"}
              styleProp={"left: -50%"}
            >
              <button
                class="new-team-btn rounded border-0"
                on:click={() => {
                  isCreateTeamModalOpen = true;
                }}
              >
                <img src={plus} alt="" />
              </button>
            </Tooltip>
          </div>
        </div>
        <div class="sidebar-teams-list">
          <List height={"calc((100vh - 230px) / 3)"} classProps={"px-2 py-1"}>
            {#each teamList as team, index}
              <button
                class={`d-flex w-100 mb-1 
            px-3 align-items-center justify-content-between rounded teams-outer border-0 ${
              team.teamId === activeIndex ? "active" : ""
            }`}
                on:click={() => handleTeamClick(team.teamId)}
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
                    class="ellipsis ms-1 text-left teams-title overflow-hidden my-auto"
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
      </section>

      <hr class="mb-0 pb-0" />

      <!-- Recent APIs-->

      <RecentApi {tabList} {data} {collectionList} {onApiClick} />

      <hr class="mb-0 pb-0" />

      <!-- Recent Workspace Section -->

      <RecentWorkspace {data} {openTeam} {OnWorkspaceSwitch} />
    </div>

    <!-- github repo section -->
    <section>
      <div
        class="p-3 d-flex align-items-center justify-content-between"
        style="z-index: 4;"
      >
        <Tooltip title={"Star Us On GitHub"} placement={"top"}>
          <div
            class="px-2 py-1 border-radius-2 d-flex align-items-center {isGithubStarHover
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
          <span class="text-fs-14 text-secondary-200 pe-2">v{version}</span>
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
  .sidebar {
    height: calc(100vh - 44px);
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
    /* background-color: var(--border-color); */
    background-color: #1c1d2b;
  }
  .new-team-btn {
    background-color: transparent;
  }
  .new-team-btn:hover {
    background-color: var(--border-color);
  }
  .teams-outer:hover {
    background-color: var(--bg-tertiary-250);
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
</style>
