<script lang="ts">
  /**
   * Components
   */
  import { Select } from "@sparrow/library/forms";

  /**
   * Constants
   */
  import { TEAM_CONFIG } from "../../constants";
  import type { TeamDocument } from "@app/database/database";
  import { base64ToURL } from "@sparrow/common/utils";

  /**
   * Exports
   */
  export let teamDocuments: TeamDocument[] = [];

  export let userId;

  export let onSelectTeam: (flag: string) => void;

  export let isTeamError = false;

  /**
   * Data
   */
  const inputId: string = "team-name-input";
  let selectedTeam = "";
  let teamTabs = [];

  $: {
    if (teamDocuments) {
      teamDocuments
        .filter((team) => {
          return (
            team?._data?.admins?.includes(userId) ||
            team?._data?.owner == userId
          );
        })
        .map((team) => ({
          id: team?._data?.teamId,
          name: team?._data?.name,
          logo: base64ToURL(team?._data?.logo),
        }));
      teamDocuments.forEach((element) => {
        teamTabs.push({
          name: element.name,
          id: element.teamId,
          logo: base64ToURL(element.logo),
        });
      });
    }
  }
  const handleSelectTeam = (flag: string) => {
    selectedTeam = flag;
    onSelectTeam(flag);
  };
</script>

<div class="pb-4 mt-3">
  <!-- 
        -- Title 
      -->
  <label for={inputId} class="text-fs-14 pb-1 text-secondary-1000"
    >{TEAM_CONFIG.TITLE}</label
  >
  <span class="text-danger-200">*</span>

  <!-- 
        -- Dropdown
      -->
  <Select
    id={"select-team"}
    data={teamTabs}
    titleId={selectedTeam}
    minHeaderWidth={"auto"}
    iconRequired={false}
    isDropIconFilled={true}
    borderType={"none"}
    borderActiveType={"none"}
    headerHighlight={""}
    headerTheme={"violet2"}
    menuItem={"v3"}
    headerFontSize={"12px"}
    maxHeaderWidth={"1285px"}
    zIndex={200}
    bodyTheme={"violet"}
    borderRounded={"2px"}
    position={"absolute"}
    onclick={(flag) => handleSelectTeam(flag)}
    placeholderText="Select Team"
  />

  <!-- 
        -- Error Messages 
      -->
  {#if isTeamError}
    <p class="mb-0 mt-1 text-fs-12 text-danger-200">
      {TEAM_CONFIG.REQUIRED_ERROR_MESSAGE}
    </p>
  {/if}
</div>
