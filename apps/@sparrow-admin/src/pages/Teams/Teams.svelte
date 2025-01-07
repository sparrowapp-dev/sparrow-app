<script lang="ts">
  import {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelCollapse,
  } from "@sparrow/teams/stores";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { pagesMotion } from "../../constants";

  import { Motion } from "svelte-motion";
</script>

<Motion {...pagesMotion} let:motion>
  <div class="h-100" use:motion>
    <Splitpanes
      class="team-splitter h-100"
      style="width: calc(100vw - 54px)"
      on:resize={(e) => {
        leftPanelWidth.set(e.detail[0].size);
        rightPanelWidth.set(e.detail[1].size);
      }}
    >
      <Pane
        size={$leftPanelCollapse ? 0 : $leftPanelWidth}
        minSize={20}
        class="bg-secondary-900-important sidebar-left-panel"
      >
        {#if $leftPanelCollapse}
          <div>Left panel one</div>
        {/if}
        {#if !$leftPanelCollapse}
          <div
            class="d-flex flex-column sidebar h-100 d-flex flex-column justify-content-between bg-secondary-900"
          >
            left panel two
          </div>
        {/if}
      </Pane>
      <Pane
        size={$leftPanelCollapse ? 100 : $rightPanelWidth}
        minSize={60}
        class="bg-secondary-800-important"
      >
        <div>Right side panel</div>
      </Pane>
    </Splitpanes>
  </div>
</Motion>

<style>
  .warning-text {
    color: var(--colors-neutral-text-3, #ccc);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }
  :global(.team-splitter .splitpanes__splitter) {
    width: 6px !important;
    height: auto !important;
    background-color: var(--bg-secondary-500) !important;
    border-left: 5px solid var(--border-secondary-900) !important;
    border-right: 0px solid var(--blackColor) !important;
    border-top: 0 !important;
    border-bottom: 0 !important;
  }
  :global(
    .team-splitter .splitpanes__splitter:active,
    .team-splitter .splitpanes__splitter:hover
  ) {
    background-color: var(--bg-primary-200) !important;
  }

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
