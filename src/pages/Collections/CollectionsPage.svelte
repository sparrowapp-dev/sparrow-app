<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";

  import {
    collectionRightPanelWidth,
    collectionLeftPanelWidth,
    collapsibleState,
  } from "$lib/store";

  import RestExplorer from "../RestExplorer/RestExplorer.svelte";
</script>

<Splitpanes
  on:resize={(e) => {
    collectionLeftPanelWidth.set(e.detail[0].size);
    collectionRightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane size={$collapsibleState ? 0 : $collectionLeftPanelWidth}
    >Collections List</Pane
  >
  <Pane size={$collapsibleState ? 100 : $collectionRightPanelWidth}>
    Tabs
    <br />
    <Route>
      <RestExplorer />
    </Route>
  </Pane>
</Splitpanes>

<style>
</style>
