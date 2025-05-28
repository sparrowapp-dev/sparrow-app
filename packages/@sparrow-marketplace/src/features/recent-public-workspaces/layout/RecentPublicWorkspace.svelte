<script lang="ts">
  import { SparrowLogo } from "@sparrow/common/images";
  import { WorkspaceRegular } from "@sparrow/library/icons";
  import { List } from "@sparrow/library/ui";
  let RecentWorkspaces = [];
</script>

<div class="h-100" style="width: 270px; gap: 12px">
  <div style="padding:8px">
    <span class="text-ds-font-size-14" style="color: var(--text-ds-neutral-300)"
      >Recently visited public workspaces</span
    >
  </div>
  <hr style="color: var(--border-ds-surface-100);" />
  {#if RecentWorkspaces.length == 0}
    <div>
      <div class="container">
        <SparrowLogo width={"120px"} height={"120px"} />
      </div>
      <p
        style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;text-align:center"
      >
        You haven’t visited any <br /> workspaces yet.
      </p>
    </div>
  {:else}
    <List classProps={"px-1 py-0"}>
      {#each RecentWorkspaces as list, index}
        {#if index < 5}
          <div
            tabindex="0"
            class="recentWorkspace-tab"
            on:click={() => console.log("Workspace clicked")}
          >
            <div
              class="w-100 py-2 px-3 overflow-hidden rounded justify-content-between d-flex workspace-list-data"
            >
              <div
                class="overflow-hidden ellipsis"
                style="width: 100%; height:35px"
              >
                <p
                  class="list-name mb-0 ellipsis overflow-hidden ellipsis text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
                  style=" color:var(--text-ds-neutral-50);"
                >
                  {list?.name || ""}
                </p>
                <p
                  class="team-name mb-0 title ellipsis overflow-hidden text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-regular"
                  style=" border-radius:0; line-height:18px;"
                >
                  {list?.team?.teamName || ""}
                </p>
              </div>

              <span class={`${list.users.length <= 1 && "d-none"} my-2 me-1`}>
                <WorkspaceRegular size={"16px"} />
              </span>
            </div>
          </div>
        {/if}
      {/each}
    </List>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 54px 78px 24px;
  }
  .workspace-list-data {
    height: 48px;
    border-radius: 4px;
    padding: 4px;
    padding-left: 10px;
    margin-bottom: 2px;
  }
  .workspace-list-data:hover {
    background-color: var(--bg-ds-surface-400);
    cursor: pointer;
  }

  .workspace-list-data:active {
    background-color: var(--bg-ds-surface-500);
    cursor: pointer;
  }
</style>
