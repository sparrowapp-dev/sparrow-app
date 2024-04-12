<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";

  import {
    collectionRightPanelWidth,
    collectionLeftPanelWidth,
    collapsibleState,
  } from "$lib/store";
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import RestExplorer from "../RestExplorer/RestExplorer.svelte";
  let extend = true;
</script>

<Splitpanes
  on:resize={(e) => {
    collectionLeftPanelWidth.set(e.detail[0].size);
    collectionRightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane size={$collapsibleState ? 0 : $collectionLeftPanelWidth}>
    <!-- TODO: Add new collection list component -->
    Collections List
  </Pane>
  <Pane size={$collapsibleState ? 100 : $collectionRightPanelWidth}>
    Tabs
    <br />
    <Route>
      {#if extend}
        <Motion {...scaleMotionProps} let:motion>
          <div use:motion>
            <RestExplorer />
          </div>
        </Motion>
      {/if}
    </Route>
  </Pane>
</Splitpanes>

<style>
</style>
