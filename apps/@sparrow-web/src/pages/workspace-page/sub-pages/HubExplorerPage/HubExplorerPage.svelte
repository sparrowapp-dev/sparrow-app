<script lang="ts">
  import type { TabDocument } from "@app/database/database";

  /**
   * folder tab document
   */
  export let tab: TabDocument;
  $: {
    console.log("Hub details page tab:", tab);
  }
</script>

<div>HUb details page</div>
