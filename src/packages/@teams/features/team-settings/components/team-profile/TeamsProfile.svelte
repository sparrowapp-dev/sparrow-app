<script lang="ts">
  import {
    TeamOwner,
    UpdateTeamIcon,
    UpdateTeamName,
  } from "./sub-team-profile";
  import UpdateTeamDescription from "./sub-team-profile/update-team-description/UpdateTeamDescription.svelte";

  export let openTeam;
  export let onUpdateTeam;

  enum TeamProperty {
    IMAGE = "image",
    NAME = "name",
    DESCRIPTION = "description",
  }

  let teamName: string = openTeam?.name;
  let teamDescription: string = openTeam.description;
  let uploadTeamIcon = {
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

  const handleUpdateTeam = async (property: TeamProperty) => {
    const blankFile = new File([""], "blank.jpg", {
      type: "",
      lastModified: 1706698162061,
    });
    let data;
    if (property === TeamProperty.IMAGE) {
      data = {
        image:
          uploadTeamIcon.file.value.length === 0
            ? blankFile
            : uploadTeamIcon.file.value,
      };
    } else if (property === TeamProperty.NAME) {
      if (!teamName) {
        teamName = openTeam?.name;
      }
      data = {
        name: teamName,
      };
    } else if (property === TeamProperty.DESCRIPTION) {
      data = {
        description: teamDescription,
      };
    }

    await onUpdateTeam(openTeam.teamId, data);
  };
</script>

<div class="settings-content h-100">
  <div class="row px-3 pb-3">
    <UpdateTeamIcon bind:uploadTeamIcon onUpdateTeam={handleUpdateTeam} />
  </div>
  <div class="row px-3 pb-3">
    <UpdateTeamName bind:teamName onUpdateTeam={handleUpdateTeam} />
  </div>
  <div class="row px-3 pb-3">
    <TeamOwner {ownerDetails} />
  </div>
  <div class="row px-3 pb-3">
    <UpdateTeamDescription
      bind:teamDescription
      onUpdateTeam={handleUpdateTeam}
    />
  </div>
</div>
