<script lang="ts">
  import {
    formatDateInString,
  } from "$lib/utils/workspacetimeUtils";

  export let workspace: any;
</script>

<div class="col-5 pb-4">
  <div class="bg-black rounded p-4">
    <h4>{workspace.name}</h4>
    <p class="teams-workspace__para mb-1">
      <!-- <span>{workspace}</span> APIs <span class="px-1"></span> -->
      <span>{workspace?.collections?.length ?? 0}</span> COLLECTIONS
    </p>
    <p class="teams-workspace__date mb-0">
      Last updated on <span>{formatDateInString(workspace?.createdAt)}</span>
    </p>
  </div>
</div>

<style>
  .teams-workspace__para {
    font-size: 12px;
    color: #45494d;
  }
  .teams-workspace__para span {
    color: #85c2ff;
    font-size: 16px;
  }
  .teams-workspace__date {
    color: #45494d;
    font-size: 16px;
  }
  .teams-workspace__date span {
    font-size: 14px;
    color: white;
  }
</style>
