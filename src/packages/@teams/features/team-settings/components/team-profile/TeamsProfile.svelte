<script lang="ts">
  import { TeamPropertyEnum } from "../../types";
  import type { UpdateTeamIcon as IUpdateTeamIcon } from "../../types";

  import {
    TeamOwner,
    UpdateTeamIcon,
    UpdateTeamName,
  } from "./sub-team-profile";
  import UpdateTeamDescription from "./sub-team-profile/update-team-description/UpdateTeamDescription.svelte";

  export let openTeam;
  export let onUpdateTeam;

  let teamName: string = openTeam?.name;
  let teamDescription: string = openTeam?.description;
  let uploadTeamIcon: IUpdateTeamIcon = {
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    },
  };

  if (openTeam?.logo?.bufferString) {
    uploadTeamIcon.file.value = openTeam?.logo;
  }

  let ownerDetails = {
    id: "",
    name: "",
    email: "",
  };
  openTeam?.users.forEach(
    (element: { id: string; name: string; email: string }) => {
      if (element.id === openTeam.owner) {
        ownerDetails = element;
      }
    },
  );

  /**
   * This function updates a specified property of a team. Depending on the
   * provided property, it updates the team's image, name, or description.
   * If the image property is selected but no file is provided, a blank image file
   * is used. For the name property, if no new name is provided, the current name
   * of the team is used. The updated data is then sent to the `onUpdateTeam`
   * function to apply the changes.
   *
   * @param property - The property of the team to be updated.
   * @returns A promise that resolves when the update is complete.
   */
  const handleUpdateTeam = async (property: TeamPropertyEnum) => {
    const blankFile = new File([""], "blank.jpg", {
      type: "",
      lastModified: 1706698162061,
    });
    let data;
    if (property === TeamPropertyEnum.IMAGE) {
      data = {
        image:
          uploadTeamIcon.file.value.length === 0
            ? blankFile
            : uploadTeamIcon.file.value,
      };
    } else if (property === TeamPropertyEnum.NAME) {
      if (!teamName) {
        teamName = openTeam?.name;
      }
      data = {
        name: teamName,
      };
    } else if (property === TeamPropertyEnum.DESCRIPTION) {
      data = {
        description: teamDescription,
      };
    }

    await onUpdateTeam(openTeam.teamId, data);
  };
</script>

<div class="settings-content h-100">
  <UpdateTeamIcon bind:uploadTeamIcon onUpdateTeam={handleUpdateTeam} />
  <UpdateTeamName bind:teamName onUpdateTeam={handleUpdateTeam} />
  <TeamOwner {ownerDetails} />
  <UpdateTeamDescription bind:teamDescription onUpdateTeam={handleUpdateTeam} />
</div>
