<script lang="ts">
  import { SettingsNavigator, TeamProfile } from "../components";
  export let openTeam;
  export let onUpdateTeam;
</script>

<section class="h-100 pb-2 pt-2">
  <div class="d-flex h-100">
    <div class="h-100" style="width: 250px;">
      <SettingsNavigator />
    </div>
    <div class="h-100" style="width: calc(100% - 250px);">
      <TeamProfile {openTeam} {onUpdateTeam} />
    </div>
  </div>
</section>
