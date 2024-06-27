<script lang="ts">
  import type { Observable } from "rxjs";
  import { TeamExplorer } from "@teams/features";
  import { TeamExplorerPageViewModel } from "./TeamExplorerPage.ViewModel";
  //   import type { Observable } from "rxjs";
  import type { TeamDocument } from "@app/database/database";
  const _viewModel = new TeamExplorerPageViewModel();
  const activeTeam: Observable<TeamDocument> = _viewModel.openTeam;
</script>

<TeamExplorer openTeam={$activeTeam} />
