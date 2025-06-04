<script lang="ts">
  import type { TabDocument } from "@app/database/database";
  import { HubExplorer } from "@sparrow/workspaces/features";

  /**
   * folder tab document
   */
  export let tab: TabDocument;
</script>

<HubExplorer {tab} />
