<script lang="ts">
  import type { TeamDocument } from "@app/database/database";
  import {
    WorkspaceActions,
    WorkspaceName,
    WorkspaceTeam,
  } from "../components";

  import type { WorkspaceForm } from "../types";

  /**
   * Exports
   */
  export let teamDocuments: TeamDocument[] = [];
  export let userId;
  export let handleModalState;
  export let onCreateWorkspace;

  /**
   * data
   */
  let workspaceForm: WorkspaceForm = {
    name: {
      value: "",
      isTouched: false,
      invalid: false,
    },
  };
  let selectedTeam = "";
  const handleSelectTeam = (team: string) => {
    selectedTeam = team;
  };
  let isTeamError = false;
</script>

<section>
  <WorkspaceName bind:workspaceForm />
  <WorkspaceTeam
    {teamDocuments}
    {userId}
    onSelectTeam={handleSelectTeam}
    {isTeamError}
  />
  <WorkspaceActions
    bind:workspaceForm
    {handleModalState}
    {selectedTeam}
    handleTeamError={() => (isTeamError = true)}
    {onCreateWorkspace}
  />
</section>
